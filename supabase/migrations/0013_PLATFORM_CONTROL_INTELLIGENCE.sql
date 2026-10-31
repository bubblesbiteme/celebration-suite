-- Celebration Suite v0.12.0 - platform control, intelligence, auditability
create extension if not exists pgcrypto;

create table if not exists tenant_audit_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  event_id uuid,
  actor_type text not null default 'planner',
  actor_id uuid,
  actor_name text,
  action text not null,
  entity_type text,
  entity_id text,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists tenant_audit_log_tenant_idx on tenant_audit_log(tenant_id,created_at desc);
create index if not exists tenant_audit_log_event_idx on tenant_audit_log(tenant_id,event_id,created_at desc);

create table if not exists tenant_notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  event_id uuid,
  user_id uuid,
  kind text not null default 'info',
  title text not null,
  body text,
  link_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists tenant_notifications_tenant_idx on tenant_notifications(tenant_id,read_at,created_at desc);

create table if not exists tenant_api_keys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  name text not null,
  key_prefix text not null,
  key_hash text not null unique,
  active boolean not null default true,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists tenant_api_keys_tenant_idx on tenant_api_keys(tenant_id,active);

create table if not exists tenant_webhooks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  name text not null,
  endpoint_url text not null,
  signing_secret text not null,
  event_types text[] not null default array['event.updated']::text[],
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_webhooks_tenant_idx on tenant_webhooks(tenant_id,active);

create table if not exists tenant_webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  webhook_id uuid,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  response_status integer,
  response_body text,
  success boolean not null default false,
  attempted_at timestamptz not null default now()
);
create index if not exists tenant_webhook_deliveries_tenant_idx on tenant_webhook_deliveries(tenant_id,attempted_at desc);
