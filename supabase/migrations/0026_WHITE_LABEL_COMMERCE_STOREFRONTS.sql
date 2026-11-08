-- v0.35 White-label commerce storefronts: instant booking, decor rentals, checkout recovery
create extension if not exists pgcrypto;

create table if not exists public.tenant_commerce_settings (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  instant_book_enabled boolean not null default false,
  rental_store_enabled boolean not null default false,
  booking_intro text,
  rental_intro text,
  booking_terms text,
  rental_terms text,
  booking_hold_hours integer not null default 4,
  rental_hold_hours integer not null default 4,
  max_general_events_per_day integer not null default 2,
  max_exclusive_events_per_day integer not null default 1,
  recovery_enabled boolean not null default true,
  recovery_first_minutes integer not null default 30,
  recovery_second_hours integer not null default 72,
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_booking_packages (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null, event_type text, description text, price numeric(12,2) not null default 0,
  deposit_type text not null default 'percent' check(deposit_type in ('full','percent','fixed')),
  deposit_value numeric(12,2) not null default 50,
  booking_class text not null default 'general' check(booking_class in ('general','exclusive')),
  duration_hours numeric(8,2), active boolean not null default true, sort_order integer not null default 100,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.tenant_booking_addons (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null, description text, price numeric(12,2) not null default 0,
  active boolean not null default true, sort_order integer not null default 100,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.tenant_booking_orders (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  public_token uuid not null default gen_random_uuid(), package_id uuid references public.tenant_booking_packages(id) on delete set null,
  customer_name text not null, customer_email text not null, customer_phone text,
  event_date date not null, venue text, notes text, addon_ids jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0, amount_due_now numeric(12,2) not null default 0,
  status text not null default 'pending' check(status in ('pending','paid','booked','abandoned','expired','canceled','failed')),
  stripe_session_id text, hold_expires_at timestamptz, reminder_count integer not null default 0,
  next_recovery_at timestamptz, last_recovery_at timestamptz, event_id uuid references public.tenant_events(id) on delete set null,
  paid_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(public_token)
);

create table if not exists public.tenant_rental_orders (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  public_token uuid not null default gen_random_uuid(), customer_name text not null, customer_email text not null,
  customer_phone text, start_date date not null, end_date date not null, notes text,
  subtotal numeric(12,2) not null default 0, status text not null default 'pending'
    check(status in ('pending','requested','paid','reserved','checked_out','returned','abandoned','expired','canceled','failed')),
  stripe_session_id text, hold_expires_at timestamptz, reminder_count integer not null default 0,
  next_recovery_at timestamptz, last_recovery_at timestamptz, paid_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(public_token)
);

create table if not exists public.tenant_rental_order_items (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  order_id uuid not null references public.tenant_rental_orders(id) on delete cascade,
  inventory_item_id uuid not null references public.tenant_inventory_items(id) on delete restrict,
  item_name text not null, quantity integer not null check(quantity > 0), unit_price numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0, created_at timestamptz not null default now()
);

create table if not exists public.tenant_rental_reservations (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  order_id uuid not null references public.tenant_rental_orders(id) on delete cascade,
  inventory_item_id uuid not null references public.tenant_inventory_items(id) on delete restrict,
  start_date date not null, end_date date not null, quantity integer not null check(quantity > 0),
  status text not null default 'reserved' check(status in ('reserved','checked_out','returned','canceled')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(order_id, inventory_item_id)
);

create index if not exists tenant_booking_orders_date_idx on public.tenant_booking_orders(tenant_id,event_date,status);
create index if not exists tenant_rental_orders_dates_idx on public.tenant_rental_orders(tenant_id,start_date,end_date,status);
create index if not exists tenant_rental_reservations_dates_idx on public.tenant_rental_reservations(tenant_id,inventory_item_id,start_date,end_date,status);

alter table public.tenant_commerce_settings enable row level security;
alter table public.tenant_booking_packages enable row level security;
alter table public.tenant_booking_addons enable row level security;
alter table public.tenant_booking_orders enable row level security;
alter table public.tenant_rental_orders enable row level security;
alter table public.tenant_rental_order_items enable row level security;
alter table public.tenant_rental_reservations enable row level security;
