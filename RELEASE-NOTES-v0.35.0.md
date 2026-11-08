# Celebration Suite v0.35.0 — White-Label Commerce Parity

## Added

- Tenant-configurable **Instant Booking** storefront with branded public link.
- Booking packages with price, event type, general/exclusive daily capacity class, deposit type, and deposit amount/percentage.
- Booking add-ons.
- Date-capacity checks against existing events and active checkout holds.
- Stripe checkout using each planner's connected Stripe account.
- Verified Stripe return before a booking is considered paid.
- Automatic client + event workspace + invoice + payment creation after a successful instant-book checkout.
- Tenant-configurable **Decor Rental** storefront using Master Inventory items already marked `rentable` with `rental_price`.
- Date-range rental availability, quantity checking, 4-hour checkout holds, verified Stripe checkout, and rental reservation locking.
- Rental order operations for check-out, return, and cancellation.
- `commerce.html` planner control center for storefront settings, public links, packages, add-ons, booking orders, and rental orders.
- Abandoned checkout recovery scheduled hourly: first reminder after the configured delay, second reminder later, then automatic expiration after 7 days.
- Commerce settings for booking/rental storefront enablement, copy, hold duration, daily booking limits, and recovery behavior.
- Supabase migration `0026_WHITE_LABEL_COMMERCE_STOREFRONTS.sql`.

## Important deployment step

Run migration `0026_WHITE_LABEL_COMMERCE_STOREFRONTS.sql` before enabling either storefront.

## Still deferred

- Tenant custom domain/CNAME mapping.
- Browser push notification subscriptions.
- Live production acceptance testing for Google Calendar, QuickBooks, Stripe reconnect/failure states, and real multi-user planner/client concurrency.
- More advanced rental pricing rules (damage deposits, delivery fees, minimums, multi-day rate schedules).
