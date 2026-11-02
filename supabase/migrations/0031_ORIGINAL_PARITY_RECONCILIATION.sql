-- Celebration Suite v1.0.2 - original Sage parity reconciliation
-- Restores normalized event AI history/settings/audit records used by the existing Event Workspace AI UI.

create table if not exists public.tenant_event_ai_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  is_enabled boolean not null default true,
  allow_client_data boolean not null default true,
  allow_financial_data boolean not null default true,
  allow_internal_notes boolean not null default true,
  redact_contact_details boolean not null default true,
  retention_days integer not null default 90 check (retention_days between 7 and 3650),
  require_approval boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id,event_id)
);

create table if not exists public.tenant_event_ai_conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  mode text not null default 'general',
  prompt text not null,
  response text not null,
  model text,
  input_tokens integer,
  output_tokens integer,
  created_by_user_id uuid references public.tenant_users(id) on delete set null,
  review_status text not null default 'unreviewed' check (review_status in ('unreviewed','approved','discarded')),
  reviewed_at timestamptz,
  reviewed_by_user_id uuid references public.tenant_users(id) on delete set null,
  context_flags jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_event_ai_audit_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  conversation_id uuid references public.tenant_event_ai_conversations(id) on delete set null,
  action text not null,
  actor_user_id uuid references public.tenant_users(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists tenant_event_ai_conversations_event_idx on public.tenant_event_ai_conversations(tenant_id,event_id,created_at desc);
create index if not exists tenant_event_ai_audit_event_idx on public.tenant_event_ai_audit_log(tenant_id,event_id,created_at desc);

alter table public.tenant_event_ai_settings enable row level security;
alter table public.tenant_event_ai_conversations enable row level security;
alter table public.tenant_event_ai_audit_log enable row level security;
