# Seller Guide

## Direct website purchase
1. Buyer visits `/pricing.html`.
2. Buyer creates an account and accepts the legal documents.
3. Buyer selects Single Event or Annual Unlimited.
4. Stripe Checkout uses the platform's Stripe account and configured price ID.
5. On successful return, the server verifies payment with Stripe before activating access.
6. Buyer is sent into the guided onboarding flow.

## Marketplace / manual order fulfillment
1. Open `/platform-admin.html`.
2. Enter the Platform Admin Key.
3. Use **Fulfill Marketplace Order**.
4. Enter the marketplace source (for example, Etsy), external order ID, buyer email, plan and amount paid.
5. The system creates the platform order, generates a one-time license code and shows an activation link.
6. Send the buyer the activation link or license code using the marketplace-approved fulfillment method.
7. When the buyer redeems the code, the resulting tenant is linked back to that order.

## Single Event fulfillment
The buyer must provide the event date. The entitlement expires 90 days after that event date and becomes bound to the event created under that license.

## Annual Unlimited fulfillment
The entitlement lasts 12 months from activation. A renewal purchased before expiry adds a new 12-month term after the remaining paid term.

## Expired accounts
The license gate blocks active planning when access expires. Customer data is retained so the customer can renew rather than losing their work.

## Customer data export
Owners/admins can download a JSON export from `/billing.html`.

## Before public launch
- Replace the placeholder product name with the final product name.
- Have Terms, Privacy Notice and EULA reviewed by qualified counsel.
- Configure the new product's own Supabase project, Netlify site, domain and Stripe products.
- Configure platform Stripe price IDs.
- Test one Single Event direct purchase and one Annual direct purchase in Stripe test mode.
- Test one marketplace license-code fulfillment from creation through redemption.
- Confirm email-domain setup for any platform-owned transactional email you choose to add later.
