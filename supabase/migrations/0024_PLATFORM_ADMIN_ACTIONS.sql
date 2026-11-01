create table if not exists public.platform_admin_actions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references public.tenants(id) on delete set null,
  target_type text not null,
  target_id text null,
  action_type text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists platform_admin_actions_tenant_created_idx on public.platform_admin_actions(tenant_id, created_at desc);
create index if not exists platform_admin_actions_created_idx on public.platform_admin_actions(created_at desc);
alter table public.platform_admin_actions enable row level security;
comment on table public.platform_admin_actions is 'Platform owner administrative action history. Service-role access only.';
