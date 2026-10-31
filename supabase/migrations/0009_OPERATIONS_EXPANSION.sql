-- v0.8 Operations Expansion
create table if not exists public.tenant_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.tenant_events(id) on delete set null,
  lead_id uuid references public.tenant_leads(id) on delete set null,
  client_id uuid references public.tenant_clients(id) on delete set null,
  channel text not null default 'email' check(channel in ('email','sms','note')),
  direction text not null default 'outbound' check(direction in ('outbound','inbound','internal')),
  recipient text,
  sender text,
  subject text,
  body text not null,
  status text not null default 'draft' check(status in ('draft','queued','sent','delivered','failed','received')),
  provider_message_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists tenant_messages_idx on public.tenant_messages(tenant_id,created_at desc);

create table if not exists public.tenant_referrals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.tenant_events(id) on delete cascade,
  lead_id uuid references public.tenant_leads(id) on delete set null,
  partner_name text not null,
  partner_email text,
  commission_type text not null default 'percent' check(commission_type in ('percent','flat')),
  commission_rate numeric(12,2) not null default 0,
  eligible_revenue numeric(12,2) not null default 0,
  commission_amount numeric(12,2) not null default 0,
  status text not null default 'pending' check(status in ('pending','earned','paid','void')),
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_referrals_idx on public.tenant_referrals(tenant_id,status,created_at desc);

create table if not exists public.tenant_change_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  title text not null,
  description text,
  amount_delta numeric(12,2) not null default 0,
  status text not null default 'draft' check(status in ('draft','sent','approved','declined','void')),
  client_name text,
  client_email text,
  public_token uuid not null default gen_random_uuid(),
  sent_at timestamptz,
  decided_at timestamptz,
  client_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists tenant_change_orders_token_idx on public.tenant_change_orders(public_token);
create index if not exists tenant_change_orders_event_idx on public.tenant_change_orders(tenant_id,event_id,created_at desc);

create table if not exists public.tenant_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.tenant_events(id) on delete cascade,
  client_id uuid references public.tenant_clients(id) on delete set null,
  title text not null,
  category text,
  file_url text not null,
  file_name text,
  mime_type text,
  visibility text not null default 'internal' check(visibility in ('internal','client')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_documents_idx on public.tenant_documents(tenant_id,event_id,created_at desc);

alter table public.tenant_inventory_items add column if not exists image_url text;
alter table public.tenant_inventory_items add column if not exists storage_location text;
alter table public.tenant_inventory_items add column if not exists condition text not null default 'good';
alter table public.tenant_inventory_items add column if not exists rentable boolean not null default false;
alter table public.tenant_inventory_items add column if not exists rental_price numeric(12,2) not null default 0;
alter table public.tenant_inventory_items add column if not exists barcode text;
alter table public.tenant_inventory_reservations add column if not exists checked_out_at timestamptz;
alter table public.tenant_inventory_reservations add column if not exists checked_in_at timestamptz;
alter table public.tenant_inventory_reservations add column if not exists return_condition text;

alter table public.tenant_messages enable row level security;
alter table public.tenant_referrals enable row level security;
alter table public.tenant_change_orders enable row level security;
alter table public.tenant_documents enable row level security;
