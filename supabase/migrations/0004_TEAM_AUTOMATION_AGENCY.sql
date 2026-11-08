alter table public.tenant_users add column if not exists permissions jsonb not null default '{}'::jsonb;
alter table public.tenant_users add column if not exists last_login_at timestamptz;
alter table public.tenant_users add column if not exists hourly_rate numeric(12,2) not null default 0;

create table if not exists public.tenant_staff_invites (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'staff' check(role in ('admin','planner','staff')),
  permissions jsonb not null default '{}'::jsonb,
  invite_token uuid not null default gen_random_uuid(),
  expires_at timestamptz not null default (now()+interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists tenant_staff_invites_token_idx on public.tenant_staff_invites(invite_token);
create index if not exists tenant_staff_invites_tenant_idx on public.tenant_staff_invites(tenant_id,created_at desc);

create table if not exists public.tenant_event_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  user_id uuid not null references public.tenant_users(id) on delete cascade,
  assignment_role text not null default 'team',
  notes text,
  created_at timestamptz not null default now(),
  unique(event_id,user_id)
);
create index if not exists tenant_event_assignments_user_idx on public.tenant_event_assignments(tenant_id,user_id,event_id);

create table if not exists public.tenant_time_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.tenant_events(id) on delete cascade,
  user_id uuid not null references public.tenant_users(id) on delete cascade,
  clock_in timestamptz not null,
  clock_out timestamptz,
  break_minutes integer not null default 0 check(break_minutes>=0),
  hourly_cost numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_time_entries_idx on public.tenant_time_entries(tenant_id,user_id,clock_in desc);

create table if not exists public.tenant_automation_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  rule_type text not null check(rule_type in ('stale_lead','overdue_invoice','event_countdown','client_task_reminder','post_event_closeout')),
  enabled boolean not null default true,
  name text not null,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id,rule_type)
);
create index if not exists tenant_automation_rules_idx on public.tenant_automation_rules(tenant_id,enabled);

create table if not exists public.tenant_automation_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  rule_id uuid references public.tenant_automation_rules(id) on delete set null,
  entity_type text,
  entity_id uuid,
  dedupe_key text not null,
  status text not null default 'sent' check(status in ('sent','skipped','failed','completed')),
  detail text,
  ran_at timestamptz not null default now(),
  unique(tenant_id,dedupe_key)
);
create index if not exists tenant_automation_runs_idx on public.tenant_automation_runs(tenant_id,ran_at desc);

create table if not exists public.tenant_event_closeouts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  status text not null default 'open' check(status in ('open','completed','reopened')),
  completed_at timestamptz,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id)
);

alter table public.tenant_staff_invites enable row level security;
alter table public.tenant_event_assignments enable row level security;
alter table public.tenant_time_entries enable row level security;
alter table public.tenant_automation_rules enable row level security;
alter table public.tenant_automation_runs enable row level security;
alter table public.tenant_event_closeouts enable row level security;
