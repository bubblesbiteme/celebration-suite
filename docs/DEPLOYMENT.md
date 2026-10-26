# Celebration Suite Deployment

# Deployment

1. Create a brand-new Supabase project dedicated to this product.
2. Run the Supabase migrations in order:
   - `0001_WHITE_LABEL_PLATFORM.sql`
   - `0002_CRM_PROPOSALS_FINANCIALS.sql`
   - `0003_ADVANCED_PLANNING_TOOLS.sql`
   - `0004_TEAM_AUTOMATION_AGENCY.sql`.
3. Create a brand-new Netlify site/repository. Do not deploy this into any existing Sage & Celebration project.
4. Copy `.env.example` values into the new Netlify site's environment variables.
5. Set strong unique values for `SESSION_SECRET`, `INTEGRATION_ENCRYPTION_KEY`, and `PLATFORM_ADMIN_KEY`.
6. Deploy.
7. Open `/platform-admin.html`, enter the platform admin key, and create test license codes.
8. Register a test planner account, redeem a code, set branding, create an event, and open its client portal.
9. Open Team & Permissions, invite a test staff user, assign that user to one event, and verify they cannot open an unassigned event.
10. Open Automation Center once to seed the default automation rules, configure them, and use Run Now for a test pass. The hourly runner is configured as a Netlify Scheduled Function.

No Sage & Celebration keys, database URLs, cookies, domains, OAuth clients, or storage buckets should be reused.
