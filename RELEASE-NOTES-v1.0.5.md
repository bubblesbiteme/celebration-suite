# Celebration Suite v1.0.5 — Communications Schema Hotfix

## Fixed
- Communications Center no longer queries the nonexistent `tenant_events.client_phone` column.
- Event-client phone numbers are read from `tenant_events.workspace_data.client_phone`, matching the current event schema.
- Communications falls back to the matching `tenant_clients.phone` value by client email for older or manually-created events.
- Inbound communication matching uses the same schema-safe phone lookup.

## Deployment
No new database migration is required. Deploy the updated site/functions over v1.0.4.
