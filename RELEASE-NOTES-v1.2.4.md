# Celebration Suite v1.2.4 — True-Scale Floor Plan

## Fixed
- Rebuilt planner floor-plan scaling around inches as the physical source of truth.
- Corrected mixed Room width (in) / Room depth (ft) controls.
- New objects now receive real physical dimensions in inches instead of arbitrary pixel sizes.
- Existing feet-based and pixel-only floor-plan items are normalized forward without deleting layouts.
- Room canvas aspect ratio follows the physical room dimensions.
- Grid uses real 12-inch minor spacing and 60-inch major spacing with a clear room boundary.
- Snap-to-grid snaps against real room inches instead of normalized percentage increments.
- Selected-item editors use physical inches; pixel-size editing has been removed from planner/client floor-plan tools.
- Venue-image calibration uses a measured known distance in inches and scales physical objects against the calibrated image.
- Room labels show exact inch dimensions plus a feet reference.
- Standalone, Event Workspace, and client portal floor-plan paths use the same measurement model.

## Deployment
No new database migration is required. Existing saved floor plans are normalized at runtime and persisted on the next save.
Service-worker cache is bumped to `celebration-suite-v124`.
