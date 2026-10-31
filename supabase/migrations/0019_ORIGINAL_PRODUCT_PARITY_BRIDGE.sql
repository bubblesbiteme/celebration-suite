-- v0.20 Original Product Parity Bridge
-- Ports dense operational behaviors from the Sage & Celebration source product.

alter table public.tenant_events add column if not exists service_fee numeric(12,2) not null default 0;
alter table public.tenant_events add column if not exists client_decor_budget numeric(12,2) not null default 0;
alter table public.tenant_events add column if not exists contract_total numeric(12,2) not null default 0;

alter table public.tenant_event_assignments add column if not exists call_time timestamptz;
alter table public.tenant_event_assignments add column if not exists shift_end timestamptz;
alter table public.tenant_event_assignments add column if not exists hourly_rate_override numeric(12,2);
alter table public.tenant_event_assignments add column if not exists planned_hours numeric(8,2) not null default 0;
alter table public.tenant_event_assignments add column if not exists actual_hours numeric(8,2) not null default 0;
alter table public.tenant_event_assignments add column if not exists actual_start timestamptz;
alter table public.tenant_event_assignments add column if not exists actual_end timestamptz;
alter table public.tenant_event_assignments add column if not exists is_lead boolean not null default false;
alter table public.tenant_event_assignments add column if not exists conflict_override boolean not null default false;

create table if not exists public.tenant_staff_availability (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.tenant_users(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  availability_type text not null default 'unavailable' check(availability_type in ('unavailable','available_override')),
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists tenant_staff_availability_idx on public.tenant_staff_availability(tenant_id,user_id,starts_at,ends_at);
alter table public.tenant_staff_availability enable row level security;

create table if not exists public.tenant_event_expenses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.tenant_events(id) on delete cascade,
  vendor_id uuid references public.tenant_vendors(id) on delete set null,
  category text not null default 'Other',
  description text not null,
  source_type text,
  source_id text,
  estimated_amount numeric(12,2) not null default 0,
  actual_amount numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  client_funded boolean not null default false,
  status text not null default 'planned' check(status in ('planned','committed','paid','void')),
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id,source_type,source_id)
);
create index if not exists tenant_event_expenses_idx on public.tenant_event_expenses(tenant_id,event_id,category,status);
alter table public.tenant_event_expenses enable row level security;

alter table public.tenant_inventory_reservations add column if not exists packed_quantity integer not null default 0;
alter table public.tenant_inventory_reservations add column if not exists loaded_quantity integer not null default 0;
alter table public.tenant_inventory_reservations add column if not exists return_good integer not null default 0;
alter table public.tenant_inventory_reservations add column if not exists return_damaged integer not null default 0;
alter table public.tenant_inventory_reservations add column if not exists return_repair integer not null default 0;
alter table public.tenant_inventory_reservations add column if not exists return_missing integer not null default 0;
alter table public.tenant_inventory_reservations add column if not exists expected_return_at timestamptz;

create table if not exists public.tenant_inventory_movements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  inventory_item_id uuid not null references public.tenant_inventory_items(id) on delete cascade,
  reservation_id uuid references public.tenant_inventory_reservations(id) on delete set null,
  movement_type text not null check(movement_type in ('packing','load_out','return','condition_resolution')),
  quantity integer not null default 0,
  good_quantity integer not null default 0,
  damaged_quantity integer not null default 0,
  repair_quantity integer not null default 0,
  missing_quantity integer not null default 0,
  notes text,
  created_by uuid references public.tenant_users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists tenant_inventory_movements_idx on public.tenant_inventory_movements(tenant_id,event_id,inventory_item_id,created_at desc);
alter table public.tenant_inventory_movements enable row level security;

alter table public.tenant_questionnaires add column if not exists draft_answers jsonb not null default '{}'::jsonb;
alter table public.tenant_questionnaires add column if not exists analysis jsonb not null default '{}'::jsonb;
alter table public.tenant_questionnaires add column if not exists plan_created_at timestamptz;

alter table public.tenant_floorplans add column if not exists layout_type text;
alter table public.tenant_floorplans add column if not exists shared_editable boolean not null default false;
alter table public.tenant_floorplans add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.tenant_quickbooks_changes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  realm_id text not null,
  entity_name text not null,
  entity_id text not null,
  operation text,
  last_updated_at timestamptz,
  status text not null default 'pending' check(status in ('pending','reviewed','applied','ignored','failed')),
  snapshot jsonb,
  differences jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id,realm_id,entity_name,entity_id,last_updated_at)
);
create index if not exists tenant_qb_changes_idx on public.tenant_quickbooks_changes(tenant_id,status,created_at desc);
alter table public.tenant_quickbooks_changes enable row level security;

create table if not exists public.tenant_restore_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  created_by uuid references public.tenant_users(id) on delete set null,
  mode text not null default 'safe',
  tables jsonb not null default '[]'::jsonb,
  results jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.tenant_restore_runs enable row level security;
