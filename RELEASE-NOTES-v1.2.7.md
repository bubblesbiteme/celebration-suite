# Celebration Suite v1.2.7 — JavaScript Stability Hotfix

## Fixed
- Removed shared global lexical helper declarations from `assets/app.js` that could collide with page-level `const $`, `const esc`, and related helpers.
- Kept `window.WLP` plus backward-compatible ordinary `window` properties so legacy pages continue to work without duplicate-identifier syntax failures.
- Filtered un-actionable browser/extension `Script error.` events when the browser provides no usable filename or stack detail.
- Added a dedicated JS-stability release audit.
- Bumped the service-worker cache to `celebration-suite-v127`.

## Important about existing Platform Admin logs
Existing error rows are historical records and do not disappear when code is corrected. After deploying v1.2.7, reproduce each workflow and resolve the old row if it does not recur.

No database migration is required.
