# Celebration Suite Product Specification

## Plans

### Single Event — $99 one-time
- One licensed event.
- Access through 90 days after the event date.
- Historical events may remain when a later Single Event entitlement is purchased.

### Planner Unlimited Monthly — $59/month
- Unlimited events.
- Recurring month-to-month Stripe subscription.
- Payment failures enter an internal recovery state; unpaid accounts are eventually suspended while data remains retained.
- The internal recovery timing is operational policy and is intentionally not shown in customer-facing product copy.

### Planner Unlimited Annual — $499/year
- Unlimited events for 12 months.
- Early renewal preserves remaining paid time.

## Authentication
- Platform owners/admins: email/password or approved Google account.
- Planner tenant owners/admins/planners/staff: email/password or Google using an existing approved account email.
- Staff invitation acceptance: email/password or the invited Google account.
- Clients: email/password or the Google account matching the event invitation email.
- Google identity is verified server-side and never authorizes a role merely because a Google account exists.

## Tenant isolation
All planner data is keyed by `tenant_id` and all planner API requests derive tenant scope from the signed HttpOnly session cookie. The browser never supplies an authoritative tenant ID.

## Access suspension
Inactive or unpaid accounts retain stored data but lose active planning access. Client portals use a neutral unavailable message rather than disclosing the planner's billing status.
