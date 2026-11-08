# Celebration Suite v1.4.0 — Canonical Inspiration Board Sync

## Fixed
- Client Inspiration Board drag, resize, rotate, and layer changes now save directly to the same `tenant_inspiration_items` geometry fields used by the planner Design Studio.
- Removed the client-side dependency on the legacy whole-board layout compatibility state for rendering/saving card geometry.
- Client saves now use per-item optimistic locking (`lock_version`) and return the canonical saved row.
- Planner and client views now render the same canonical `x`, `y`, `width`, `height`, `rotation`, and `z_index` values for each event-scoped item.
- Browser/PWA cache version bumped to `celebration-suite-v140` so deployed clients replace older board behavior.

## Data model
No new Supabase migration is required. v1.4.0 uses the existing v1.3.9 canonical Inspiration Board columns already deployed to `tenant_inspiration_items`.
