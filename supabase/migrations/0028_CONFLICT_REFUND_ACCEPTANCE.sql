-- v0.37 Production acceptance hardening: optimistic collaboration locks + payment refund lifecycle
alter table public.tenant_floorplans add column if not exists lock_version integer not null default 1;
alter table public.tenant_inspiration_items add column if not exists lock_version integer not null default 1;

alter table public.tenant_payments add column if not exists stripe_session_id text;
alter table public.tenant_payments add column if not exists stripe_payment_intent_id text;
alter table public.tenant_payments add column if not exists refunded_amount numeric(12,2) not null default 0;
alter table public.tenant_payments add column if not exists refund_status text not null default 'none'
  check (refund_status in ('none','partial','full'));
alter table public.tenant_payments add column if not exists last_refund_at timestamptz;
alter table public.tenant_payments add column if not exists stripe_refund_ids jsonb not null default '[]'::jsonb;

create index if not exists tenant_payments_stripe_intent_idx on public.tenant_payments(tenant_id,stripe_payment_intent_id);

alter table public.tenant_domains add column if not exists last_diagnostic_at timestamptz;
alter table public.tenant_domains add column if not exists https_ok boolean;
alter table public.tenant_domains add column if not exists dns_target text;

-- Older invoice schema did not include the refunded state even though the financial UI did.
alter table public.tenant_invoices drop constraint if exists tenant_invoices_status_check;
alter table public.tenant_invoices add constraint tenant_invoices_status_check
  check (status in ('draft','sent','partial','paid','overdue','void','refunded'));
