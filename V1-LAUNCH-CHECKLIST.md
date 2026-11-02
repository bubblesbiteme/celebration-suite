# Celebration Suite v1.2.0 Launch Checklist

## Platform
- [ ] Production Supabase project is configured and migrations `0001`–`0032` are applied in order.
- [ ] Netlify production environment matches the required `.env.example` values.
- [ ] Platform owner/admin login works with 2FA as intended.
- [ ] Backups and restore procedures have been tested on non-production data.
- [ ] Platform support notification email receives a test message.

## Billing and entitlements
- [ ] Single Event purchase/activation works and prevents creation beyond the licensed event.
- [ ] Monthly subscription activation, cancellation, grace behavior, and eventual blocking are tested.
- [ ] Annual activation and expiration rules are tested.
- [ ] Planner Stripe connection and customer invoice checkout are tested in Stripe test mode.
- [ ] Partial and full refund paths are tested with disposable payments.

## Planner onboarding
- [ ] New planner registration/password setup works.
- [ ] Business name, logo, and all brand colors persist after reload/sign-out/sign-in.
- [ ] The client portal and public storefronts show tenant branding, not Celebration Suite branding, where intended.
- [ ] First-event guided setup can be completed without technical knowledge.

## Planner/client event lifecycle
- [ ] Lead → proposal → agreement → invoice → payment → event flow works.
- [ ] Planner and client can both send messages and share documents.
- [ ] Inspiration items persist after move/resize/layer/reload and stale concurrent edits are rejected safely.
- [ ] Floor Plan objects persist after move/resize/rotate/reload and stale concurrent edits are rejected safely.
- [ ] Guests, RSVP, meal choices, QR codes, and check-in work.
- [ ] Inventory selection, reservation, checkout, return, and missing/damaged handling work.
- [ ] Event Day and Closeout work from a mobile browser.

## Commerce
- [ ] Tenant Instant Booking package/add-on/deposit checkout works.
- [ ] Rental storefront only exposes inventory marked rentable.
- [ ] Rental date/quantity conflicts are prevented.
- [ ] Abandoned checkout reminders send and expire correctly.

## Integrations
- [ ] Google Calendar connects, syncs, survives refresh, and displays reconnect state after revoked authorization.
- [ ] QuickBooks connects and displays reconnect state after revoked authorization.
- [ ] Stripe health check detects invalid/revoked credentials.
- [ ] Email sending is verified for platform and at least one tenant.
- [ ] SMS is verified if offered at launch.

## White label / domains
- [ ] Client login embed/link works from an external test page.
- [ ] One custom domain passes ownership, DNS, and HTTPS checks.
- [ ] Browser push can be enabled, receives a test, and receives a real planner notification.

## Accessibility/mobile
- [ ] All critical flows are usable with keyboard only.
- [ ] Visible focus is present throughout planner and client experiences.
- [ ] Mobile navigation closes after selection and with Escape on hardware keyboards.
- [ ] Critical screens are checked at common phone widths without horizontal page overflow.
- [ ] Reduced-motion preference does not leave essential state hidden.

## Operations
- [ ] Launch Readiness shows the test tenant as safe only after required setup is complete.
- [ ] Manual launch block prevents planner access and can be cleared.
- [ ] Urgent support ticket escalation is tested on staging.
- [ ] Release notice appears once and stores dismissal/read state.
- [ ] Privacy Notice, Terms, and EULA have been reviewed/approved by qualified counsel before public launch.


## Controlled beta sign-off
- [ ] Create a run in `/beta-validation.html`.
- [ ] Complete every P0 acceptance check with evidence.
- [ ] Record all defects as P0/P1/P2.
- [ ] Confirm the run decision is not NO-GO.
- [ ] Save/print the final launch report.
- [ ] Repeat a production smoke run before inviting more planners.


## Original Sage parity verification

- [ ] Migration `0031_ORIGINAL_PARITY_RECONCILIATION.sql` applied.
- [ ] `npm run audit:original-parity` passes.
- [ ] Event Workspace AI tab loads and, when `OPENAI_API_KEY` is configured, can generate/review/delete an event-scoped response.
- [ ] Legacy staff/admin/client/payment/proposal/agreement links redirect to their current Celebration Suite equivalents without a 404.
- [ ] `ORIGINAL-PARITY-RECONCILIATION.md` reviewed; Sage-only marketing exclusions are understood.


## Ultra-premium visual acceptance
- [ ] Planner, client, public and operational pages clearly belong to one design system.
- [ ] Tenant colors appear as controlled accents and never reduce text contrast.
- [ ] No page uses thick black borders, emoji navigation, raw JSON/provider errors, or large accidental color floods.
- [ ] Landing and pricing pages render correctly at desktop, tablet and phone widths.
- [ ] Client Portal branding, navigation, action hierarchy and empty states are visually approved.
- [ ] Event Workspace, Communications, Financials, Guests, Inventory, Floor Plan and Inspiration are reviewed with realistic populated data.
- [ ] Command/Ctrl + K opens quick navigation and preserves the active event.
- [ ] Guided Planning hides professional navigation noise without removing access to needed tools.
- [ ] Professional Workspace exposes the complete operating toolset.
- [ ] Safari, Chrome and Firefox receive a visual smoke test before launch.
