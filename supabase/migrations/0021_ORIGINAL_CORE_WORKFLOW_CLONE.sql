-- v0.23 - original Sage core workflow parity for inventory + floor plans
alter table public.tenant_inventory_items add column if not exists unit text not null default 'each';
alter table public.tenant_inventory_items add column if not exists floor_plan_type text;
alter table public.tenant_inventory_items add column if not exists floor_plan_multiplier numeric(10,2) not null default 1;
alter table public.tenant_inventory_items add column if not exists auto_reserve boolean not null default false;
alter table public.tenant_inventory_items add column if not exists is_active boolean not null default true;

create index if not exists tenant_inventory_items_floor_idx
  on public.tenant_inventory_items(tenant_id,floor_plan_type,auto_reserve)
  where is_active=true;

alter table public.tenant_inventory_reservations add column if not exists source text not null default 'manual';
alter table public.tenant_inventory_reservations add column if not exists floor_plan_type text;
alter table public.tenant_inventory_reservations add column if not exists notes text;
alter table public.tenant_inventory_reservations add column if not exists updated_at timestamptz not null default now();
