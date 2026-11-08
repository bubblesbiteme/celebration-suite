# Celebration Suite v1.1.0 — Premium Experience & Reliability Audit

## Summary

This release completes an independent product-wide route, API, schema, security, transition and usability audit of the v1.0.5 suite. It also introduces audience-aware DIY and Professional Planner experiences while retaining one shared feature-complete platform.

## Key changes

- Added a shared premium page-transition, focus, reduced-motion and safe-error layer.
- Added DIY Party Planner and Professional Planner workspace modes.
- Added automatic active-event context preservation on event-scoped links.
- Consolidated duplicate legacy Event Workspace routing when applicable.
- Corrected stale health/readiness schema references and missing shared assets found by the independent audit.
- Added security headers and migration `0032` for additive authentication-throttling infrastructure.
- Added complete transition and control audit exports.
- Added an honest live-acceptance boundary and prioritized feature roadmap.

## Database

Apply `0032_PREMIUM_RELIABILITY_SECURITY.sql` after migration `0031`.

## Important

Provider-backed integrations and complex drag/drop/mobile workflows still require the deployed staging acceptance process described in `LIVE-ACCEPTANCE-REQUIREMENTS.md`.
