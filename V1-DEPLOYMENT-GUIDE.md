# Celebration Suite v1.0.0 Deployment Guide

## 1. Database migration order
Apply every migration in `supabase/migrations` in numeric order on a fresh environment:

1. `0001_WHITE_LABEL_PLATFORM.sql`
2. `0002_CRM_PROPOSALS_FINANCIALS.sql`
3. `0003_ADVANCED_PLANNING_TOOLS.sql`
4. `0004_TEAM_AUTOMATION_AGENCY.sql`
5. `0005_COMMERCIALIZATION_ONBOARDING.sql`
6. `0006_MONTHLY_BILLING_AND_UNIFIED_AUTH.sql`
7. `0007_RELIABILITY_DRAFTS_AND_SYNC.sql`
8. `0008_LAUNCH_EMAIL_PASSWORD_RESETS.sql`
9. `0009_OPERATIONS_EXPANSION.sql`
10. `0010_INTEGRATIONS_PLANNING_SECURITY.sql`
11. `0011_CLIENT_WORKFLOW_EVENT_OPERATIONS.sql`
12. `0012_BUSINESS_GRADE_OPERATIONS.sql`
13. `0013_PLATFORM_CONTROL_INTELLIGENCE.sql`
14. `0014_DEEP_WORKSPACE_DESIGN_STUDIO.sql`
15. `0015_DEEP_EVENT_OPERATIONS_PARITY.sql`
16. `0016_DEEP_CLIENT_JOURNEY_COMMUNICATIONS.sql`
17. `0017_GUEST_COMMERCE_QR_TICKETING.sql`
18. `0018_QR_INVENTORY_BULK_MEDIA_RESERVATIONS.sql`
19. `0019_ORIGINAL_PRODUCT_PARITY_BRIDGE.sql`
20. `0020_DEEP_OPERATIONS_WORKSPACE_PARITY.sql`
21. `0021_ORIGINAL_CORE_WORKFLOW_CLONE.sql`
22. `0022_ORIGINAL_WORKFLOW_CLIENT_GUEST_FINANCIAL_PARITY.sql`
23. `0023_PLATFORM_ADMIN_OBSERVABILITY.sql`
24. `0024_PLATFORM_ADMIN_ACTIONS.sql`
25. `0025_SHARED_EVENT_COLLABORATION.sql`
26. `0026_WHITE_LABEL_COMMERCE_STOREFRONTS.sql`
27. `0027_CUSTOM_DOMAINS_PUSH_RESILIENCE.sql`
28. `0028_CONFLICT_REFUND_ACCEPTANCE.sql`
29. `0029_COMMERCIAL_LAUNCH_OPERATIONS.sql`

Existing v0.39 databases already current through `0029` need no new v1 migration.

## 2. Required environment
Start from `.env.example`. At minimum configure production Supabase, platform URL, email, Stripe/platform billing variables, Google OAuth, and any integration credentials you intend to offer.

For browser push configure `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT`.

For automatic custom-domain alias provisioning configure `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`.

For support escalation email configure `SUPPORT_NOTIFICATION_EMAIL` or `SUPPORT_EMAIL` plus the platform mailer variables.

## 3. Scheduled jobs
The build contains these scheduled workflows:
- `automation-run`: hourly via `netlify.toml`
- `event-closeout-run`: daily via `netlify.toml`
- `commerce-recovery`: hourly at minute 15 via function schedule config
- `support-escalation-run`: every 15 minutes via function schedule config

Confirm all four appear in the deployed Netlify Scheduled Functions view after deployment.

## 4. Production validation
Run `npm install`, then `npm run release:audit` before deploying.

For browser acceptance testing install Playwright browsers and use the configuration documented in `tests/e2e/README.md`. Use a disposable staging tenant for mutating tests.

## 5. Go-live order
1. Deploy to staging.
2. Apply/verify migrations.
3. Configure integrations and scheduled jobs.
4. Complete a disposable planner onboarding and first-event flow.
5. Test client login in a separate browser profile.
6. Test Stripe in test mode, including refund behavior.
7. Test one custom domain through DNS and HTTPS.
8. Review Launch Readiness and resolve every blocker.
9. Review legal documents with counsel.
10. Promote the exact tested build to production.
