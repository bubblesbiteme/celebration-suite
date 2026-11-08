create extension if not exists pgcrypto;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  slug text not null unique,
  status text not null default 'pending_license' check (status in ('pending_license','active','suspended','closed')),
  branding jsonb not null default '{"primary":"#A9B89A","secondary":"#37243F","accent":"#D9BE8C","logo_url":null}'::jsonb,
  reply_to_email text,
  from_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null default 'owner' check (role in ('owner','admin','planner','staff')),
  password_hash text not null,
  password_salt text not null,
  status text not null default 'active' check (status in ('active','disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_users_tenant_idx on public.tenant_users(tenant_id);

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  plan_type text not null check (plan_type in ('single_event','annual_unlimited')),
  status text not null default 'active' check (status in ('active','grace','expired','canceled','replaced')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  event_date date,
  source text,
  source_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists licenses_tenant_status_idx on public.licenses(tenant_id,status,expires_at desc);

create table if not exists public.license_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  plan_type text not null check (plan_type in ('single_event','annual_unlimited')),
  source text default 'manual',
  note text,
  redeemed_at timestamptz,
  redeemed_by_tenant_id uuid references public.tenants(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_integrations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  kind text not null,
  provider text not null,
  config_encrypted text not null,
  status text not null default 'configured',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id,kind)
);

create table if not exists public.tenant_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  event_type text,
  event_date date,
  venue text,
  client_name text,
  client_email text,
  status text not null default 'active' check (status in ('active','completed','archived','canceled')),
  workspace_data jsonb not null default '{}'::jsonb,
  client_portal_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_events_tenant_date_idx on public.tenant_events(tenant_id,event_date);
create unique index if not exists tenant_events_portal_token_idx on public.tenant_events(client_portal_token);

create table if not exists public.platform_admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.tenants enable row level security;
alter table public.tenant_users enable row level security;
alter table public.licenses enable row level security;
alter table public.license_codes enable row level security;
alter table public.tenant_integrations enable row level security;
alter table public.tenant_events enable row level security;
alter table public.platform_admins enable row level security;

-- This app intentionally uses server-side Netlify functions with the Supabase service role.
-- Do not expose SUPABASE_SERVICE_ROLE_KEY to browsers.

create or replace function public.expire_white_label_licenses()
returns void language plpgsql security definer set search_path=public as $$
begin
  update public.licenses set status='expired',updated_at=now()
  where status in ('active','grace') and expires_at <= now();
  update public.tenants t set status='pending_license',updated_at=now()
  where status='active' and not exists (
    select 1 from public.licenses l where l.tenant_id=t.id and l.status in ('active','grace') and l.expires_at>now()
  );
end $$;
