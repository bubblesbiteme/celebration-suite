# Celebration Suite v1.4.4

## Supabase environment hardening

- Accepts either `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` on the server.
- Trims leading/trailing whitespace from Supabase URL/key environment values.
- Removes accidental wrapping single or double quotes from environment values.
- Applies the same normalization to REST, Storage, health, upload, document, inventory, guest-photo, and scheduled-job Supabase calls.
- Preserves support for modern `sb_secret_...` keys and legacy JWT `service_role` keys.
- Bumps service-worker cache to v1.4.4.
