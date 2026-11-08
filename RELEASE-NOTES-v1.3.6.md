# Celebration Suite v1.3.6 — Interactive Product Demo

## Summary
Replaces the previous static demo dashboard with a guided, interactive, read-only product experience designed for prospects evaluating Celebration Suite.

## Demo experience
- 13 guided tour stops covering command center, CRM, event workspace, client portal, design, floor plan/seating, guests, inventory, vendors, financials, communications, automations/integrations and event day.
- Realistic sample tenant and event data.
- Temporary browser-only interactions: lead progression, guided/pro mode, client approval preview, inspiration approval, limited guest-to-table assignment, guest check-in, inventory reservation preview, vendor preference, payment preview, draft message, automation toggles and run-of-show completion.
- Floor Plan intentionally prevents full plan construction: prospects can inspect layouts, select tables and make limited sample seating assignments, but cannot add/drag/resize furniture.
- No API calls, real messages, payment actions, uploads, account changes or production data writes.
- Demo state resets on page refresh or via the Reset demo activity button.

## UX
- Dedicated premium demo shell and navigation rail.
- Guided Previous/Next tour with progress tracking.
- Responsive mobile/tablet experience.
- Strong signup/pricing CTAs without interrupting exploration.

## Deployment
No database migration is required.
Service worker cache: `celebration-suite-v136`.

## Browser-rendered visual QA
A full Chromium visual review was completed after release construction using software rendering under Xvfb. Desktop (1440 px), tablet (820 px), and mobile (390 px) layouts were rendered and inspected. All 13 demo modules and representative interactions were exercised with zero browser console/page errors. Evidence is included in `reports/demo-visual-qa/` and `reports/DEMO-VISUAL-QA.md`.
