-- Celebration Suite v0.6: monthly subscription billing + unified email/Google sign-in

-- Expand tenant and license states for subscription billing.
alter table public.tenants drop constraint if exists tenants_status_check;
alter table public.tenants add constraint tenants_status_check check (status in ('pending_license','active','billing_suspended','suspended','closed'));

alter table public.licenses drop constraint if exists licenses_plan_type_check;
alter table public.licenses add constraint licenses_plan_type_check check (plan_type in ('single_event','monthly_unlimited','annual_unlimited'));
alter table public.licenses drop constraint if exists licenses_status_check;
alter table public.licenses add constraint licenses_status_check check (status in ('active','past_due','grace','suspended','expired','canceled','replaced'));
alter table public.licenses add column if not exists stripe_subscription_id text;
alter table public.licenses add column if not exists stripe_customer_id text;
alter table public.licenses add column if not exists current_period_end timestamptz;
alter table public.licenses add column if not exists past_due_at timestamptz;
alter table public.licenses add column if not exists grace_until timestamptz;
alter table public.licenses add column if not exists last_payment_at timestamptz;
create unique index if not exists licenses_stripe_subscription_unique on public.licenses(stripe_subscription_id) where stripe_subscription_id is not null;

-- Google-only team users are allowed to have no local password.
alter table public.tenant_users alter column password_hash drop not null;
alter table public.tenant_users alter column password_salt drop not null;
alter table public.tenant_users add column if not exists auth_provider text not null default 'password';
alter table public.tenant_users add column if not exists google_subject text;
alter table public.tenant_users add column if not exists last_login_at timestamptz;

-- Platform owner/admin can use email/password or Google instead of the emergency key.
alter table public.platform_admins add column if not exists full_name text;
alter table public.platform_admins add column if not exists password_hash text;
alter table public.platform_admins add column if not exists password_salt text;
alter table public.platform_admins add column if not exists auth_provider text not null default 'password';
alter table public.platform_admins add column if not exists google_subject text;
alter table public.platform_admins add column if not exists role text not null default 'owner';
alter table public.platform_admins add column if not exists status text not null default 'active';
alter table public.platform_admins add column if not exists last_login_at timestamptz;

-- White-label client accounts. One client may have access to multiple events for the same planner.
create table if not exists public.tenant_client_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null,
  full_name text,
  password_hash text,
  password_salt text,
  auth_provider text not null default 'password',
  google_subject text,
  status text not null default 'active' check(status in ('active','disabled')),
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id,email)
);
create index if not exists tenant_client_users_tenant_idx on public.tenant_client_users(tenant_id);

create table if not exists public.tenant_client_event_access (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_user_id uuid not null references public.tenant_client_users(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(client_user_id,event_id)
);
create index if not exists tenant_client_event_access_event_idx on public.tenant_client_event_access(event_id);

alter table public.tenant_client_users enable row level security;
alter table public.tenant_client_event_access enable row level security;

-- Platform orders also record direct monthly Stripe purchases.
alter table public.platform_orders drop constraint if exists platform_orders_plan_type_check;
alter table public.platform_orders add constraint platform_orders_plan_type_check check (plan_type in ('single_event','monthly_unlimited','annual_unlimited'));

-- License codes remain one-time/annual because Monthly Unlimited must retain recurring billing.

create or replace function public.expire_white_label_licenses()
returns void language plpgsql security definer set search_path=public as $$
begin
  -- If a monthly renewal period ended without a success webhook, enter internal recovery.
  update public.licenses
     set status='past_due',
         past_due_at=coalesce(past_due_at,now()),
         grace_until=coalesce(grace_until,now()+interval '30 days'),
         updated_at=now()
   where plan_type='monthly_unlimited'
     and status='active'
     and expires_at<=now();

  -- Monthly subscriptions become blocked only after the internal recovery window.
  update public.licenses
     set status='suspended',updated_at=now()
   where plan_type='monthly_unlimited'
     and status='past_due'
     and grace_until is not null
     and grace_until<=now();

  -- One-time and annual terms expire normally.
  update public.licenses
     set status='expired',updated_at=now()
   where plan_type<>'monthly_unlimited'
     and status in ('active','grace')
     and expires_at<=now();

  -- Restore tenants that have a usable entitlement.
  update public.tenants t
     set status='active',updated_at=now()
   where status='billing_suspended'
     and exists (
       select 1 from public.licenses l
        where l.tenant_id=t.id
          and (
            (l.status in ('active','grace') and l.expires_at>now()) or
            (l.status='past_due' and l.grace_until>now())
          )
     );

  -- Billing suspension preserves data but blocks active planning.
  update public.tenants t
     set status='billing_suspended',updated_at=now()
   where status='active'
     and exists (select 1 from public.licenses l where l.tenant_id=t.id and l.plan_type='monthly_unlimited')
     and not exists (
       select 1 from public.licenses l
        where l.tenant_id=t.id
          and (
            (l.status in ('active','grace') and l.expires_at>now()) or
            (l.status='past_due' and l.grace_until>now())
          )
     );

  -- Non-monthly accounts with no usable entitlement return to the activation state.
  update public.tenants t
     set status='pending_license',updated_at=now()
   where status='active'
     and not exists (select 1 from public.licenses ml where ml.tenant_id=t.id and ml.plan_type='monthly_unlimited')
     and not exists (
       select 1 from public.licenses l
        where l.tenant_id=t.id and l.status in ('active','grace') and l.expires_at>now()
     );
end $$;
