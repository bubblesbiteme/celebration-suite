# Celebration Suite v1.0.1 — Deployment & Beta Validation

This release adds a platform-owner validation workflow for controlled beta launch.

## Added
- Beta Validation operator console (`/beta-validation.html`).
- Tenant-specific validation runs for staging or production.
- 30 seeded acceptance checks spanning provisioning, onboarding, client collaboration, Inspiration, Floor Plan, inventory, guests, commerce, Event Day, integrations, mobile, accessibility, recovery and support operations.
- P0/P1/P2 issue triage with status tracking.
- Automatic GO / CONDITIONAL / NO-GO decision logic.
- Evidence and notes storage per test.
- Printable launch report endpoint for each run.
- Navigation from Platform Admin, Commercial Launch and Launch Readiness.

## Database
Apply `0030_BETA_VALIDATION_OPERATIONS.sql` after migration 0029.
