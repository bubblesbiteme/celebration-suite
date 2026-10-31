## v0.7 OAuth redirect hotfix
Google OAuth is now pinned to the incoming Celebration Suite host for start/callback routing, preventing cross-site redirects to the Sage root site.

# Celebration Suite v0.6

Standalone multi-tenant white-label event planning platform operated by Sage & Celebration LLC. The deployment remains separate from the Sage & Celebration planning portal even though it uses `planner.sageandcelebration.com`.

## Commercial plans
- **Single Event — $99**: one licensed event through 90 days after the event date.
- **Planner Unlimited Monthly — $59/month**: unlimited events with recurring monthly billing.
- **Planner Unlimited Annual — $499/year**: unlimited events for 12 months, with early renewals preserving remaining paid time.

## Sign-in
- Platform admin: email/password or Google.
- Planner owners/admins/planners/staff: email/password or Google.
- Invited staff: password or invited Google account.
- Clients: password or invited Google account.

Google sign-in uses verified server-side OAuth identity and only matches approved/invited email addresses.

## Database
Run migrations 0001 through 0006 in order. If 0001–0005 are already installed, run only:

`supabase/migrations/0006_MONTHLY_BILLING_AND_UNIFIED_AUTH.sql`

See `docs/DEPLOYMENT.md` and `docs/V0.6-MONTHLY-BILLING-UNIFIED-AUTH.md`.

## v0.6.1 reliability baseline
Celebration Suite now includes local-first + secure autosave, 45-second live refresh standards for Client Portal/Event Day, dirty-edit refresh protection, and case-insensitive identity hardening. See `docs/RELIABILITY-HOTFIX-REFERENCE.md` and run migration `0007_RELIABILITY_DRAFTS_AND_SYNC.sql` before deploying v0.6.1.


## v0.7 Launch readiness
- Elegant Celebration Suite logo system applied to shared platform branding.
- Stripe checkout readiness diagnostics.
- Resend-powered platform transactional email.
- 24-hour password reset for planner/team, platform admin and client accounts.
- Platform Launch Health dashboard.


## v0.7.3 annual subscription hotfix
Annual Unlimited now uses true recurring yearly Stripe subscription checkout. Monthly/Annual plan switches cancel the prior subscription to prevent duplicate billing. Single Event remains one-time. No database migration is required.

## v0.10 Client Workflow & Event Operations
Adds reusable questionnaires, richer client portal workflows, event inventory packing/check-out/return operations, printable Final Event Book, support issue tracking, expanded backup export coverage, and vendor-linked documents. Run migration `0011_CLIENT_WORKFLOW_EVENT_OPERATIONS.sql` after 0010.


## v0.12.0
See `docs/V0.12-PLATFORM-CONTROL-INTELLIGENCE.md`.


## v0.15.0 Deep Workspace & Design Studio
The parity strategy now ports deep workflows from the original Sage & Celebration portal. This release rebuilds the Inspiration Board as a shared planner/client Design Studio, deepens the Event Workspace, adds per-event client permissions, inventory-linked design reservation reconciliation, image uploads, and design content in the Final Event Book. Run migration `0014_DEEP_WORKSPACE_DESIGN_STUDIO.sql`. See `docs/V0.13-DEEP-WORKSPACE-DESIGN-STUDIO.md`.


## v0.15 highlights
- Client-bookable appointment types, weekly availability, buffers and blackout periods.
- Client portal appointment booking/cancellation with conflict protection.
- Vendor quote comparison with full fee math, recommendation, client visibility and Select & Book budget commitment.
- Unified inbound/outbound communications with Resend inbound email and Telnyx inbound SMS webhook receivers, matching and manual resolution.
- Deeper lead CRM: temperature, tags, consultations, lost reasons and overdue follow-up visibility.
- Expanded milestone automations for agreements, invoice due dates, questionnaires, overdue tasks and vendor-document expiration.
- Migration: `0016_DEEP_CLIENT_JOURNEY_COMMUNICATIONS.sql`.
