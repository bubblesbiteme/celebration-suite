# Celebration Suite v0.36.0 — White-Label Infrastructure & Production Resilience

## Added
- Verified custom tenant domains with DNS TXT ownership checks.
- Optional Netlify API domain-alias provisioning using `NETLIFY_AUTH_TOKEN` + `NETLIFY_SITE_ID`.
- Custom-domain tenant resolution for Instant Booking, Decor Rentals, and Client Login.
- Browser Web Push subscription management, opt-in/out controls, test notifications, and service-worker delivery/click handling.
- Active integration health checks for Google Calendar, Stripe, and QuickBooks.
- Reconnect-required state tracking and planner-facing reconnect actions for OAuth integrations.
- Integration health metadata: last checked, last success, last error, and reconnect requirement.

## Database
Apply `supabase/migrations/0027_CUSTOM_DOMAINS_PUSH_RESILIENCE.sql`.

## Environment variables
Optional custom-domain automation:
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

Web Push:
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

## Custom domain DNS
After adding a domain in Settings → Custom Domains, the planner receives a TXT verification record. The domain should also be pointed to the deployed Celebration Suite site according to the DNS provider/Netlify instructions. TXT verification prevents one tenant from claiming another business's domain.

## Notes
Stripe uses a tenant-supplied secret key rather than OAuth, so an invalid/revoked Stripe key is reported as an integration error. Google Calendar and QuickBooks surface a dedicated reconnect flow when authorization is no longer valid.
