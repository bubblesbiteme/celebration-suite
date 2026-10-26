# Celebration Suite — Product Spec

## License products

### Single Event
- Maximum 1 event.
- Event date is required when activating the license.
- License expiration = event date + 90 days.
- Event data remains stored after expiration; editing is blocked until renewed.

### Annual Unlimited
- Unlimited events.
- License expiration = activation date + 1 year.
- Data remains stored after expiration; editing is blocked until renewed.

## White-label controls
Each tenant controls:
- Business name
- Logo URL
- Primary, secondary, and accent colors
- Email sender name
- Reply-to email
- Tenant-owned email provider credentials

## Email providers
The first build supports:
- Resend API key owned by the tenant
- Standard SMTP credentials owned by the tenant

Credentials are encrypted at rest with `INTEGRATION_ENCRYPTION_KEY`.

## Marketplace fulfillment
Marketplace orders can be fulfilled with one-time license codes generated in `/platform-admin.html`.

## Tenant isolation
All planner data is keyed by `tenant_id` and all planner API requests derive tenant scope from the signed HttpOnly session cookie. The browser never supplies an authoritative tenant ID.

## Expiration behavior
Expired accounts are retained but blocked from planning mutations. This avoids destructive deletion and makes renewal possible.
