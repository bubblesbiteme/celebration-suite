-- v1.3.8 Guest Photo QR Gallery
create extension if not exists pgcrypto;

create table if not exists public.tenant_event_photo_galleries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  public_token uuid not null default gen_random_uuid(),
  enabled boolean not null default false,
  title text,
  welcome_message text,
  allow_guest_captions boolean not null default true,
  moderation_required boolean not null default true,
  client_can_download boolean not null default true,
  client_can_print boolean not null default true,
  retention_until timestamptz not null default (now() + interval '2 years'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id,event_id),
  unique(public_token)
);

create table if not exists public.tenant_event_guest_photos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  gallery_id uuid not null references public.tenant_event_photo_galleries(id) on delete cascade,
  uploader_name text,
  caption text,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  storage_path text not null,
  status text not null default 'pending' check(status in ('pending','approved','hidden')),
  retain_until timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(storage_path)
);

create index if not exists tenant_event_photo_galleries_event_idx on public.tenant_event_photo_galleries(tenant_id,event_id);
create index if not exists tenant_event_guest_photos_event_idx on public.tenant_event_guest_photos(tenant_id,event_id,created_at desc);
create index if not exists tenant_event_guest_photos_gallery_idx on public.tenant_event_guest_photos(gallery_id,status,created_at desc);

alter table public.tenant_event_photo_galleries enable row level security;
alter table public.tenant_event_guest_photos enable row level security;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'celebration-suite-guest-photos',
  'celebration-suite-guest-photos',
  false,
  26214400,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
on conflict (id) do update set
  public=false,
  file_size_limit=26214400,
  allowed_mime_types=array['image/jpeg','image/png','image/webp','image/heic','image/heif'];
