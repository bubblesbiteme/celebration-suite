# Celebration Suite v1.2.5 — Custom Domain TXT Generation Hotfix

- Rebuilt custom-domain submit handling with explicit DOM binding.
- Added visible generating/success/error states and request timeouts.
- TXT verification record now renders immediately after domain creation.
- Added one-click copy controls for TXT host and value.
- Re-submitting an existing domain for the same tenant returns its existing TXT token instead of failing.
- Duplicate domains owned by another tenant return a clear conflict message.
- Service-worker cache bumped to `celebration-suite-v125`.
- No database migration required.
