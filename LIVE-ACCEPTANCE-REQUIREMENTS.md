# Live Acceptance Requirements

The following cannot be proven by a source-only audit and must be tested on the deployed staging site with disposable planner, client, staff, partner and guest records.

## P0 live acceptance

- Planner and client authentication, reset links, 2FA and session expiry.
- Tenant branding on login, client portal, proposals, contracts, invoices, RSVP, booking, rentals and email.
- Planner/client simultaneous edits, conflict handling and refresh persistence.
- Inspiration drag, resize, layer, save, reload, approval and reservation flow.
- Floor Plan drag, resize, rotate, guest assignment, save/reload, print/export and mobile interaction.
- Inventory availability across events, rentals, design approvals and date overlaps.
- Guest import, RSVP, invitation email, unique QR, phone camera scanning and check-in.
- Stripe deposit, partial payment, full payment, failure, cancellation, refund and webhook idempotency.
- Google Calendar and QuickBooks connect, refresh, revoke and reconnect.
- Email, SMS, inbound reply matching, opt-out handling and delivery failures.
- Custom-domain DNS, TLS, tenant resolution and branded public links.
- Mobile Event Day under weak connectivity and PWA/offline behavior.
- Subscription, trial, single-event limit, monthly grace period and expiration enforcement.

## Release decision

Do not represent a feature as production-proven until its corresponding Beta Validation check includes evidence from staging. Static audits establish route, syntax, schema-contract and package integrity; they do not replace live provider or browser acceptance.
