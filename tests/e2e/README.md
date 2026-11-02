# Critical browser regression suite

Run against a deployed/staging Celebration Suite instance. The suite intentionally exercises a real browser because static contract audits cannot catch broken click, drag, navigation, persistence or branding behavior.

Required for authenticated coverage:

- `CS_E2E_BASE_URL` - staging URL
- `CS_E2E_PLANNER_EMAIL`
- `CS_E2E_PLANNER_PASSWORD`
- `CS_E2E_EVENT_ID` - disposable test event
- `CS_E2E_CLIENT_URL` - disposable client invitation or tenant client-login URL

Install dependencies with `npm install`, install Chromium with `npx playwright install chromium`, then run `npm run test:e2e:critical`.

Use a staging tenant and event. The floor-plan test may create/update test layout data.
