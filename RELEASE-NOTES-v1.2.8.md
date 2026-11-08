# Celebration Suite v1.2.8 — Inspiration & Floor Plan Persistence Hotfix

## Fixed
- Event Workspace inspiration uploads now save the public image URL so uploaded images immediately render on the board.
- Event Workspace floor-plan saves now synchronize to the canonical `tenant_floorplans` table instead of a legacy workspace-only copy.
- Room width/height, objects, measurements, calibration, background, and sharing state now survive reloads.
- Custom layout names are persisted as the actual floor-plan record names.
- The selected/active layout name survives reloads.
- Standalone Floor Plan now has an explicit Layout Name field and new layouts prompt for their name before saving.
- Legacy Event Workspace and client views continue to consume the same canonical floor-plan records.
- Service-worker cache bumped to `celebration-suite-v128`.

No new database migration is required.
