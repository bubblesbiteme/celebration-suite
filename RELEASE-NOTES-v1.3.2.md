# Celebration Suite v1.3.2 — Floor Plan Continuous Autosave & Print Isolation

## Fixed
- Replaces recovery-only Floor Plan behavior with debounced server autosave while planners work.
- Autosaves room dimensions, item positions, item sizes, rotation, measurements, calibration, background plan, opacity, object assignments, notes, and layout name.
- Prevents the Event Workspace 45-second background refresh from rerendering and wiping an active Floor Plan session.
- Adds local recovery for embedded Event Workspace Floor Plans if a network save fails or the page closes before a save completes.
- Adds an explicit editable layout-name field to the Event Workspace and repopulates the full named-layout selector correctly.
- Keeps standalone Floor Plan custom names synchronized with the saved database record and dropdown.
- Makes Print / PDF generate a dedicated floor-plan sheet rather than printing navigation, palettes, controls, sidebars, or surrounding Event Workspace content.
- Keeps the existing manual Save + Share action as an immediate flush while continuous autosave runs in the background.

## Deployment
No database migration is required.

Deploy the full v1.3.2 package and hard refresh once so service-worker cache `celebration-suite-v132` replaces earlier Floor Plan JavaScript.
