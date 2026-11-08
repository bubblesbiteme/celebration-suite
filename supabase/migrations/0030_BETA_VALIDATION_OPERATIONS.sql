-- Celebration Suite v1.0.1: deployment + beta validation operations
create table if not exists public.platform_beta_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  environment text not null default 'staging' check (environment in ('staging','production')),
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  release_version text not null default '1.0.1',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_by text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_beta_checks (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.platform_beta_runs(id) on delete cascade,
  category text not null,
  test_key text not null,
  title text not null,
  description text,
  severity text not null default 'P1' check (severity in ('P0','P1','P2')),
  status text not null default 'pending' check (status in ('pending','pass','fail','blocked','not_applicable')),
  evidence text,
  notes text,
  sort_order integer not null default 0,
  tested_at timestamptz,
  tested_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(run_id,test_key)
);

create table if not exists public.platform_beta_issues (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.platform_beta_runs(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  check_id uuid references public.platform_beta_checks(id) on delete set null,
  severity text not null default 'P1' check (severity in ('P0','P1','P2')),
  status text not null default 'open' check (status in ('open','in_progress','fixed','wont_fix','deferred')),
  title text not null,
  description text,
  reproduction_steps text,
  resolution text,
  owner text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists platform_beta_runs_tenant_idx on public.platform_beta_runs(tenant_id,created_at desc);
create index if not exists platform_beta_checks_run_idx on public.platform_beta_checks(run_id,sort_order);
create index if not exists platform_beta_issues_run_idx on public.platform_beta_issues(run_id,severity,status);

alter table public.platform_beta_runs enable row level security;
alter table public.platform_beta_checks enable row level security;
alter table public.platform_beta_issues enable row level security;
