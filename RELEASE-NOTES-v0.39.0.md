# Celebration Suite v0.39.0 — First Customer UX & Launch Acceptance

## Goal
Make the product easier for a brand-new paying planner to understand on first login and expand browser acceptance coverage around the complete first-event journey.

## First-login dashboard
- Adds an in-dashboard setup guide driven by the existing onboarding API.
- Reduces the essential launch path to four steps: business details, branding, email, first event.
- Shows one recommended next action instead of asking a new user to understand the whole product.
- The guide can be dismissed and disappears automatically when onboarding is complete.
- Payments and advanced integrations remain available but are not treated as blockers to beginning planning.

## Create Event simplification
- New-event creation keeps the primary fields visible: event name/type/date/venue/client.
- Service fee and client-funded decor budget are now under an optional Financial Details disclosure.
- Users can create the event first and enter financials later.

## Mobile dashboard navigation
- Replaces the always-expanded mobile navigation wall with a compact Menu control.
- Navigation opens as an overlay drawer and closes after selecting a destination.
- Getting Started/Help are removed from the already-crowded mobile top action strip but remain available in the menu.

## Event dashboard clarity
- Event cards show days-until-event context for upcoming events.
- Empty-state copy now tells the planner that only an event name is needed to get started.

## Browser acceptance coverage
New opt-in Playwright checks include:
- create a disposable event as a paying planner
- open the core event workspace
- visit Inspiration, Floor Plan, Guests, and Event Day with the new event context
- archive the disposable event after the test
- open planner and client sessions concurrently
- verify compact mobile dashboard navigation

Mutating journey tests require `CS_E2E_MUTATING=1` and should only be run against a disposable staging tenant.

## Audit
Adds `tools/audit-launch-ux.mjs` and includes it in `npm run release:audit`.

## Database
No new Supabase migration is required for v0.39.0. Apply all migrations through 0029 from earlier releases before deploying this build.
