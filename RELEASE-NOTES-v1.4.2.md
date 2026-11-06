# Celebration Suite v1.4.2

## Live legacy-to-tenant bridge
- Adds a secure, idempotent server-side legacy migration triggered only by an already-approved planner Google identity found in `admin_users`.
- Preserves legacy booking UUIDs as `tenant_events.id` so planner/client event identity stays stable.
- Migrates active legacy client accounts into `tenant_client_users` and creates `tenant_client_event_access`.
- Copies legacy `event_design_items` plus saved `inspiration_board_layout` geometry into canonical `tenant_inspiration_items`.
- Copies legacy `floor_plan_layout.versions` into shared/editable canonical `tenant_floorplans`, preserving room measurements and existing furniture/seating objects.
- Keeps all legacy records untouched as rollback/reference data.
- Bumps the service-worker cache to v1.4.2 so deployment replaces older portal code.
