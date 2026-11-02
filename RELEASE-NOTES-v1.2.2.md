# Celebration Suite v1.2.2 — Floor Plan, Branding & Workspace Resilience

- Floor-plan physical dimensions are now inches across planner/client-facing workflows.
- Room width/height immediately changes the canvas aspect ratio and measurement scale.
- Existing feet-based plans are converted to inches with migration 0033 and runtime compatibility.
- Fixed Event Workspace load failure caused by obsolete `CSTenantBrand` global; uses `CSBrand` safely.
- Dashboard license loading now times out to an actionable retry state instead of spinning forever.
- Branding adds planner-selectable heading, body, and button font colors, stored in tenant branding JSON.

## Migration
Apply `supabase/migrations/0033_FLOORPLAN_INCHES_BRANDING_RESILIENCE.sql`.
