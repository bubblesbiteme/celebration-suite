# Celebration Suite v1.3.9 — Client Board Persistence + Per-Client Photo Spaces

## Fixed
- Client Inspiration Board reloads now use the canonical event-scoped inspiration item transforms (x/y position, width, height, rotation, and layer order).
- Client board moves/resizes/rotations no longer revert to default positions after leaving or reloading the page.
- Planner and client Inspiration Boards now read/write the same event-scoped canonical item geometry.

## Guest Photo QR isolation
- Guest photo galleries remain isolated by tenant + event, with one unique public token/QR per event.
- Planner Guest Photo Gallery event selector now identifies the client, date, and event.
- QR panel clearly identifies which client/event owns the displayed code.
- Downloaded QR filenames include the client/event identity to avoid mixing codes between clients.
- Each event retains its own private submission gallery and client-facing approved photo space.

## Database
- No new migration is required beyond v1.3.8 migration `0035_GUEST_PHOTO_QR_GALLERY.sql`.
