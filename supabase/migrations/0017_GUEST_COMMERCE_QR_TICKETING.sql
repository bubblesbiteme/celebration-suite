-- v0.17 Guest Commerce, QR Ticketing & Unified Check-In
create extension if not exists pgcrypto;

create table if not exists public.tenant_registration_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  public_token uuid not null default gen_random_uuid(),
  enabled boolean not null default false,
  title text,
  description text,
  capacity integer,
  sales_open_at timestamptz,
  sales_close_at timestamptz,
  require_phone boolean not null default false,
  collect_organization boolean not null default false,
  confirmation_message text,
  refund_policy text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id,event_id), unique(public_token)
);

alter table public.tenant_registration_types add column if not exists description text;
alter table public.tenant_registration_types add column if not exists sort_order integer not null default 100;

create table if not exists public.tenant_registration_promos (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade, code text not null,
  discount_type text not null default 'percent' check(discount_type in ('percent','fixed')),
  discount_value numeric(12,2) not null default 0, max_uses integer, uses integer not null default 0,
  active boolean not null default true, expires_at timestamptz, created_at timestamptz not null default now(),
  unique(event_id,code)
);

create table if not exists public.tenant_ticket_orders (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade, public_token uuid not null default gen_random_uuid(),
  buyer_name text not null, buyer_email text not null, buyer_phone text, organization text,
  subtotal numeric(12,2) not null default 0, discount numeric(12,2) not null default 0, total numeric(12,2) not null default 0,
  promo_code text, status text not null default 'pending' check(status in ('pending','paid','free','canceled','refunded','failed')),
  stripe_session_id text, stripe_payment_intent_id text, paid_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(public_token)
);

create table if not exists public.tenant_ticket_attendees (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  order_id uuid not null references public.tenant_ticket_orders(id) on delete cascade,
  registration_type_id uuid references public.tenant_registration_types(id) on delete set null,
  ticket_code text not null, first_name text not null, last_name text, email text, phone text, organization text,
  status text not null default 'active' check(status in ('active','canceled','refunded')),
  checked_in_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(ticket_code)
);

alter table public.tenant_guests add column if not exists qr_payload text;
update public.tenant_guests set qr_payload='CSGUEST:'||invitation_code where qr_payload is null and invitation_code is not null;

create index if not exists tenant_ticket_orders_event_idx on public.tenant_ticket_orders(tenant_id,event_id,created_at desc);
create index if not exists tenant_ticket_attendees_event_idx on public.tenant_ticket_attendees(tenant_id,event_id,checked_in_at);
create index if not exists tenant_ticket_attendees_order_idx on public.tenant_ticket_attendees(order_id);
create index if not exists tenant_registration_promos_event_idx on public.tenant_registration_promos(tenant_id,event_id);

alter table public.tenant_registration_settings enable row level security;
alter table public.tenant_registration_promos enable row level security;
alter table public.tenant_ticket_orders enable row level security;
alter table public.tenant_ticket_attendees enable row level security;
