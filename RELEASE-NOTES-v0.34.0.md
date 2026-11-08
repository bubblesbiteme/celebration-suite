# Celebration Suite v0.34.0 — Production Parity & Browser Reliability

This release starts the production-hardening phase rather than adding another layer of surface-level features.

## Completed in this release

- Removed legacy Sage & Celebration identity from the planner-facing direct-fork pages that were still shipping it in their source HTML.
- Converted those pages to neutral Celebration Suite defaults plus explicit `data-tenant-business-name` / `data-tenant-logo` hooks so tenant branding is native to the DOM rather than dependent on finding Sage-specific markup after load.
- Kept compatibility CSS variable aliases so older forked page styles continue to inherit tenant colors without exposing the original company identity.
- Removed the duplicated global browser error and unhandled-promise reporters from `assets/runtime-compat.js`.
- Corrected package release metadata from `0.26.0` to `0.34.0`.
- Added Playwright desktop + mobile browser regression infrastructure.
- Added critical browser scenarios for public navigation, authenticated planner pages, inventory rental/image controls, floor-plan interaction/reload persistence, and real client portal URLs.
- Added a native-branding/browser-readiness audit and a single `npm run release:audit` command that runs the existing 564-check preflight, release-candidate audit, interaction smoke contracts, and the new branding/browser-readiness checks.

## Browser regression environment

Use a disposable staging tenant/event and set:

- `CS_E2E_BASE_URL`
- `CS_E2E_PLANNER_EMAIL`
- `CS_E2E_PLANNER_PASSWORD`
- `CS_E2E_EVENT_ID`
- `CS_E2E_CLIENT_URL`

Then run `npm run test:e2e:critical` after installing Playwright/Chromium.

## Still intentionally deferred

These are product additions, not safe hardening patches, and should follow after the browser suite is run against staging:

- Tenant decor-rental public storefront/request/payment/reservation workflow.
- Tenant-configurable instant-book storefront/packages/add-ons.
- Abandoned checkout recovery for tenant customer commerce.
- Tenant custom-domain/CNAME mapping.
- Push notification subscription parity.
- Live QuickBooks/Google/Stripe failure and reconnect acceptance testing.

## Payment reliability fix discovered during hardening

- Public invoice checkout now returns with the Stripe Checkout Session ID, verifies that session against the tenant's own Stripe integration, confirms tenant/invoice metadata, records an idempotent `tenant_payments` row, and updates the invoice to partial/paid before showing a success state.
- The old unverified `?paid=1` success message has been removed so customers are never told a payment was recorded merely because the browser reached the return URL.
