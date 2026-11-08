# Celebration Suite v1.3.0 — Floor Plan Data Safety & Recovery

This release fixes a P0 Floor Plan persistence failure where an unsaved in-memory layout could be treated as a persisted plan and send the literal value `undefined` into a UUID query. That failure could prevent saving and cause the editor to reopen at the default room size.

## Fixes
- Only a valid persisted floor-plan UUID can use PATCH/update behavior.
- Unsaved layouts always create a new `tenant_floorplans` record first.
- Backend rejects or safely recovers invalid/missing floor-plan IDs before Supabase receives them.
- Venue-plan background upload no longer creates a fake persisted plan object.
- Local recovery drafts preserve layout name, room dimensions, objects, measurements, background, opacity and calibration.
- Drafts are scoped per event/layout and restored after reload or failed API saves.
- Recovery drafts only override the server copy when the draft is newer, preventing stale browser state from replacing newer collaborative edits.
- The active layout is remembered, but a blank `New layout` state is restored only when a real unsaved draft exists.
- Save failures keep the user's work on-device and show an explicit recovery message.
- Service-worker cache updated to `celebration-suite-v130`.

No database migration is required.
