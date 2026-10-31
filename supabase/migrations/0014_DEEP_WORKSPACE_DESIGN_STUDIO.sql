-- v0.13 Deep Workspace + Design Studio
alter table public.tenant_inspiration_items add column if not exists category text not null default 'overall';
alter table public.tenant_inspiration_items add column if not exists status text not null default 'idea';
alter table public.tenant_inspiration_items add column if not exists is_client_visible boolean not null default true;
alter table public.tenant_inspiration_items add column if not exists requested_quantity integer not null default 1;
alter table public.tenant_inspiration_items add column if not exists rotation numeric(8,3) not null default 0;
alter table public.tenant_inspiration_items add column if not exists height numeric(8,3) not null default 26;
alter table public.tenant_inspiration_items add column if not exists locked boolean not null default false;
alter table public.tenant_inspiration_items add column if not exists source_url text;
alter table public.tenant_inspiration_items add column if not exists client_note text;
alter table public.tenant_inspiration_items add column if not exists approved_at timestamptz;

create table if not exists public.tenant_inspiration_boards (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  title text not null default 'Event Design Board',
  board_notes text,
  background text not null default 'paper',
  canvas_height integer not null default 820,
  client_can_arrange boolean not null default true,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(tenant_id,event_id)
);
create index if not exists tenant_inspiration_boards_event_idx on public.tenant_inspiration_boards(tenant_id,event_id);
alter table public.tenant_inspiration_boards enable row level security;

-- Keep manual inventory planning separate from design-driven reservations.
alter table public.tenant_inventory_reservations add column if not exists manual_quantity integer;
alter table public.tenant_inventory_reservations add column if not exists design_quantity integer not null default 0;
update public.tenant_inventory_reservations set manual_quantity=quantity where manual_quantity is null;
alter table public.tenant_inventory_reservations alter column manual_quantity set default 0;

-- Public media bucket used by tenant-authenticated inspiration uploads.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('celebration-suite-media','celebration-suite-media',true,6291456,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true,file_size_limit=6291456,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];
