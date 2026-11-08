-- v0.21 Deep Operations & Workspace Parity
create table if not exists public.tenant_vendor_operations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  vendor_id uuid references public.tenant_vendors(id) on delete set null,
  vendor_name text,
  role text,
  contact_name text,
  contact_phone text,
  contact_email text,
  scheduled_arrival timestamptz,
  load_in_start timestamptz,
  load_in_end timestamptz,
  assigned_area text,
  responsibilities text,
  access_instructions text,
  day_of_notes text,
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_vendor_operations_event_idx on public.tenant_vendor_operations(tenant_id,event_id,scheduled_arrival);

create table if not exists public.tenant_event_emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  label text not null,
  name text,
  phone text,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_event_emergency_contacts_event_idx on public.tenant_event_emergency_contacts(tenant_id,event_id,sort_order);
