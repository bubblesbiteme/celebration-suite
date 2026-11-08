# Celebration Suite v1.4.5

## Correct Supabase project guard + two-way sync hardening

- Locks backend Supabase configuration to the Celebration Suite - S&G project ref `iwslswjidkdwlsfgvezu`; a Sage & Celebration project URL or legacy JWT is rejected with an explicit configuration error instead of silently connecting to the wrong database.
- Adds `/.netlify/functions/backend-connection-check`, a safe diagnostic endpoint that verifies the configured backend can reach the expected Celebration Suite database without exposing credentials.
- Routes REST and Storage functions through the same guarded Supabase configuration, including documents, inventory media, logos, guest photos, health checks, and platform admin tools.
- Advances Inspiration Board and Floor Plan `lock_version` values for planner-side edits so planner and client writes use the same optimistic-concurrency model.
- Preserves canonical Inspiration Board geometry in `tenant_inspiration_items` and canonical Floor Plan objects in `tenant_floorplans`.
- Corrects Platform Health queries to match the live Celebration Suite schema (`event_id`, `is_active`, `title`, and tenant support/access fields).
- No database migration is required for this release; the live Celebration Suite schema already contains the required canonical tables and lock-version fields.
- Live Celebration Suite Supabase maintenance RPCs (`expire_white_label_licenses`, `escalate_overdue_support_tickets`, and `rls_auto_enable`) were restricted to `service_role` execution only; no client-facing database policies were broadened.
- Service-worker cache bumped to `celebration-suite-v145`.
