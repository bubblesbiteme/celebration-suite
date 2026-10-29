# Celebration Suite reliability, hotfix, refresh and autosave standard

This file records reliability behavior that must survive future feature releases. It is based on lessons from the latest production reference platform and is intentionally implemented in Celebration Suite with separate credentials, tenant isolation and branding.

## Reference hotfixes reviewed

The v0.6.1 reliability pass explicitly reviewed these reference fixes/patterns:

- `QUESTIONNAIRE-CLOUD-DRAFTS-20261028.md` — local-on-input fallback, secure cloud draft after 2.5 seconds idle, immediate Save Draft, newer local/cloud recovery, draft clear only after successful final submit.
- `QUESTIONNAIRE-DRAFT-AND-PRINT-QR-UPDATE.md` — pause timed refresh while edits are dirty/focused so background sync cannot overwrite work.
- `TIMELINE-CLIENT-LIVE-SYNC-FIX.md` — fresh server reads on relevant navigation/foreground return and cache-resistant client sync.
- `RSVP-CLIENT-PORTAL-HOTFIX.md` — bind save actions independently, preserve dirty edits, show explicit success/failure state, refresh only after successful save.
- `CLIENT-LOGIN-LEGACY-EMAIL-FIX.md` — case-insensitive account matching and normalized lowercase identity behavior.
- `CLIENT-PASSWORD-RESET-FIX.md` — do not silently swallow delivery failures; keep privacy-safe generic responses for unknown accounts. Use this pattern when Celebration Suite password reset is added/expanded.
- `PORTAL-EMAIL-NOTIFICATIONS-FIX.md` — notification delivery must be observable and testable rather than assumed.
- `WORKSPACE-MESSAGE-LAYOUT-FIX.md` / `WORKSPACE-SCROLL-DELETE-FIX.md` — responsive composer/scroll controls must not regress during portal changes.
- `COMPLETE-BACKEND-DEPLOYMENT-REPAIR.md` — every hotfix package must contain the complete backend, not only changed HTML.
- `PRODUCTION-REGRESSION-SECURITY-CHECKLIST.md` — preflight + real production workflow testing after deploy.

## Refresh timing standard

| Surface | Automatic refresh | Additional refresh triggers | Edit protection |
|---|---:|---|---|
| Client Portal | 45 seconds | focus, tab becomes visible, reconnect, manual Refresh | timed refresh pauses while an active dirty message field is being edited |
| Event Day | 45 seconds | focus, tab becomes visible, reconnect, manual Refresh | operational actions save immediately before next refresh |
| Event Workspace | no blind timed reload | explicit navigation/load; save on page hide if dirty | local recovery + autosave prevent overwrite/loss |
| Slow admin counters/support-style badges | 60 seconds when implemented | focus/manual refresh as appropriate | counters only; never refresh an open editor blindly |

Refresh calls should be deduplicated/throttled. Client Portal uses a 1.5-second minimum refresh window to avoid overlapping fetches.

## Autosave standard

### Event Workspace
- Any mutable workspace action marks the workspace dirty.
- Local browser backup is written immediately.
- Secure server autosave starts after **2.5 seconds without another change**.
- Manual Save remains available and saves immediately.
- Navigating away with unresolved dirty changes triggers browser protection.
- Hiding the page/tab attempts an immediate save.
- If server save fails, the local copy remains and is restored when newer than the server record.
- The UI explicitly shows `Saving`, `Saved securely`, or local-only fallback state.

### Client message draft
- Local browser draft saves on every input.
- Secure tenant/client/event-scoped cloud draft saves after **2.5 seconds idle**.
- When the page loads, Celebration Suite compares local and cloud timestamps and restores the newer draft.
- On page hide/sign-out, an immediate cloud-draft attempt is made.
- A successfully sent message clears both local and cloud drafts.
- Draft storage does not itself send a message.

## Hotfix packaging rules

1. Always start from the latest complete Celebration Suite release.
2. Never ship a patch ZIP that omits `netlify/functions` or required migrations.
3. Run `npm run preflight` before packaging.
4. Run `node --check` across every Netlify `.mjs` function.
5. Parse-check inline browser JavaScript.
6. Verify ZIP integrity.
7. After deploy, hard-refresh old tabs when frontend caching could retain stale code.
8. When a migration is required, run it before deploying code that depends on the new table/columns.

## Production smoke tests after v0.6.1

- Edit an Event Workspace checklist item; confirm autosave completes without pressing Save.
- Simulate a failed save/offline state; reload and confirm the newer local draft is recovered.
- Type an unsent client message, wait at least 3 seconds, open the same portal in another browser/device and confirm the secure cloud draft restores after authentication.
- Leave Client Portal visible for more than 45 seconds and confirm its Updated timestamp changes.
- Type in the client message field and confirm the background refresh pauses while actively editing.
- Leave Event Day visible for more than 45 seconds and confirm its Updated timestamp advances.
- Test planner/client/platform sign-in using an email whose capitalization differs from the originally stored email.
