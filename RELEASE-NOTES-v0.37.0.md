# Celebration Suite v0.37.0 — Production Acceptance & Failure-Mode Hardening

This release is focused on protecting live planner/client work and completing production-grade payment/domain failure handling.

## Collaboration conflict protection

Floor Plans and Inspiration items now use optimistic lock versions. Planner and client edits no longer silently overwrite a newer save from another browser/session. A stale update returns HTTP 409 with `EDIT_CONFLICT`, allowing the UI to reload the newest record instead of destroying another user's changes.

The planner Floor Plan and Inspiration interfaces send lock versions automatically. The shared client portal uses the same protection for editable floor-plan objects and design-board changes.

## Stripe refund lifecycle

Verified invoice payments now retain their Stripe Checkout Session and PaymentIntent identifiers. The Financial Center can issue partial or full refunds directly through the planner's connected Stripe account.

Refunds update:
- refunded amount and refund status on the payment
- Stripe refund IDs for auditability
- invoice paid/partial/refunded state based on net collected amount
- Financial Center collected/remaining totals using net payment value

Refund operations are intentionally server-side; stored Stripe credentials are never returned to the browser.

## Custom-domain production diagnostics

Verified custom domains now include a `Test DNS & SSL` action. Celebration Suite checks public DNS resolution and HTTPS reachability and stores the most recent diagnostic result so a planner can distinguish ownership verification from an actually working production portal address.

## Browser acceptance coverage

The Playwright suite now includes an authenticated stale-write acceptance test that performs two writes with the same lock version and requires the second write to fail with HTTP 409. Optional staging-only tests can also exercise a verified custom domain and a disposable Stripe test refund.

Environment variables for optional destructive/external acceptance tests:
- `CS_E2E_DOMAIN_ID` — verified staging custom-domain row
- `CS_E2E_REFUND_PAYMENT_ID` — disposable Stripe test payment only
- `CS_E2E_REFUND_AMOUNT` — small test refund amount

Do not configure the refund variables against a production customer payment.

## Database migration

Apply after migration 0027:

`supabase/migrations/0028_CONFLICT_REFUND_ACCEPTANCE.sql`

It adds collaboration lock versions, Stripe/refund audit fields, custom-domain diagnostic fields, and aligns the invoice status constraint with the existing `refunded` application state.
