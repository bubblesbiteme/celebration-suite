# Celebration Suite v1.3.7 — Collaboration & Import Stability

This release fixes the collaboration and import issues reported during live use.

## Fixed
- Floor Plan seating chart is now visible beside the canvas through the Item Details / Seating side workspace on planner Floor Plan surfaces.
- Planner Inspiration Board transforms now persist to canonical `tenant_inspiration_items` records instead of only workspace fallback state.
- Planner and client Inspiration saves are serialized so older requests cannot overwrite newer drag/resize/rotation changes.
- Planner and client document links now route through authenticated signed-file open functions; existing private uploads are viewable without exposing storage paths.
- Signed Supabase document URLs are normalized safely whether Supabase returns a full URL, `/storage/v1/...`, or `/object/...` path.
- Questionnaire CSV import strips BOM characters, supports quoted CSV, recognizes column aliases, maps boolean questions to Yes/No radio fields, preserves ordering, previews all questions before import, and uses the file name as the template name when no template column exists.
- Master Inventory bulk CSV preview is now a readable table with friendly headers instead of raw JSON.
- Master Inventory → Inspiration Board selection now returns to the originating Inspiration surface and preserves the event ID.
- Event Workspace honors `?tab=design` on return.
- Utility headers no longer show a Guided/Professional selector on pages where that mode does not change the page; contextual Help stays with the header action group.

## Deployment
No new Supabase migration is required. Deploy the complete package and hard-refresh once so service-worker cache `celebration-suite-v137` replaces older browser assets.
