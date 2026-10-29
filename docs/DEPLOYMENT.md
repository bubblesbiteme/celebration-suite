# Celebration Suite Deployment

## Current production identity
- Site: `https://planner.sageandcelebration.com`
- Operator: Sage & Celebration LLC
- Support: `support@sageandcelebration.com`

## Database
Run migrations in order:
1. `0001_WHITE_LABEL_PLATFORM.sql`
2. `0002_CRM_PROPOSALS_FINANCIALS.sql`
3. `0003_ADVANCED_PLANNING_TOOLS.sql`
4. `0004_TEAM_AUTOMATION_AGENCY.sql`
5. `0005_COMMERCIALIZATION_ONBOARDING.sql`
6. `0006_MONTHLY_BILLING_AND_UNIFIED_AUTH.sql`

If 0001–0005 are already installed, run only migration 0006.

## Netlify environment variables
Required core values:
- `SITE_URL=https://planner.sageandcelebration.com`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET`
- `INTEGRATION_ENCRYPTION_KEY`
- `PLATFORM_ADMIN_KEY`
- `PLATFORM_OWNER_EMAIL=support@sageandcelebration.com`

Stripe platform billing:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_SINGLE_EVENT`
- `STRIPE_PRICE_MONTHLY`
- `STRIPE_PRICE_ANNUAL`
- `PUBLIC_PRICE_SINGLE=99`
- `PUBLIC_PRICE_MONTHLY=59`
- `PUBLIC_PRICE_ANNUAL=499`

Google sign-in:
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_STATE_SECRET` (recommended; otherwise `SESSION_SECRET` is used)

## Google OAuth
Use a Web application OAuth client. Add the production redirect URI:

`https://planner.sageandcelebration.com/.netlify/functions/google-auth-callback`

The same verified Google identity flow serves platform admins, planner/team accounts and invited clients. Authorization is still based on Celebration Suite account/invitation records.

## Stripe monthly subscription
Create a recurring monthly Stripe Price for **$59 USD/month** and set its Price ID as `STRIPE_PRICE_MONTHLY`.

Create a webhook endpoint:

`https://planner.sageandcelebration.com/.netlify/functions/stripe-webhook`

Enable:
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

Enable Stripe Customer Portal if you want monthly subscribers to update payment methods from Celebration Suite.

## Platform owner login
Normal daily access is now through `/platform-login.html` using email/password or Google. The existing `PLATFORM_ADMIN_KEY` is retained for first-time owner password setup and emergency recovery.

## Verification before sales
1. Planner email/password sign-in.
2. Planner Google sign-in with same approved email.
3. Admin/team Google sign-in.
4. Staff invite acceptance with password and Google.
5. Client first-time setup with password.
6. Client Google sign-in using invited client email.
7. Single Event checkout.
8. $59 Monthly Unlimited subscription checkout.
9. Annual Unlimited checkout.
10. Stripe payment-failure/recovery webhook test in test mode.
11. Confirm an account becomes blocked when its internal billing-recovery cutoff is moved into the past in test data.
12. Confirm client portal shows only a neutral unavailable message for an inactive planner account.

## v0.6.1 reliability migration
If migrations 0001-0006 are already installed, run only:

`supabase/migrations/0007_RELIABILITY_DRAFTS_AND_SYNC.sql`

Then deploy the complete package. Do not deploy only `portal.html` or `event.html`; the client draft endpoint in `netlify/functions/client-draft.mjs` is required.

After deployment, hard-refresh any previously open Celebration Suite tabs. Validate the 45-second Client Portal/Event Day refresh and the 2.5-second autosave behavior described in `docs/RELIABILITY-HOTFIX-REFERENCE.md`.
