-- v0.9 Integrations, Planning & Security
create table if not exists public.tenant_calendar_blocks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  source text not null default 'manual' check(source in ('manual','google')),
  external_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id,source,external_id)
);
create index if not exists tenant_calendar_blocks_range_idx on public.tenant_calendar_blocks(tenant_id,starts_at,ends_at);

create table if not exists public.tenant_inspiration_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  inventory_item_id uuid references public.tenant_inventory_items(id) on delete set null,
  image_url text not null,
  title text,
  notes text,
  x numeric(8,3) not null default 8,
  y numeric(8,3) not null default 8,
  width numeric(8,3) not null default 26,
  z_index integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_inspiration_items_event_idx on public.tenant_inspiration_items(tenant_id,event_id,z_index);

alter table public.tenant_users add column if not exists totp_secret_encrypted text;
alter table public.tenant_users add column if not exists totp_enabled boolean not null default false;
alter table public.tenant_client_users add column if not exists totp_secret_encrypted text;
alter table public.tenant_client_users add column if not exists totp_enabled boolean not null default false;

alter table public.tenant_inventory_reservations add column if not exists checkout_notes text;
alter table public.tenant_inventory_reservations add column if not exists checked_out_by uuid references public.tenant_users(id) on delete set null;
alter table public.tenant_inventory_reservations add column if not exists checked_in_by uuid references public.tenant_users(id) on delete set null;

alter table public.tenant_calendar_blocks enable row level security;
alter table public.tenant_inspiration_items enable row level security;
