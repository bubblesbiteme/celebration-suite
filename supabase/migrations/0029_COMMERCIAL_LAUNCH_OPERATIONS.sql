-- Celebration Suite v0.38: commercial launch operations

alter table public.tenants add column if not exists onboarding_completed_at timestamptz;
alter table public.tenants add column if not exists activation_reviewed_at timestamptz;
alter table public.tenants add column if not exists activation_reviewed_by text;
alter table public.tenants add column if not exists launch_blocked boolean not null default false;
alter table public.tenants add column if not exists launch_block_reason text;

alter table public.licenses add column if not exists trial_ends_at timestamptz;
alter table public.licenses add column if not exists entitlement_snapshot jsonb not null default '{}'::jsonb;

create table if not exists public.platform_release_notices (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  title text not null,
  body text not null,
  severity text not null default 'info' check (severity in ('info','important','maintenance')),
  published_at timestamptz not null default now(),
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_release_notice_reads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.tenant_users(id) on delete cascade,
  notice_id uuid not null references public.platform_release_notices(id) on delete cascade,
  read_at timestamptz not null default now(),
  unique(user_id,notice_id)
);

alter table public.tenant_support_tickets add column if not exists escalated_at timestamptz;
alter table public.tenant_support_tickets add column if not exists escalation_reason text;
alter table public.tenant_support_tickets add column if not exists sla_due_at timestamptz;
alter table public.tenant_support_tickets add column if not exists assigned_to text;
alter table public.tenant_support_tickets add column if not exists internal_notes text;

create index if not exists tenant_support_escalation_idx on public.tenant_support_tickets(status,priority,escalated_at,sla_due_at);
create index if not exists release_notices_active_idx on public.platform_release_notices(active,published_at desc);

alter table public.platform_release_notices enable row level security;
alter table public.tenant_release_notice_reads enable row level security;

create or replace function public.escalate_overdue_support_tickets()
returns integer language plpgsql security definer set search_path=public as $$
declare changed integer;
begin
  update public.tenant_support_tickets
     set escalated_at=coalesce(escalated_at,now()),
         escalation_reason=coalesce(escalation_reason,'SLA deadline exceeded'),
         updated_at=now()
   where status not in ('resolved','closed')
     and sla_due_at is not null
     and sla_due_at<=now()
     and escalated_at is null;
  get diagnostics changed = row_count;
  return changed;
end $$;
