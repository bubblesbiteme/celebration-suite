## Current release: v1.2.6 — Custom Domain TXT Generation Hotfix

> Current release: **v1.2.3 — Dashboard Freeze / License Bootstrap Hotfix**

# Celebration Suite v1.2.2

Ultra-Premium Experience & Functional Workspace Modes. This release unifies planner, client and public pages under a calm editorial design system, adds Command/Ctrl + K navigation, fully functional Guided/Professional workspace modes, contrast-aware white-label branding, premium public pages, normalized HTML structure and a new luxury release gate. Apply `0033_FLOORPLAN_INCHES_BRANDING_RESILIENCE.sql` after `0032_PREMIUM_RELIABILITY_SECURITY.sql`. Start with `ULTRA-PREMIUM-UX-AUDIT.md`, `ULTRA-PREMIUM-DESIGN-SYSTEM.md`, `LUXURY-FEATURE-ROADMAP.md`, and `RELEASE-NOTES-v1.2.1.md`.

# Celebration Suite v1.1.0

This build reconciles Celebration Suite against the complete 544-file Sage reference tree. See `ORIGINAL-PARITY-RECONCILIATION.md` for the page/function/table mapping. Apply migrations through `0031_ORIGINAL_PARITY_RECONCILIATION.sql`.

# Celebration Suite v0.36.0

White-label event planning platform. v0.36 adds custom tenant domains, browser push notifications, and active integration health/reconnect handling.

# Celebration Suite v0.33.0

## v0.33.0 — Release Candidate Readiness & End-to-End Reliability

This release focuses on stability rather than broad new feature work. It adds tenant Account Health, platform-wide tenant health diagnostics, data-integrity warnings, platform support-snapshot export, integration diagnostics, expanded release-candidate audits, and critical interaction smoke contracts. The existing direct-fork planner/client workflows, two-way collaboration, branding, knowledge base, and client access model remain intact.

No database migration is required for v0.33.0.


Original Client Portal Parity & Access. The original Sage client portal is now the client-facing baseline, backed by tenant-safe compatibility actions and shared planner/client records. Adds event-specific client invitation links, permanent tenant website login URLs, copyable website button HTML, two-way Inspiration/Floor Plan/Documents/Messages collaboration, and dedicated portal parity audits. If not already applied, run migrations `0024_PLATFORM_ADMIN_ACTIONS.sql` and `0025_SHARED_EVENT_COLLABORATION.sql`.

## v0.27.0 — Direct-Fork Business Modules

Financials, Vendors, and Communications now use the original Sage interfaces with tenant-safe compatibility APIs.

## v0.24.5 Event Workspace Recovery

See `docs/V0.24.5-EVENT-WORKSPACE-RECOVERY.md`.


## v0.24.0 — Original Client Journey & Operations Clone

Continues direct behavioral parity with the uploaded Sage & Celebration Phase 9 planner. Rebuilds Event Workspace, Guest/RSVP, Financial Center, Questionnaires and Client Portal around the original workflows. Run migration `0022_ORIGINAL_WORKFLOW_CLIENT_GUEST_FINANCIAL_PARITY.sql`.

## v0.22.1 — Floor Plan Library Rendering Hotfix

- The built-in professional floor-plan catalog now renders immediately, before event/API data finishes loading.
- Restores 134 built-in event objects across tables, seating, ceremony, decor/floral, production, food & beverage, guest experience, logistics, custom, and outdoor/specialty categories.
- The All view is grouped by category so the full catalog is visibly thorough instead of presented as one undifferentiated block.
- Favorites and Recent local-storage data are now parsed safely; corrupt browser storage can no longer blank the catalog.
- Master Inventory loads independently after event data and can no longer suppress the built-in library when inventory is empty.
- If event data fails temporarily, the built-in library remains browsable and the page shows a recoverable notice instead of an empty catalog.

## v0.22.0 — Floor Plan Pro Library & UX

Professional floor-plan overhaul with a 100+ object event library, starter layouts, favorites/recent items, integrated master inventory, snap/grid controls, exact dimensions, seating, assignments, notes, rotation/layers and simplified non-repetitive onboarding.

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


## v0.17.0 Deep Workspace & Design Studio
The parity strategy now ports deep workflows from the original Sage & Celebration portal. This release rebuilds the Inspiration Board as a shared planner/client Design Studio, deepens the Event Workspace, adds per-event client permissions, inventory-linked design reservation reconciliation, image uploads, and design content in the Final Event Book. Run migration `0014_DEEP_WORKSPACE_DESIGN_STUDIO.sql`. See `docs/V0.13-DEEP-WORKSPACE-DESIGN-STUDIO.md`.


## v0.15 highlights
- Client-bookable appointment types, weekly availability, buffers and blackout periods.
- Client portal appointment booking/cancellation with conflict protection.
- Vendor quote comparison with full fee math, recommendation, client visibility and Select & Book budget commitment.
- Unified inbound/outbound communications with Resend inbound email and Telnyx inbound SMS webhook receivers, matching and manual resolution.
- Deeper lead CRM: temperature, tags, consultations, lost reasons and overdue follow-up visibility.
- Expanded milestone automations for agreements, invoice due dates, questionnaires, overdue tasks and vendor-document expiration.
- Migration: `0016_DEEP_CLIENT_JOURNEY_COMMUNICATIONS.sql`.


## v0.17.0 Easy Mode
See `docs/V0.17-CHILD-SIMPLE-UX-FLOORPLAN.md` for the global task-first UX and Floor Plan Maker visibility upgrade.


## v0.17 Guest Commerce
See `docs/V0.17-GUEST-COMMERCE-QR-TICKETING.md`. Run migration `0017_GUEST_COMMERCE_QR_TICKETING.sql`.

## v0.18.0 — QR Inventory + Bulk Media + Reservation Sync
Adds persistent inventory QR labels, native-camera inventory lookup, bulk CSV inventory import, bulk filename-matched photo uploads, inventory image galleries, and traceable Design Studio approval reservations. Run migration `0018_QR_INVENTORY_BULK_MEDIA_RESERVATIONS.sql` after 0017.


## v0.19.0 — Full UI/UX Overhaul

A product-wide usability and visual redesign. Adds persistent planner navigation, task-first Start Here panels, compact responsive working widths, improved cards/forms/tables/empty states, and page-specific guidance for Inventory, Event Inventory, Financials, Guests, Floor Plan, and Design Studio. No database migration is required. See `docs/V0.19-FULL-UI-UX-OVERHAUL.md`.

## v0.20.0 — Original Product Parity Bridge

This release uses the uploaded Sage & Celebration Phase 12 build as the source-of-truth reference and ports dense planner/admin behavior into the multi-tenant Celebration Suite product. It adds staff scheduling with labor-cost sync, inventory reservation calendar and operational movement history, questionnaire analysis → planning checklist creation, multi-layout floor-plan parity, contract/decor-budget accounting, three Event Book packet modes, safe restore/recovery tooling, signed QuickBooks inbound change review, support follow-up notifications, and original-route compatibility aliases. Run `supabase/migrations/0019_ORIGINAL_PRODUCT_PARITY_BRIDGE.sql` after migration 0018. See `docs/V0.20-ORIGINAL-PRODUCT-PARITY-BRIDGE.md`.


## v0.21.0 — Deep Operations & Workspace Parity
- Vendor Operations center with arrival/load-in instructions, assigned areas, check-in/out and emergency contacts.
- Vendor compliance view based on dated vendor documents.
- Event Day integrates vendor arrivals and emergency contacts.
- Final Event Book adds BEO / Function Sheet packet.
- Event Workspace timeline adds list/calendar modes and ICS export.
- Installable PWA shell with service worker and offline fallback.
- Backup/export includes vendor operations and emergency contacts.
- Run migration `0020_DEEP_OPERATIONS_WORKSPACE_PARITY.sql`.


## v0.22.2
Floor Plan catalog rendering hotfix: 134 built-in objects are pre-rendered and visible before any API call.

## v0.22.4 — Floor Plan Interaction + Modern UX Hotfix

- Fixed object dragging on the floor-plan canvas by preserving pointer capture during movement instead of re-rendering the object mid-drag.
- Added drag-from-library to canvas placement for built-in catalog objects and Master Inventory objects.
- Click-to-place remains available as a fallback.
- Rebuilt the floor-plan search field with a properly aligned SVG search icon and clear button.
- Modernized event/layout/starter selectors and floor-plan toolbar styling.
- Removed duplicated quick-item strip from Full Tools; it appears only in simplified mode.
- Reworked Easy Mode into a real Simplify / Full Tools state with visible UI changes.
- Simplified mode hides advanced versioning, measurements, specialty categories, and room settings while showing a four-step guide and common items.
- Full Tools exposes the complete professional catalog and advanced controls.

## v0.23.0 — Original Workflow Core Clone
Inventory and Floor Plan were rebuilt against the uploaded Sage & Celebration phase-9 code as the behavioral source of truth. Run `supabase/migrations/0021_ORIGINAL_CORE_WORKFLOW_CLONE.sql` after migration 0020. See `docs/V0.23-ORIGINAL-WORKFLOW-CORE-CLONE.md`.


## v0.25.0 — Original SaaS Fork Baseline
Celebration Suite now uses the working Sage & Celebration Event Workspace as the direct planner baseline instead of reconstructing it from disconnected SaaS pages. A unified tenant-safe compatibility endpoint preserves the original workspace contract, with compatibility routes for appointments and guest bulk seating updates. See `docs/V0.25-ORIGINAL-SAAS-FORK-BASELINE.md`. No new database migration is required.
## v0.26.0 Original Surrounding Modules Fork

This release extends the direct Sage & Celebration SaaS fork to Guest Management, Scheduling/Calendar administration, and Event Day Command Center. It keeps the working original interfaces while translating their server calls to tenant-safe Celebration Suite data. No database migration is required.


- v0.27.1: Design Studio Master Inventory now opens the event-specific inventory picker instead of generic inventory.


## v0.28.0 sitewide runtime safety + platform administration

Run `supabase/migrations/0023_PLATFORM_ADMIN_OBSERVABILITY.sql` after the existing migrations. The Platform Owner Console is available at `/platform-admin.html` and now includes tenant/user lookup, last-login visibility, support tickets, activity logs, integrations, licenses, and runtime error diagnostics.

A new site-wide runtime compatibility layer prevents legacy Sage pages from failing when browsers do not expose element IDs as globals. `tools/audit-runtime-globals.mjs` is the release preflight for this bug class.

## v0.28.2 - Client Portal Branding & Preview Recovery
- Client Portal now applies tenant business name, logo, primary, secondary and accent colors.
- Tenant-facing logo fallback is business initials, never Sage & Celebration artwork.
- Planner Preview Client Portal uses a secure read-only planner preview path instead of requiring a client session.
- Real client sessions remain unchanged.
- Event Workspace and event.html use tenant branding and no longer hard-code /assets/logo.png.
- event.html is synchronized with event-workspace.html to prevent route drift.

## v0.29.0 — Knowledge Base & Getting Started
Adds `/getting-started.html`, `/knowledge-base.html`, contextual page help, setup/integration walkthroughs, troubleshooting guidance, and Support/Settings links. No database migration required.

## v0.35.0 commerce parity
See `RELEASE-NOTES-v0.35.0.md` for the new white-label booking and decor-rental storefronts.

## v0.38.0 — Production Acceptance & Failure-Mode Hardening
Adds optimistic planner/client edit conflict protection for Floor Plans and Inspiration, verified Stripe partial/full refunds in Financial Center, custom-domain DNS/SSL diagnostics, and staging acceptance tests for stale writes and external integrations. Apply `supabase/migrations/0028_CONFLICT_REFUND_ACCEPTANCE.sql`. See `RELEASE-NOTES-v0.37.0.md`.


## v0.38 commercial launch operations
See `RELEASE-NOTES-v0.38.0.md` for tenant provisioning, entitlements, launch readiness, release notices and support escalation.


## v0.39.0 — First Customer UX & Launch Acceptance

This release simplifies the first-login experience, hides optional financial fields during event creation, replaces the crowded mobile dashboard navigation with a compact menu, and adds an opt-in full first-planner browser journey. See `RELEASE-NOTES-v0.39.0.md`. No new database migration is required beyond migrations through `0029_COMMERCIAL_LAUNCH_OPERATIONS.sql`.

## v1.0.1 beta validation
Platform owners can run controlled launch acceptance from `/beta-validation.html`. Apply migration `0030_BETA_VALIDATION_OPERATIONS.sql` after 0029. See `BETA-LAUNCH-RUNBOOK.md` and `RELEASE-NOTES-v1.0.1.md`.


## v1.1.0 premium audit

Start with `PREMIUM-PRODUCT-AUDIT.md`, `FEATURE-PRIORITY-MATRIX.md`, and `LIVE-ACCEPTANCE-REQUIREMENTS.md`. Run `npm run audit:premium` before deployment.

## v1.2.7 JavaScript Stability Hotfix

Shared browser helpers are now isolated from page-level lexical declarations, preventing duplicate `const $` / `const esc` syntax failures. Generic cross-origin/extension `Script error.` noise is filtered when the browser provides no actionable source details. See `RELEASE-NOTES-v1.2.7.md`.


## v1.2.8 Persistence Hotfix

Inspiration image uploads now carry a usable public image URL into the saved design item. Event Workspace floor-plan saves now persist into the canonical `tenant_floorplans` records, preserving room dimensions, custom layout names, objects, and the active layout across reloads and across planner/client views. The standalone Floor Plan now exposes and saves the actual layout name. See `RELEASE-NOTES-v1.2.8.md`.
