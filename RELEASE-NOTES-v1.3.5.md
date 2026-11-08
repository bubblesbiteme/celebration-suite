# Celebration Suite v1.3.5 — Vendor CRM Persistence

## Fixes

- Fixes new vendors failing to save because the Vendor CRM used `active`, `busy`, `seasonal`, and `inactive` while the original database constraint only allowed legacy pipeline statuses.
- Adds full persistence for the fields already exposed by the Vendor CRM UI: Instagram, address, city/state/ZIP, pricing summary, minimum spend, referral discount, W-9/COI/contract tracking, document links, quality ratings, referral metrics, preferred-vendor status, public-directory approval, and notes.
- Vendor create/update now returns the persisted database record and the UI confirms that record survives the immediate refresh before closing the editor.
- The Save Vendor button now shows a visible `Saving…` state and cannot be double-submitted.
- If the new schema migration is missing, the API returns an actionable migration message instead of a cryptic PostgREST/constraint error.

## Required migration

Run `supabase/migrations/0034_VENDOR_CRM_PERSISTENCE.sql` after migration 0033 before testing Vendor CRM saves.

## Cache

Service worker cache: `celebration-suite-v135`.
