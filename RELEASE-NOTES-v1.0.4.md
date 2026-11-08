# Celebration Suite v1.0.4 — Client Collaboration Lock Hotfix

## Fixed

- Planner Preview no longer forces the client portal into read-only mode. Preview now reflects the actual client editing state.
- Client planning is editable by default unless the planner explicitly enables an immediate lock or sets a lock date.
- Legacy `portal_permissions` data may still control visible portal sections, but legacy lock fields no longer silently lock current client accounts.
- Event Workspace Client Portal Access now reports the same canonical lock state used by the client portal.

## Deployment

No new database migration is required. Deploy over v1.0.3 with the database current through migration `0031_ORIGINAL_PARITY_RECONCILIATION.sql`.
