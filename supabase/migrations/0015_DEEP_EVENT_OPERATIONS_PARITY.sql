-- v0.14 Deep Event Operations Parity

alter table public.tenant_events add column if not exists invitation_settings jsonb not null default '{}'::jsonb;
alter table public.tenant_events add column if not exists archived_at timestamptz;
alter table public.tenant_events add column if not exists portfolio_permission text not null default 'not_requested' check(portfolio_permission in ('not_requested','requested','approved','declined'));
alter table public.tenant_events add column if not exists review_requested_at timestamptz;

alter table public.tenant_guests add column if not exists invitation_code text;
alter table public.tenant_guests add column if not exists invitation_sent_at timestamptz;
alter table public.tenant_guests add column if not exists invitation_delivered_at timestamptz;
alter table public.tenant_guests add column if not exists invitation_opened_at timestamptz;
alter table public.tenant_guests add column if not exists rsvp_submitted_at timestamptz;
alter table public.tenant_guests add column if not exists plus_one_name text;
alter table public.tenant_guests add column if not exists song_request text;
alter table public.tenant_guests add column if not exists meal_choices jsonb not null default '[]'::jsonb;
alter table public.tenant_guests add column if not exists tags text[] not null default '{}';
alter table public.tenant_guests add column if not exists household text;
alter table public.tenant_guests add column if not exists vip boolean not null default false;
alter table public.tenant_guests add column if not exists attendance_status text not null default 'expected' check(attendance_status in ('expected','checked_in','left','no_show'));
update public.tenant_guests set invitation_code=coalesce(invitation_code,substr(replace(checkin_code::text,'-',''),1,12)) where invitation_code is null;
create unique index if not exists tenant_guests_invitation_code_idx on public.tenant_guests(invitation_code) where invitation_code is not null;

alter table public.tenant_floorplans add column if not exists background_url text;
alter table public.tenant_floorplans add column if not exists background_opacity numeric(4,3) not null default .35;
alter table public.tenant_floorplans add column if not exists room_width_ft numeric(10,2);
alter table public.tenant_floorplans add column if not exists room_height_ft numeric(10,2);
alter table public.tenant_floorplans add column if not exists calibration jsonb not null default '{}'::jsonb;
alter table public.tenant_floorplans add column if not exists measurements jsonb not null default '[]'::jsonb;
alter table public.tenant_floorplans add column if not exists version_number integer not null default 1;
alter table public.tenant_floorplans add column if not exists is_shared boolean not null default false;

create table if not exists public.tenant_floorplan_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  floorplan_id uuid not null references public.tenant_floorplans(id) on delete cascade,
  version_number integer not null,
  name text,
  snapshot jsonb not null default '{}'::jsonb,
  created_by uuid references public.tenant_users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(floorplan_id,version_number)
);
create index if not exists tenant_floorplan_versions_idx on public.tenant_floorplan_versions(tenant_id,event_id,floorplan_id,version_number desc);
alter table public.tenant_floorplan_versions enable row level security;

alter table public.tenant_documents add column if not exists vendor_id uuid references public.tenant_vendors(id) on delete set null;
alter table public.tenant_documents add column if not exists storage_path text;
alter table public.tenant_documents add column if not exists version_number integer not null default 1;
alter table public.tenant_documents add column if not exists parent_document_id uuid references public.tenant_documents(id) on delete set null;
alter table public.tenant_documents add column if not exists locked boolean not null default false;
alter table public.tenant_documents add column if not exists issue_date date;
alter table public.tenant_documents add column if not exists expiration_date date;
alter table public.tenant_documents add column if not exists status text not null default 'active' check(status in ('active','expiring','expired','archived'));
alter table public.tenant_documents add column if not exists content_hash text;
alter table public.tenant_documents add column if not exists signer_name text;
alter table public.tenant_documents add column if not exists signed_at timestamptz;

alter table public.tenant_event_closeouts add column if not exists pnl_snapshot jsonb not null default '{}'::jsonb;
alter table public.tenant_event_closeouts add column if not exists inventory_verified boolean not null default false;
alter table public.tenant_event_closeouts add column if not exists vendor_reviews_complete boolean not null default false;
alter table public.tenant_event_closeouts add column if not exists review_request_sent boolean not null default false;
alter table public.tenant_event_closeouts add column if not exists portfolio_request_sent boolean not null default false;
alter table public.tenant_event_closeouts add column if not exists final_book_url text;
alter table public.tenant_event_closeouts add column if not exists finalized_at timestamptz;
alter table public.tenant_event_closeouts add column if not exists gates jsonb not null default '{}'::jsonb;

-- Private storage for event documents and venue plans.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('celebration-suite-files','celebration-suite-files',false,31457280,array['application/pdf','image/png','image/jpeg','image/webp','text/plain','text/csv','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do update set file_size_limit=excluded.file_size_limit, public=false;
