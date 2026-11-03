# Celebration Suite v1.3.1 — Platform Stripe Webhook Recovery

## Fixed
- Restores the deployed `/.netlify/functions/platform-stripe-webhook` endpoint expected by the live Stripe account.
- Keeps the legacy `/.netlify/functions/stripe-webhook` endpoint working.
- Accepts `PLATFORM_STRIPE_WEBHOOK_SECRET` as the preferred endpoint signing secret, with `STRIPE_WEBHOOK_SECRET` retained as a fallback.
- Keeps subscription lifecycle handling for paid invoices, failed invoices, subscription updates and subscription cancellations.
- Updates launch health and deployment guidance for the platform webhook endpoint.

## Deployment
No database migration is required.

After deploying, set the signing secret for the Stripe endpoint in Netlify as `PLATFORM_STRIPE_WEBHOOK_SECRET` (or keep the same endpoint secret in `STRIPE_WEBHOOK_SECRET`). Then use Stripe Dashboard webhook delivery controls to resend a recent failed event or send a test event. A correctly signed delivery should receive HTTP 200.
