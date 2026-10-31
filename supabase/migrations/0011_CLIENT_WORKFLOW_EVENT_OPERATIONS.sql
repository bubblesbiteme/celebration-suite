-- v0.10 Client Workflow & Event Operations
create table if not exists public.tenant_questionnaire_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  event_type text,
  description text,
  questions jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_questionnaire_templates_idx on public.tenant_questionnaire_templates(tenant_id,active,name);

create table if not exists public.tenant_questionnaires (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.tenant_events(id) on delete cascade,
  template_id uuid references public.tenant_questionnaire_templates(id) on delete set null,
  title text not null,
  questions jsonb not null default '[]'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check(status in ('draft','sent','in_progress','submitted','reviewed')),
  public_token uuid not null default gen_random_uuid(),
  sent_at timestamptz,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists tenant_questionnaires_public_token_idx on public.tenant_questionnaires(public_token);
create index if not exists tenant_questionnaires_event_idx on public.tenant_questionnaires(tenant_id,event_id,created_at desc);

create table if not exists public.tenant_support_tickets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  created_by uuid references public.tenant_users(id) on delete set null,
  subject text not null,
  category text not null default 'general',
  priority text not null default 'normal' check(priority in ('low','normal','high','urgent')),
  status text not null default 'open' check(status in ('open','in_progress','waiting','resolved','closed')),
  description text not null,
  resolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tenant_support_tickets_idx on public.tenant_support_tickets(tenant_id,status,created_at desc);

alter table public.tenant_documents add column if not exists vendor_id uuid references public.tenant_vendors(id) on delete set null;
alter table public.tenant_inventory_reservations add column if not exists packed_at timestamptz;
alter table public.tenant_inventory_reservations add column if not exists packing_notes text;

alter table public.tenant_questionnaire_templates enable row level security;
alter table public.tenant_questionnaires enable row level security;
alter table public.tenant_support_tickets enable row level security;
