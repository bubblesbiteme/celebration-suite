# Celebration Suite backend connection check (v1.4.1)

The v1.4.1 planner and client portals use the multi-tenant tables (`tenants`, `tenant_events`, `tenant_inspiration_items`, `tenant_floorplans`, etc.).

If a deployed site displays event data while the configured Supabase project's `tenants` and `tenant_events` tables are empty, that deployed site is not running against this v1.4.1 tenant backend. Either:

1. Netlify environment variables point to another Supabase project, or
2. the live site is still an older booking-based deployment.

For the production Netlify site, verify these environment variables:

- `SUPABASE_URL` — must be the intended Celebration Suite project URL.
- `SUPABASE_SERVICE_ROLE_KEY` — must be the service-role key from that same project.

After changing environment variables, trigger a fresh production deploy and clear the old service-worker cache/reload the site.

Do not mix a URL from one Supabase project with a service-role key from another project.
