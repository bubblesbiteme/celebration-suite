# Celebration Suite v1.4.1 — True Two-Way Workspace Sync

## Fixed
- Added the missing `clientNormalizeFloorPlan()` runtime used by the client portal. This missing function could stop the client Floor Plan renderer before shared layouts were drawn.
- Client Floor Plan now keeps the canonical `tenant_floorplans.id` and `lock_version` from the planner-created shared layout.
- Added direct `floorplan-save` client action with optimistic locking. Client edits write to the same `tenant_floorplans` row used by the planner.
- Client Floor Plan autosaves after item drag, add, rotate, duplicate, delete, room-size edits, item-detail edits, background opacity changes, and clear actions.
- Client portal floor-plan payload now includes canonical floor-plan IDs and lock versions.
- Service-worker cache bumped to v141.

## Critical deployment note
The deployed Netlify site's `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` must point to the same Supabase project used by the planner and client portals. A database with zero Celebration Suite tenants/events cannot be the backend serving a portal that visibly contains event data.
