# Celebration Suite v1.4.3

## Supabase new API key compatibility

- Fixes login failures when `SUPABASE_SERVICE_ROLE_KEY` contains a current `sb_secret_...` Supabase secret key.
- Server requests now send new opaque secret keys through the `apikey` header without incorrectly treating them as JWT bearer tokens.
- Legacy JWT `service_role` keys remain supported.
- Applies the compatibility rule to REST, Storage, platform health/observability, uploads, billing, and other server-only Supabase requests.
- Keeps the v1.4.2 legacy-to-tenant self-migration and two-way workspace sync changes.
- Service-worker cache bumped to `celebration-suite-v143`.

No additional database migration is required.
