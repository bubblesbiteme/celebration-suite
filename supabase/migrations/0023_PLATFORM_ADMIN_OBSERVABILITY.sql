create table if not exists public.platform_error_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null,
  user_email text null,
  page_path text not null default '',
  message text not null,
  stack text null,
  source text null,
  severity text not null default 'error',
  context jsonb not null default '{}'::jsonb,
  user_agent text null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz null,
  resolved_by text null,
  resolution text null
);
create index if not exists platform_error_logs_tenant_created_idx on public.platform_error_logs(tenant_id, created_at desc);
create index if not exists platform_error_logs_created_idx on public.platform_error_logs(created_at desc);
alter table public.platform_error_logs enable row level security;
comment on table public.platform_error_logs is 'Platform-owner runtime diagnostics. Service-role access only.';
