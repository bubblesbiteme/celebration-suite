-- v0.18 QR Inventory + bulk media + reservation traceability
alter table public.tenant_inventory_items add column if not exists qr_code text;
alter table public.tenant_inventory_items add column if not exists image_path text;
alter table public.tenant_inventory_items add column if not exists image_updated_at timestamptz;
alter table public.tenant_inventory_items add column if not exists import_source text;
alter table public.tenant_inventory_items add column if not exists last_counted_at timestamptz;
create unique index if not exists tenant_inventory_qr_unique on public.tenant_inventory_items(tenant_id,qr_code) where qr_code is not null;

create table if not exists public.tenant_inventory_images (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  inventory_item_id uuid not null references public.tenant_inventory_items(id) on delete cascade,
  image_url text not null,
  image_path text,
  file_name text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists tenant_inventory_images_item_idx on public.tenant_inventory_images(tenant_id,inventory_item_id,sort_order);
alter table public.tenant_inventory_images enable row level security;

alter table public.tenant_inventory_reservations add column if not exists reservation_status text not null default 'reserved';
alter table public.tenant_inventory_reservations add column if not exists design_item_ids jsonb not null default '[]'::jsonb;
alter table public.tenant_inventory_reservations add column if not exists reservation_notes text;
alter table public.tenant_inventory_reservations add column if not exists last_reconciled_at timestamptz;

create table if not exists public.tenant_inventory_import_batches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  file_name text,
  row_count integer not null default 0,
  created_count integer not null default 0,
  updated_count integer not null default 0,
  error_count integer not null default 0,
  errors jsonb not null default '[]'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now()
);
alter table public.tenant_inventory_import_batches enable row level security;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('celebration-suite-inventory','celebration-suite-inventory',true,10485760,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true,file_size_limit=10485760,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];
