# Celebration Suite v1.3.3 — Floor Plan Seating Chart

## Added

- Floor Plan Seating Chart powered by the event guest list.
- Drag a guest/household onto a table or choose a table from the guest row.
- Party-size-aware capacity using RSVP attending count when available.
- Individual seat-number assignment with automatic seat-range labels for parties.
- Duplicate prevention: a guest record can only be seated once per layout.
- Auto-seat unassigned guests while respecting available table capacity.
- Unseat/reassign controls and clear-all seating.
- New tables receive practical unique labels such as Table 1, Table 2, Head Table, and Sweetheart Table.
- Table occupancy is shown directly on the floor-plan canvas.
- Seating assignments persist inside the floor-plan objects and sync back to Guest Management through `table_name` and `seat_label`.
- Legacy `guest_ids`, existing guest table assignments, and existing saved layouts are normalized forward without a database migration.
- Floor-plan-only PDF/print output now includes the seating legend when assignments exist.
- Seating Chart workflow is available in both the standalone Floor Plan Maker and the Event Workspace Floor Plan.

## Backend compatibility

- Floor Plan guest payload now includes RSVP count, household, table and seat fields needed by the seating workflow.
- Guest bulk update now accepts `seat_label` as well as `table_name`.

## Deployment

No database migration is required. Deploy the complete v1.3.3 package and hard-refresh once so service-worker cache `celebration-suite-v133` replaces prior Floor Plan JavaScript.
