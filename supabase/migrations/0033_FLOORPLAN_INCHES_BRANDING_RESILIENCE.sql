-- Celebration Suite v1.2.2: floor-plan inches and compatibility backfill
alter table public.tenant_floorplans add column if not exists room_width_in numeric(12,2);
alter table public.tenant_floorplans add column if not exists room_height_in numeric(12,2);

update public.tenant_floorplans
set room_width_in = coalesce(room_width_in, room_width_ft * 12),
    room_height_in = coalesce(room_height_in, room_height_ft * 12)
where room_width_in is null or room_height_in is null;

comment on column public.tenant_floorplans.room_width_in is 'Physical room width in inches. Preferred unit for planner/client floor-plan UI.';
comment on column public.tenant_floorplans.room_height_in is 'Physical room height in inches. Preferred unit for planner/client floor-plan UI.';
