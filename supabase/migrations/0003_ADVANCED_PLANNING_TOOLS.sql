create table if not exists public.tenant_vendors (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.tenant_events(id) on delete set null,
  business_name text not null,
  category text,
  contact_name text,
  email text,
  phone text,
  website text,
  quoted_amount numeric(12,2),
  contracted_amount numeric(12,2),
  paid_amount numeric(12,2) not null default 0,
  status text not null default 'prospect' check(status in ('prospect','contacted','quoted','booked','completed','declined')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_vendors_tenant_event_idx on public.tenant_vendors(tenant_id,event_id,category);

create table if not exists public.tenant_inventory_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  category text,
  sku text,
  quantity integer not null default 1 check(quantity>=0),
  replacement_value numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id,sku)
);
create table if not exists public.tenant_inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  inventory_item_id uuid not null references public.tenant_inventory_items(id) on delete cascade,
  quantity integer not null default 1 check(quantity>0),
  created_at timestamptz not null default now(),
  unique(event_id,inventory_item_id)
);
create index if not exists tenant_inventory_reservation_idx on public.tenant_inventory_reservations(tenant_id,event_id,inventory_item_id);

create table if not exists public.tenant_guests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  party_size integer not null default 1 check(party_size>0),
  rsvp_status text not null default 'pending' check(rsvp_status in ('pending','attending','declined','waitlist')),
  meal_choice text,
  dietary text,
  table_name text,
  checkin_code uuid not null default gen_random_uuid(),
  checked_in_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists tenant_guests_checkin_code_idx on public.tenant_guests(checkin_code);
create index if not exists tenant_guests_event_idx on public.tenant_guests(tenant_id,event_id,rsvp_status);

create table if not exists public.tenant_registration_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  name text not null,
  price numeric(12,2) not null default 0,
  capacity integer,
  sale_start timestamptz,
  sale_end timestamptz,
  active boolean not null default true,
  public_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists tenant_registration_types_token_idx on public.tenant_registration_types(public_token);

create table if not exists public.tenant_registrations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  registration_type_id uuid references public.tenant_registration_types(id) on delete set null,
  full_name text not null,
  email text,
  quantity integer not null default 1 check(quantity>0),
  amount numeric(12,2) not null default 0,
  payment_status text not null default 'free' check(payment_status in ('free','pending','paid','refunded','canceled')),
  stripe_session_id text,
  checkin_code uuid not null default gen_random_uuid(),
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists tenant_registrations_checkin_code_idx on public.tenant_registrations(checkin_code);
create index if not exists tenant_registrations_event_idx on public.tenant_registrations(tenant_id,event_id,created_at desc);

create table if not exists public.tenant_appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.tenant_events(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  attendee_name text,
  attendee_email text,
  status text not null default 'scheduled' check(status in ('scheduled','completed','canceled','no_show')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_appointments_tenant_idx on public.tenant_appointments(tenant_id,starts_at);

create table if not exists public.tenant_approvals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending' check(status in ('pending','approved','changes_requested','rejected')),
  client_note text,
  public_token uuid not null default gen_random_uuid(),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists tenant_approvals_public_token_idx on public.tenant_approvals(public_token);

create table if not exists public.tenant_floorplans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  name text not null default 'Main Floor Plan',
  width integer not null default 1200,
  height integer not null default 800,
  objects jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id,name)
);

alter table public.tenant_vendors enable row level security;
alter table public.tenant_inventory_items enable row level security;
alter table public.tenant_inventory_reservations enable row level security;
alter table public.tenant_guests enable row level security;
alter table public.tenant_registration_types enable row level security;
alter table public.tenant_registrations enable row level security;
alter table public.tenant_appointments enable row level security;
alter table public.tenant_approvals enable row level security;
alter table public.tenant_floorplans enable row level security;
