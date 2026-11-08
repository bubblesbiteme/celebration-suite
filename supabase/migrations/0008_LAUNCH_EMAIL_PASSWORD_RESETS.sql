-- Celebration Suite v0.7: transactional email, password reset, launch health support
create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  account_type text not null check(account_type in ('tenant','platform','client')),
  user_id uuid not null,
  tenant_id uuid references public.tenants(id) on delete cascade,
  email text not null,
  token_hash text not null unique,
  context jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  used_at timestamptz,
  request_ip text,
  created_at timestamptz not null default now()
);
create index if not exists password_reset_lookup_idx on public.password_reset_tokens(token_hash,expires_at);
create index if not exists password_reset_email_idx on public.password_reset_tokens(email,created_at desc);
alter table public.password_reset_tokens enable row level security;
