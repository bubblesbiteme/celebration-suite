# Celebration Suite v1.2.9 — Event Context & Inspiration Upload Hotfix

## Fixed
- Event Workspace POST actions now include the active event ID in the request URL and JSON body.
- The Event Workspace backend now accepts `booking_id` / `event_id` from the request body as a safe fallback.
- Inspiration image upload signing no longer fails with `Event ID is required` when launched from an event workspace.
- Client-side inspiration upload signing now returns and preserves the public media URL as well.
- Service worker cache bumped to `celebration-suite-v129`.

## Database
No migration is required. Remain current through migration `0033_FLOORPLAN_INCHES_BRANDING_RESILIENCE.sql`.
