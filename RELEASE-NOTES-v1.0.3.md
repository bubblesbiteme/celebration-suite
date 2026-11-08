# Celebration Suite v1.0.3 — Client Portal Branding & Workspace Refresh Hotfix

## Fixed

- Client Portal and Planner Preview now apply the tenant business name, logo, primary, secondary, and accent colors during the main render path.
- Invalid tenant logo URLs no longer leave a broken-image icon; the portal falls back to branded initials.
- The accessibility “Skip to main content” link is now visually hidden on custom-inline-CSS pages and only appears when keyboard-focused.
- Event Workspace cached-data refresh failures no longer raise a large red error toast for transient/background refresh failures. Cached data stays visible and the workspace refresh state indicates that saved data is being used.
- Background workspace refreshes are explicitly quiet while manual/authentication failures remain actionable.

## Database

No new migration is required. Database schema remains current through `0031_ORIGINAL_PARITY_RECONCILIATION.sql`.
