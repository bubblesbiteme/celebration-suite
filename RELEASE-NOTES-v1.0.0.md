# Celebration Suite v1.0.0 — Launch Candidate

This release consolidates the white-label planner platform into the first commercial launch candidate. It retains all functionality delivered through v0.39 and focuses on cleanup, accessibility, maintainability, page weight, and deployment clarity.

## Final cleanup
- Canonicalized literal duplicate admin pages for Communications, Inventory, and Vendors. Legacy `*-admin.html` URLs remain as small compatibility aliases so saved links do not break.
- Updated package metadata to `1.0.0`.
- Reduced the bundled fallback logo from a 1400px source to a practical 700px UI asset, substantially reducing its payload while retaining transparency.

## Accessibility and keyboard baseline
- Full HTML pages now declare `lang="en"` and responsive viewport metadata.
- Added skip-to-main-content behavior when a primary content region exists.
- Added strong `:focus-visible` treatment for keyboard users.
- Added reduced-motion handling for users who request it.
- Added higher-contrast border behavior for supported browsers.
- Added fallback accessible labels for otherwise unnamed interactive buttons.
- Added Escape-to-close behavior for the planner mobile navigation and returns focus to the menu button.

## Operational hardening
- Support SLA escalation is now a Netlify Scheduled Function (`*/15 * * * *`) and remains idempotent because tickets are only escalated once.
- Existing Commerce Recovery remains scheduled from its function configuration.
- Existing automation and event-closeout schedules remain in `netlify.toml`.

## Launch documentation
- `V1-DEPLOYMENT-GUIDE.md` contains the final migration sequence and environment/deployment steps.
- `V1-LAUNCH-CHECKLIST.md` contains the owner-facing go-live checklist.
- `npm run audit:v1` checks the v1 release-specific launch requirements.

## Important launch note
The bundled privacy notice, terms, and EULA still identify themselves as starter legal text. They should be reviewed and approved by qualified counsel before broad public launch.
