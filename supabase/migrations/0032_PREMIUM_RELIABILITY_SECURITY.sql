-- Celebration Suite v1.1.0 premium reliability/security hardening
-- Safe, additive primitives used by server functions for login throttling and auditability.

create table if not exists public.tenant_auth_rate_limits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null,
  action text not null,
  identity_hash text not null,
  attempt_count integer not null default 1,
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz null,
  last_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(action, identity_hash)
);

alter table public.tenant_auth_rate_limits enable row level security;
revoke all on public.tenant_auth_rate_limits from anon, authenticated;

create index if not exists tenant_auth_rate_limits_blocked_idx
  on public.tenant_auth_rate_limits (action, identity_hash, blocked_until);

comment on table public.tenant_auth_rate_limits is
  'Service-role-only authentication throttling ledger. Never expose raw identity values; store a one-way hash.';
