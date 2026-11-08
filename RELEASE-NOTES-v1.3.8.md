# Celebration Suite v1.3.8 — Full Product Demo + Guest Photo QR Gallery

## Guest Photo QR Gallery
- Each event can enable a branded public QR upload page for guest-submitted photos.
- Guests upload directly to a dedicated private Supabase Storage bucket using time-limited signed upload URLs.
- JPG, PNG, WebP, HEIC and HEIF are accepted up to 25 MB per image.
- Gallery records carry a minimum two-year retention date. No normal planner/client delete action is exposed before that retention window.
- Planner controls: enable/disable, title/message, optional captions, moderation, client download/print permissions, QR download, public-link copy, approve/hide.
- Client Portal includes approved guest photos with View, Download and Print actions.
- Guest Management, Event Workspace and Planner Dashboard link directly to the gallery controls.

## Demo overhaul
The guided demo now covers 21 major product experiences, including CRM, instant booking/rentals, Event Workspace modes, white-label client portal, virtual invitations + QR RSVP, Inspiration Board, true-scale seating, Guest Photo QR Gallery, guest management/check-in, ticketing, inventory QR, vendors, documents, questionnaires/approvals, financials, communications, integrations, branding/custom domains, reporting/admin and Event Day.

## Deployment
Run `supabase/migrations/0035_GUEST_PHOTO_QR_GALLERY.sql` before enabling Guest Photo QR uploads.
Service worker cache: `celebration-suite-v138`.
