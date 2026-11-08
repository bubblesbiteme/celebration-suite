create table if not exists public.tenant_clients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_clients_tenant_idx on public.tenant_clients(tenant_id,created_at desc);

create table if not exists public.tenant_leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  source text,
  stage text not null default 'new_inquiry' check (stage in ('new_inquiry','contacted','consultation','proposal_sent','negotiating','booked','lost')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  event_type text,
  event_date date,
  guest_count integer,
  estimated_budget numeric(12,2),
  location text,
  next_follow_up timestamptz,
  inquiry_details text,
  client_id uuid references public.tenant_clients(id) on delete set null,
  converted_event_id uuid references public.tenant_events(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_leads_tenant_stage_idx on public.tenant_leads(tenant_id,stage,created_at desc);

create table if not exists public.tenant_activity (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  activity_type text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists tenant_activity_entity_idx on public.tenant_activity(tenant_id,entity_type,entity_id,created_at desc);

create table if not exists public.tenant_proposals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.tenant_events(id) on delete set null,
  lead_id uuid references public.tenant_leads(id) on delete set null,
  client_id uuid references public.tenant_clients(id) on delete set null,
  title text not null,
  status text not null default 'draft' check (status in ('draft','sent','viewed','accepted','declined','expired')),
  client_name text,
  client_email text,
  amount numeric(12,2) not null default 0,
  deposit_amount numeric(12,2) not null default 0,
  valid_until date,
  content jsonb not null default '{}'::jsonb,
  public_token uuid not null default gen_random_uuid(),
  sent_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists tenant_proposals_public_token_idx on public.tenant_proposals(public_token);
create index if not exists tenant_proposals_tenant_status_idx on public.tenant_proposals(tenant_id,status,created_at desc);

create table if not exists public.tenant_contracts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.tenant_events(id) on delete set null,
  proposal_id uuid references public.tenant_proposals(id) on delete set null,
  client_id uuid references public.tenant_clients(id) on delete set null,
  title text not null,
  status text not null default 'draft' check (status in ('draft','sent','signed','void')),
  client_name text,
  client_email text,
  body text not null default '',
  public_token uuid not null default gen_random_uuid(),
  sent_at timestamptz,
  signed_at timestamptz,
  signature_name text,
  signature_email text,
  signature_ip text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists tenant_contracts_public_token_idx on public.tenant_contracts(public_token);
create index if not exists tenant_contracts_tenant_status_idx on public.tenant_contracts(tenant_id,status,created_at desc);

create table if not exists public.tenant_invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.tenant_events(id) on delete set null,
  client_id uuid references public.tenant_clients(id) on delete set null,
  proposal_id uuid references public.tenant_proposals(id) on delete set null,
  invoice_number text not null,
  client_name text,
  client_email text,
  status text not null default 'draft' check (status in ('draft','sent','partial','paid','overdue','void')),
  due_date date,
  amount numeric(12,2) not null default 0,
  notes text,
  stripe_checkout_session_id text,
  stripe_payment_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id,invoice_number)
);
create index if not exists tenant_invoices_tenant_status_idx on public.tenant_invoices(tenant_id,status,due_date);

create table if not exists public.tenant_payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  invoice_id uuid not null references public.tenant_invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  method text,
  reference text,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists tenant_payments_invoice_idx on public.tenant_payments(tenant_id,invoice_id,paid_at desc);

alter table public.tenant_clients enable row level security;
alter table public.tenant_leads enable row level security;
alter table public.tenant_activity enable row level security;
alter table public.tenant_proposals enable row level security;
alter table public.tenant_contracts enable row level security;
alter table public.tenant_invoices enable row level security;
alter table public.tenant_payments enable row level security;
