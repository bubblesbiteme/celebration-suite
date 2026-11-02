# Celebration Suite v0.38.0 — Commercial Launch Operations

## Added
- Platform tenant provisioning with optional controlled trial access and secure owner password setup.
- Central entitlement endpoint describing plan status, event limits, modules, grace state and trial expiration.
- Launch Readiness console with tenant-by-tenant activation blockers and warnings.
- Platform release notices with per-user read state and in-app planner banners.
- Support SLA fields and an automated escalation runner for overdue tickets.
- Manual launch block fields so the platform owner can keep an unsafe tenant from launch even when billing is valid.

## Deployment
1. Apply `supabase/migrations/0029_COMMERCIAL_LAUNCH_OPERATIONS.sql`.
2. Schedule `/.netlify/functions/support-escalation-run` with the same automation secret pattern used by other scheduled functions.
3. Use `/launch-readiness.html` before activating paid or trial tenants.
4. Trial provisioning is intentionally platform-controlled rather than automatically granted to every public registration.

## Plan behavior
- Single Event retains the one-event restriction already enforced by the Events API.
- Monthly Unlimited retains the existing 30-day internal grace/recovery behavior.
- Annual Unlimited expires at term end unless renewed/replaced.
- Trial accounts use a normal plan entitlement with `trial_ends_at` recorded, so the same permission and expiry logic applies.
