create table if not exists public.tenant_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  hostname text not null unique,
  verification_token text not null,
  status text not null default 'pending' check (status in ('pending','verified','provisioned','failed')),
  dns_verified_at timestamptz,
  provisioned_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_domains_tenant_idx on public.tenant_domains(tenant_id);

create table if not exists public.tenant_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references public.tenant_users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_push_subscriptions_tenant_idx on public.tenant_push_subscriptions(tenant_id,active);

alter table public.tenant_integrations add column if not exists last_checked_at timestamptz;
alter table public.tenant_integrations add column if not exists last_success_at timestamptz;
alter table public.tenant_integrations add column if not exists last_error text;
alter table public.tenant_integrations add column if not exists needs_reconnect boolean not null default false;

alter table public.tenant_domains enable row level security;
alter table public.tenant_push_subscriptions enable row level security;
