alter table public.tenant_guests add column if not exists attending_count integer not null default 0;
alter table public.tenant_guests add column if not exists child_count integer not null default 0;
alter table public.tenant_guests add column if not exists seat_label text;
alter table public.tenant_guests add column if not exists accessibility_needs text;
alter table public.tenant_guests add column if not exists hotel_name text;
alter table public.tenant_guests add column if not exists transportation_notes text;
alter table public.tenant_guests add column if not exists guest_tags text;
alter table public.tenant_guests add column if not exists check_in_notes text;
alter table public.tenant_guests add column if not exists checked_in_count integer not null default 0;

alter table public.tenant_invoices add column if not exists public_token uuid default gen_random_uuid();
alter table public.tenant_invoices add column if not exists sent_at timestamptz;
alter table public.tenant_invoices add column if not exists paid_at timestamptz;
create unique index if not exists tenant_invoices_public_token_idx on public.tenant_invoices(public_token);

create table if not exists public.tenant_financial_adjustments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  type text not null check(type in ('discount','refund','fee','credit','tax')),
  label text not null,
  amount numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_financial_adjustments_event_idx on public.tenant_financial_adjustments(tenant_id,event_id,created_at desc);
alter table public.tenant_financial_adjustments enable row level security;
