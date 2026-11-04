# Celebration Suite v1.3.4 — True-Scale Furniture Library & Chair Controls

## Floor Plan furniture library

- Replaced chair-count table presets with physical-size equipment presets.
- Round tables now include 36 in, 48 in, 60 in (5 ft), and 72 in (6 ft).
- Rectangle tables now include 4 ft, 6 ft, and 8 ft sizes.
- Added size-based farm, king’s, head, picnic, half-round, serpentine, and cocktail/highboy presets.
- Removed the separate “Table — no chairs” and “Long table — no chairs” palette items.

## Per-item chair controls

- Every table now has its own Show chairs toggle.
- Chair count/capacity is editable per placed table.
- Chair symbols are rendered at an 18 in physical footprint relative to the table and room scale.
- Cocktail/highboy tables default to chairs hidden but can display chairs when the planner chooses.
- Seating Chart capacity continues to use the table’s chair count and never drops below already-assigned seats.

## Geometry and scale

- Table bodies render from their real physical width/depth in the same inch-based coordinate system as the room.
- Round tables remain true circles.
- Half-round tables render with a true semicircular profile.
- Serpentine tables render with a curved serpentine profile instead of a generic rectangle.
- Existing legacy table presets are mapped forward to equivalent physical-size table types without losing labels or seating assignments.

## Surfaces

The same equipment model is applied to the standalone Floor Plan Maker, Event Workspace Floor Plan, and Client Portal Floor Plan.

## Deployment

No database migration is required. Deploy the complete v1.3.4 package and hard-refresh once so service-worker cache `celebration-suite-v134` replaces prior Floor Plan JavaScript.
