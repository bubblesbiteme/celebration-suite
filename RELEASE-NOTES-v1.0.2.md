# Celebration Suite v1.0.2 — Original Sage Parity Reconciliation

This release performs a source-tree reconciliation against the complete 544-file Sage & Celebration reference build instead of relying only on the newer Celebration Suite regression suites.

## Restored in this release

- Restored the missing `event-ai-assistant` Netlify function already referenced by the Event Workspace UI.
- Added tenant-scoped AI settings, conversation history, review state, retention controls and audit history in migration `0031_ORIGINAL_PARITY_RECONCILIATION.sql`.
- Restored client password changing through `client-change-password.mjs` and `change-password.html`.
- Added password-change controls to planner Security and Client Security.
- Restored compatibility routes for original functional links such as admin, agreement, booking, payment, proposal, change order, partner login, staff login/setup, client 2FA and activation URLs.
- Fixed the existing Event Workspace fallback to `/staff-login.html` by restoring that compatibility route.
- Added `ORIGINAL-PARITY-RECONCILIATION.md`, which maps all original application pages, backend functions and database tables to their Celebration Suite equivalent or intentional exclusion.
- Added an automated original-parity audit that fails if the current app references a missing HTML page or missing Netlify function.

## Intentional exclusions

The Sage public marketing website is not part of the white-label SaaS product. Location SEO pages, Sage blog posts, portfolio images and Sage service pages remain intentionally excluded so buyers can use their own websites and branding.

## Deployment

Apply migrations through:

`0031_ORIGINAL_PARITY_RECONCILIATION.sql`

If the Event Workspace AI Assistant will be offered, configure `OPENAI_API_KEY` and optionally `OPENAI_MODEL`.
