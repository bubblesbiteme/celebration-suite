-- Celebration Suite v0.11.0 - business-grade operations
create extension if not exists pgcrypto;

create table if not exists tenant_vendor_reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  vendor_id uuid not null,
  event_id uuid,
  rating integer not null default 5 check (rating between 1 and 5),
  reliability integer check (reliability between 1 and 5),
  quality integer check (quality between 1 and 5),
  communication integer check (communication between 1 and 5),
  would_rehire boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_vendor_reviews_tenant_idx on tenant_vendor_reviews(tenant_id,vendor_id);

create table if not exists tenant_purchasing_gaps (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  event_id uuid,
  inventory_item_id uuid,
  item_name text not null,
  category text,
  quantity_needed numeric not null default 1,
  quantity_owned numeric not null default 0,
  quantity_gap numeric not null default 1,
  acquisition_type text not null default 'purchase',
  vendor_name text,
  source_url text,
  estimated_unit_cost numeric not null default 0,
  actual_unit_cost numeric,
  status text not null default 'needed',
  ordered_at timestamptz,
  received_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_purchasing_gaps_tenant_event_idx on tenant_purchasing_gaps(tenant_id,event_id,status);

create table if not exists tenant_event_day_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  event_id uuid not null,
  title text not null,
  task_time timestamptz,
  owner_name text,
  location text,
  priority text not null default 'normal',
  status text not null default 'pending',
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_event_day_tasks_tenant_event_idx on tenant_event_day_tasks(tenant_id,event_id,task_time);

create table if not exists tenant_event_incidents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  event_id uuid not null,
  severity text not null default 'low',
  title text not null,
  description text,
  resolution text,
  status text not null default 'open',
  reported_by text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_event_incidents_tenant_event_idx on tenant_event_incidents(tenant_id,event_id,status);

create table if not exists tenant_referral_partner_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  partner_name text not null,
  partner_email text,
  token text not null unique,
  active boolean not null default true,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_referral_partner_links_tenant_idx on tenant_referral_partner_links(tenant_id,partner_email);

create table if not exists tenant_reconciliation_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  local_billed numeric not null default 0,
  local_collected numeric not null default 0,
  local_outstanding numeric not null default 0,
  qb_total_invoiced numeric not null default 0,
  qb_open_balance numeric not null default 0,
  invoice_delta numeric not null default 0,
  balance_delta numeric not null default 0,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists tenant_reconciliation_snapshots_tenant_idx on tenant_reconciliation_snapshots(tenant_id,created_at desc);
