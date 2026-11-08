# Celebration Suite v1.2.3 — Dashboard Freeze / License Bootstrap Hotfix

## Fixed
- Removed a MutationObserver feedback loop in the ultra-luxury navigation enhancer that could repeatedly rewrite dock icon DOM and lock the browser main thread.
- Made luxury dock/logo enhancement idempotent.
- Restricted dock refresh observation to newly-added dock content and batches refreshes with requestAnimationFrame.
- Bumped service-worker cache to `celebration-suite-v123`.

## Impact
The dashboard can now complete its normal bootstrap/license request instead of freezing with “Loading license…” while the browser reports that the page is not responding.

No database migration is required.
