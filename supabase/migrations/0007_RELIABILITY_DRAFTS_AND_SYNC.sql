-- Celebration Suite v0.6.1: secure client draft persistence and sync metadata
create table if not exists public.client_portal_drafts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_user_id uuid not null references public.tenant_client_users(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  draft_type text not null default 'message',
  draft_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (client_user_id,event_id,draft_type)
);
create index if not exists client_portal_drafts_tenant_event_idx on public.client_portal_drafts(tenant_id,event_id);
alter table public.client_portal_drafts enable row level security;
-- Backend service role owns access; no public policies are created.
