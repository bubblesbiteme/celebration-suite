-- v0.30 Shared planner/client collaboration metadata
alter table public.tenant_documents add column if not exists uploaded_by_type text check (uploaded_by_type in ('planner','client','system'));
alter table public.tenant_documents add column if not exists uploaded_by_id uuid;

alter table public.tenant_inspiration_items add column if not exists added_by_type text check (added_by_type in ('planner','client','system'));
alter table public.tenant_inspiration_items add column if not exists added_by_id uuid;

alter table public.tenant_floorplans add column if not exists last_edited_by_type text check (last_edited_by_type in ('planner','client','system'));
alter table public.tenant_floorplans add column if not exists last_edited_by_id uuid;

create index if not exists tenant_documents_uploader_idx on public.tenant_documents(tenant_id,event_id,uploaded_by_type);
create index if not exists tenant_inspiration_uploader_idx on public.tenant_inspiration_items(tenant_id,event_id,added_by_type);
