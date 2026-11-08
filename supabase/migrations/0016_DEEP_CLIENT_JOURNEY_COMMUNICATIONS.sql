-- v0.15 Deep Client Journey + Communications Parity

alter table public.tenant_leads add column if not exists consultation_at timestamptz;
alter table public.tenant_leads add column if not exists lost_reason text;
alter table public.tenant_leads add column if not exists assigned_user_id uuid references public.tenant_users(id) on delete set null;
alter table public.tenant_leads add column if not exists last_contacted_at timestamptz;
alter table public.tenant_leads add column if not exists temperature text not null default 'warm' check(temperature in ('cold','warm','hot'));
alter table public.tenant_leads add column if not exists tags text[] not null default '{}';

create table if not exists public.tenant_appointment_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  duration_minutes integer not null default 30,
  meeting_mode text not null default 'video' check(meeting_mode in ('video','phone','in_person','custom')),
  location text,
  buffer_before_minutes integer not null default 0,
  buffer_after_minutes integer not null default 0,
  client_bookable boolean not null default true,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_appointment_types_idx on public.tenant_appointment_types(tenant_id,active,sort_order);
alter table public.tenant_appointment_types enable row level security;

create table if not exists public.tenant_scheduling_availability (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  weekday integer not null check(weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists tenant_scheduling_availability_idx on public.tenant_scheduling_availability(tenant_id,weekday,active);
alter table public.tenant_scheduling_availability enable row level security;

create table if not exists public.tenant_scheduling_blocks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null default 'Unavailable',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  source text not null default 'manual',
  created_at timestamptz not null default now()
);
create index if not exists tenant_scheduling_blocks_idx on public.tenant_scheduling_blocks(tenant_id,starts_at,ends_at);
alter table public.tenant_scheduling_blocks enable row level security;

alter table public.tenant_appointments add column if not exists appointment_type_id uuid references public.tenant_appointment_types(id) on delete set null;
alter table public.tenant_appointments add column if not exists meeting_mode text;
alter table public.tenant_appointments add column if not exists booked_by_client boolean not null default false;
alter table public.tenant_appointments add column if not exists canceled_at timestamptz;
alter table public.tenant_appointments add column if not exists cancellation_reason text;

create table if not exists public.tenant_vendor_quotes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.tenant_events(id) on delete cascade,
  vendor_id uuid references public.tenant_vendors(id) on delete set null,
  category text,
  label text,
  base_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  service_fee numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) not null default 0,
  other_fees numeric(12,2) not null default 0,
  deposit_amount numeric(12,2) not null default 0,
  balance_due_date date,
  valid_until date,
  notes text,
  recommended boolean not null default false,
  client_visible boolean not null default false,
  status text not null default 'quoted' check(status in ('quoted','recommended','selected','declined','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_vendor_quotes_idx on public.tenant_vendor_quotes(tenant_id,event_id,category,status);
alter table public.tenant_vendor_quotes enable row level security;

alter table public.tenant_messages add column if not exists sender text;
alter table public.tenant_messages add column if not exists provider text;
alter table public.tenant_messages add column if not exists provider_event_id text;
alter table public.tenant_messages add column if not exists match_status text not null default 'matched' check(match_status in ('matched','ambiguous','unmatched','ignored'));
alter table public.tenant_messages add column if not exists attachments jsonb not null default '[]'::jsonb;
alter table public.tenant_messages add column if not exists received_at timestamptz;
alter table public.tenant_messages add column if not exists thread_key text;
create unique index if not exists tenant_messages_provider_event_unique on public.tenant_messages(tenant_id,provider,provider_event_id) where provider_event_id is not null;

-- Seed starter appointment types and weekday availability for tenants that do not have them yet.
insert into public.tenant_appointment_types (tenant_id,name,duration_minutes,meeting_mode,sort_order)
select t.id,x.name,x.duration,x.mode,x.sort_order from public.tenants t
cross join (values
 ('Consultation',30,'video',10),('Design Review',45,'video',20),('Venue Walkthrough',60,'in_person',30),('Final Details Meeting',60,'video',40)
) as x(name,duration,mode,sort_order)
where not exists (select 1 from public.tenant_appointment_types a where a.tenant_id=t.id);

insert into public.tenant_scheduling_availability (tenant_id,weekday,start_time,end_time)
select t.id,d,'09:00'::time,'17:00'::time from public.tenants t cross join generate_series(1,5) d
where not exists (select 1 from public.tenant_scheduling_availability a where a.tenant_id=t.id);
