-- Celebration Suite v1.3.5
-- Bring the tenant vendor schema in line with the Vendor CRM UI.

alter table public.tenant_vendors
  add column if not exists instagram text,
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zip text,
  add column if not exists pricing_summary text,
  add column if not exists minimum_spend numeric(12,2),
  add column if not exists referral_discount text,
  add column if not exists w9_status text not null default 'missing',
  add column if not exists coi_status text not null default 'missing',
  add column if not exists coi_expires_on date,
  add column if not exists contract_status text not null default 'none',
  add column if not exists document_links jsonb not null default '[]'::jsonb,
  add column if not exists rating_communication smallint,
  add column if not exists rating_reliability smallint,
  add column if not exists rating_quality smallint,
  add column if not exists rating_value smallint,
  add column if not exists rating_professionalism smallint,
  add column if not exists referred_clients integer not null default 0,
  add column if not exists referred_revenue numeric(12,2) not null default 0,
  add column if not exists referral_bonus_due numeric(12,2) not null default 0,
  add column if not exists preferred boolean not null default false,
  add column if not exists public_profile boolean not null default false;

-- The original v0.3 vendor table used pipeline statuses. The Vendor CRM later
-- introduced operational availability statuses. Support both so older records
-- and newer Vendor CRM screens remain compatible.
alter table public.tenant_vendors drop constraint if exists tenant_vendors_status_check;
alter table public.tenant_vendors
  add constraint tenant_vendors_status_check
  check (status in (
    'active','busy','seasonal','inactive',
    'prospect','contacted','quoted','booked','completed','declined'
  ));

alter table public.tenant_vendors drop constraint if exists tenant_vendors_w9_status_check;
alter table public.tenant_vendors
  add constraint tenant_vendors_w9_status_check
  check (w9_status in ('missing','requested','received'));

alter table public.tenant_vendors drop constraint if exists tenant_vendors_coi_status_check;
alter table public.tenant_vendors
  add constraint tenant_vendors_coi_status_check
  check (coi_status in ('missing','requested','received','expired'));

alter table public.tenant_vendors drop constraint if exists tenant_vendors_contract_status_check;
alter table public.tenant_vendors
  add constraint tenant_vendors_contract_status_check
  check (contract_status in ('none','requested','received','signed'));

alter table public.tenant_vendors drop constraint if exists tenant_vendors_rating_communication_check;
alter table public.tenant_vendors add constraint tenant_vendors_rating_communication_check check (rating_communication is null or rating_communication between 1 and 5);
alter table public.tenant_vendors drop constraint if exists tenant_vendors_rating_reliability_check;
alter table public.tenant_vendors add constraint tenant_vendors_rating_reliability_check check (rating_reliability is null or rating_reliability between 1 and 5);
alter table public.tenant_vendors drop constraint if exists tenant_vendors_rating_quality_check;
alter table public.tenant_vendors add constraint tenant_vendors_rating_quality_check check (rating_quality is null or rating_quality between 1 and 5);
alter table public.tenant_vendors drop constraint if exists tenant_vendors_rating_value_check;
alter table public.tenant_vendors add constraint tenant_vendors_rating_value_check check (rating_value is null or rating_value between 1 and 5);
alter table public.tenant_vendors drop constraint if exists tenant_vendors_rating_professionalism_check;
alter table public.tenant_vendors add constraint tenant_vendors_rating_professionalism_check check (rating_professionalism is null or rating_professionalism between 1 and 5);

update public.tenant_vendors
set pricing_summary = coalesce(pricing_summary, notes)
where pricing_summary is null and notes is not null;

create index if not exists tenant_vendors_tenant_status_idx
  on public.tenant_vendors(tenant_id,status,business_name);
