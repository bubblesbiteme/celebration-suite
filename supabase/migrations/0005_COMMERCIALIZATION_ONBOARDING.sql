create table if not exists public.tenant_onboarding (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  business_complete boolean not null default false,
  brand_complete boolean not null default false,
  email_complete boolean not null default false,
  payment_complete boolean not null default false,
  first_event_complete boolean not null default false,
  dismissed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_name text,
  buyer_email text,
  source text not null default 'manual',
  external_order_id text,
  plan_type text not null check (plan_type in ('single_event','annual_unlimited')),
  event_date date,
  amount_cents integer,
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('pending','fulfilled','canceled','refunded')),
  license_code_id uuid references public.license_codes(id) on delete set null,
  tenant_id uuid references public.tenants(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  fulfilled_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists platform_orders_source_idx on public.platform_orders(source,created_at desc);
create unique index if not exists platform_orders_external_unique on public.platform_orders(source,external_order_id) where external_order_id is not null;

create table if not exists public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references public.tenant_users(id) on delete set null,
  document_type text not null check (document_type in ('terms','privacy','eula')),
  document_version text not null,
  accepted_at timestamptz not null default now(),
  request_ip text,
  user_agent text
);
create index if not exists legal_acceptances_tenant_idx on public.legal_acceptances(tenant_id,accepted_at desc);

alter table public.tenant_onboarding enable row level security;
alter table public.platform_orders enable row level security;
alter table public.legal_acceptances enable row level security;

alter table public.licenses add column if not exists event_id uuid references public.tenant_events(id) on delete set null;
create index if not exists licenses_event_idx on public.licenses(event_id);
