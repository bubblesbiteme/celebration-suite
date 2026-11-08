# Original Sage → Celebration Suite Parity Reconciliation

This report compares the full 544-file Sage reference build with Celebration Suite v1.0.2. It separates Sage marketing/site content from planner-product functionality and records every original application route, backend function, and database table as exact, replaced/consolidated, restored, or intentionally excluded.

## Source totals

- Original Sage reference: **544 files**, 85 top-level HTML pages, 88 Netlify functions, 98 migrations.
- Celebration Suite v1.0.2: **435 files** before final ZIP packaging, 136 top-level HTML pages, 163 Netlify functions, 31 migrations.

## What v1.0.2 restored

- Restored the missing `event-ai-assistant` backend used by the existing Event Workspace AI tab, with tenant/event scoping, configurable privacy controls, retained review history, and an audit trail.
- Added migration `0031_ORIGINAL_PARITY_RECONCILIATION.sql` for tenant-scoped AI settings, conversations, and audit records.
- Restored the original client password-change route and added password-change controls to planner and client security pages.
- Restored compatibility routes for legacy admin, staff, agreement, proposal, payment, booking, change-order, partner, client-2FA and activation URLs so old links no longer 404.
- Removed all internally referenced missing-page and missing-function targets: the static route scan is now zero/zero.

## Original HTML route matrix

| Original route | Status | Celebration Suite route / reason |
|---|---|---|
| `about.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `admin.html` | Restored compatibility | app.html |
| `agreement-vault.html` | Exact/retained | agreement-vault.html |
| `agreement.html` | Restored compatibility | contract-public.html |
| `baby-showers-reveals.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `backup-admin.html` | Exact/retained | backup-admin.html |
| `birthdays-milestones.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `blog-las-vegas-birthday-party-decorating-trends.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `blog-las-vegas-destination-wedding-mistakes.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `blog-local-luxury-las-vegas-valley.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `blog-looking-for-corporate-event-planner-las-vegas.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `blog-luxury-baby-shower-las-vegas.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `blog-professional-holiday-decorating-vs-diy.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `blog-summerlin-henderson-estate-events.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `blog.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `booking-success.html` | Restored compatibility | checkout-success.html |
| `booking.html` | Restored compatibility | instant-book.html |
| `business-analytics.html` | Exact/retained | business-analytics.html |
| `change-order.html` | Restored compatibility | change-order-public.html |
| `change-password.html` | Restored functional route | change-password.html |
| `client-2fa-verify.html` | Restored compatibility | client-login.html |
| `client-security.html` | Exact/retained | client-security.html |
| `communications-admin.html` | Exact/retained | communications-admin.html |
| `contact.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `corporate-events.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `create-password.html` | Restored compatibility | activate.html |
| `decor-rental-requests-admin.html` | Restored compatibility | commerce.html |
| `decor-rentals.html` | Exact/retained | decor-rentals.html |
| `eula.html` | Exact/retained | eula.html |
| `event-closeout.html` | Exact/retained | event-closeout.html |
| `event-day-command.html` | Exact/retained | event-day-command.html |
| `event-planner-boulder-city.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `event-planner-henderson.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `event-planner-las-vegas.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `event-planner-north-las-vegas.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `event-planner-southern-nevada.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `event-planner-summerlin.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `event-workspace.html` | Exact/retained | event-workspace.html |
| `financials-admin.html` | Exact/retained | financials-admin.html |
| `guest-checkin.html` | Exact/retained | guest-checkin.html |
| `guests-admin.html` | Exact/retained | guests-admin.html |
| `holiday-home-decor.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `index.html` | Exact/retained | index.html |
| `instant-book.html` | Exact/retained | instant-book.html |
| `integrations-admin.html` | Exact/retained | integrations-admin.html |
| `inventory-admin.html` | Exact/retained | inventory-admin.html |
| `inventory-design-picker.html` | Exact/retained | inventory-design-picker.html |
| `inventory-event-sheet.html` | Exact/retained | inventory-event-sheet.html |
| `inventory-reservation-calendar.html` | Exact/retained | inventory-reservation-calendar.html |
| `inventory-scan.html` | Exact/retained | inventory-scan.html |
| `las-vegas-event-planning-faq.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `leads-admin.html` | Exact/retained | leads-admin.html |
| `my-events.html` | Exact/retained | my-events.html |
| `offline.html` | Exact/retained | offline.html |
| `partner-login.html` | Restored compatibility | partner-portal.html |
| `pay-invoice.html` | Exact/retained | pay-invoice.html |
| `payment-success.html` | Restored compatibility | checkout-success.html |
| `payment.html` | Restored compatibility | pay-invoice.html |
| `planner-dashboard.html` | Exact/retained | planner-dashboard.html |
| `portal-login.html` | Exact/retained | portal-login.html |
| `portal.html` | Exact/retained | portal.html |
| `portfolio.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `privacy.html` | Exact/retained | privacy.html |
| `proposal.html` | Restored compatibility | proposal-public.html |
| `proposals-admin.html` | Exact/retained | proposals-admin.html |
| `quickbooks-admin.html` | Exact/retained | quickbooks-admin.html |
| `registration-admin.html` | Exact/retained | registration-admin.html |
| `registration.html` | Exact/retained | registration.html |
| `restore-admin.html` | Exact/retained | restore-admin.html |
| `rsvp.html` | Exact/retained | rsvp.html |
| `scheduling-admin.html` | Exact/retained | scheduling-admin.html |
| `service-areas.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `staff-events.html` | Exact/retained | staff-events.html |
| `staff-login.html` | Restored compatibility | login.html |
| `staff-set-password.html` | Restored compatibility | staff-invite.html |
| `support-admin.html` | Exact/retained | support-admin.html |
| `system-health.html` | Exact/retained | system-health.html |
| `team-admin.html` | Exact/retained | team-admin.html |
| `terms.html` | Exact/retained | terms.html |
| `thank-you.html` | Restored compatibility | checkout-success.html |
| `ticket.html` | Exact/retained | ticket.html |
| `vendor-document-vault.html` | Exact/retained | vendor-document-vault.html |
| `vendors-admin.html` | Exact/retained | vendors-admin.html |
| `wedding-planning-menu.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |
| `weddings-destination-weddings.html` | Intentionally excluded | Sage & Celebration public marketing/SEO content, not part of the white-label planner SaaS |

## Original Netlify function matrix

| Original function | Status | Celebration Suite equivalent |
|---|---|---|
| `_admin-auth.mjs` | Replaced/consolidated | _session.mjs + _tenant.mjs |
| `_client-2fa.mjs` | Replaced/consolidated | _totp.mjs + client-security.mjs |
| `_client-account.mjs` | Replaced/consolidated | client-auth-* + _session.mjs |
| `_communications-inbound.mjs` | Replaced/consolidated | resend-inbound-webhook.mjs + telnyx-inbound-sms.mjs |
| `_decor-rental-payment.mjs` | Replaced/consolidated | decor-rentals-public.mjs + _commerce.mjs |
| `_email.mjs` | Replaced/consolidated | _mailer.mjs |
| `_google-calendar.mjs` | Replaced/consolidated | google-calendar-* + calendar.mjs |
| `_integration-webhooks.mjs` | Replaced/consolidated | _webhooks.mjs |
| `_portal-session.mjs` | Replaced/consolidated | _session.mjs |
| `_push.mjs` | Exact/retained | _push.mjs |
| `_quickbooks.mjs` | Replaced/consolidated | quickbooks.mjs + _oauth.mjs |
| `_shared.mjs` | Exact/retained | _shared.mjs |
| `_sms.mjs` | Replaced/consolidated | telnyx-inbound-sms.mjs + communications.mjs |
| `_staff-account.mjs` | Replaced/consolidated | tenant_users + team.mjs |
| `_staff-session.mjs` | Replaced/consolidated | _session.mjs |
| `_stripe-reconcile.mjs` | Replaced/consolidated | stripe-webhook.mjs + reconciliation.mjs |
| `abandoned-checkout-recovery.mjs` | Replaced/consolidated | commerce-recovery.mjs |
| `admin-client-preview.mjs` | Replaced/consolidated | client-auth-info.mjs + client portal preview URLs |
| `admin-data.mjs` | Replaced/consolidated | bootstrap.mjs + platform-admin.mjs |
| `admin-google-callback.mjs` | Replaced/consolidated | google-auth-callback.mjs |
| `admin-google-login.mjs` | Replaced/consolidated | google-auth-start.mjs |
| `admin-google-session.mjs` | Replaced/consolidated | google-auth-* + _session.mjs |
| `agreement-public.mjs` | Replaced/consolidated | contract-public.mjs |
| `agreement-vault.mjs` | Replaced/consolidated | contracts.mjs + documents.mjs |
| `appointment-scheduling.mjs` | Exact/retained | appointment-scheduling.mjs |
| `availability.mjs` | Replaced/consolidated | scheduling.mjs |
| `backup-export.mjs` | Replaced/consolidated | account-export.mjs |
| `backup-restore.mjs` | Replaced/consolidated | account-restore.mjs |
| `booking-status.mjs` | Replaced/consolidated | instant-book-public.mjs + checkout-readiness.mjs |
| `business-analytics.mjs` | Replaced/consolidated | analytics.mjs |
| `change-order-public.mjs` | Exact/retained | change-order-public.mjs |
| `client-2fa.mjs` | Replaced/consolidated | client-security.mjs |
| `client-auth.mjs` | Replaced/consolidated | client-auth-info/login/session/setup modules |
| `client-change-password.mjs` | Restored v1.0.2 | client-change-password.mjs |
| `client-data.mjs` | Exact/retained | client-data.mjs |
| `client-google-auth.mjs` | Replaced/consolidated | google-auth-start.mjs |
| `client-google-callback.mjs` | Replaced/consolidated | google-auth-callback.mjs |
| `client-onboarding.mjs` | Replaced/consolidated | client-auth-setup.mjs |
| `client-recovery.mjs` | Replaced/consolidated | password-reset-request.mjs + password-reset-complete.mjs |
| `communications-admin.mjs` | Exact/retained | communications-admin.mjs |
| `create-checkout.mjs` | Replaced/consolidated | checkout-create.mjs / invoice-checkout-create.mjs |
| `decor-rental-admin.mjs` | Replaced/consolidated | commerce-admin.mjs |
| `decor-rental-catalog.mjs` | Replaced/consolidated | decor-rentals-public.mjs |
| `decor-rental-request.mjs` | Replaced/consolidated | decor-rentals-public.mjs |
| `decor-rental-reservation-manage.mjs` | Replaced/consolidated | commerce-admin.mjs + decor-rentals-public.mjs |
| `event-ai-assistant.mjs` | Restored v1.0.2 | event-ai-assistant.mjs |
| `event-automation-run.mjs` | Replaced/consolidated | automation-run.mjs |
| `event-closeout-run.mjs` | Exact/retained | event-closeout-run.mjs |
| `event-closeout.mjs` | Replaced/consolidated | closeouts.mjs + event-closeout-run.mjs |
| `event-reminder-run.mjs` | Replaced/consolidated | automation-run.mjs + automations.mjs |
| `event-workspace.mjs` | Exact/retained | event-workspace.mjs |
| `financial-admin.mjs` | Exact/retained | financial-admin.mjs |
| `google-calendar-admin.mjs` | Exact/retained | google-calendar-admin.mjs |
| `google-calendar-auth.mjs` | Exact/retained | google-calendar-auth.mjs |
| `google-calendar-callback.mjs` | Exact/retained | google-calendar-callback.mjs |
| `google-calendar-sync.mjs` | Replaced/consolidated | calendar.mjs + google-calendar-admin.mjs |
| `guest-admin.mjs` | Exact/retained | guest-admin.mjs |
| `integration-api.mjs` | Replaced/consolidated | external-api.mjs |
| `integrations-admin.mjs` | Replaced/consolidated | integration-center.mjs + integration-resilience.mjs |
| `inventory-admin.mjs` | Replaced/consolidated | inventory.mjs + inventory-operations.mjs |
| `inventory-design-link.mjs` | Replaced/consolidated | inspiration.mjs + floorplan-inventory-sync.mjs |
| `invoice-public.mjs` | Exact/retained | invoice-public.mjs |
| `lead-admin.mjs` | Replaced/consolidated | leads.mjs |
| `lead-submit.mjs` | Replaced/consolidated | leads.mjs |
| `payment-reconcile.mjs` | Replaced/consolidated | reconciliation.mjs + stripe-webhook.mjs |
| `planner-dashboard.mjs` | Replaced/consolidated | bootstrap.mjs |
| `proposal-admin.mjs` | Replaced/consolidated | proposals.mjs |
| `proposal-public.mjs` | Exact/retained | proposal-public.mjs |
| `push-subscription.mjs` | Replaced/consolidated | push-subscriptions.mjs |
| `quickbooks-admin.mjs` | Replaced/consolidated | quickbooks.mjs + reconciliation.mjs |
| `quickbooks-auth.mjs` | Replaced/consolidated | quickbooks-start.mjs |
| `quickbooks-callback.mjs` | Exact/retained | quickbooks-callback.mjs |
| `quickbooks-webhook-process.mjs` | Replaced/consolidated | quickbooks-webhook.mjs + quickbooks-changes.mjs |
| `quickbooks-webhook.mjs` | Exact/retained | quickbooks-webhook.mjs |
| `registration-admin.mjs` | Replaced/consolidated | registrations.mjs |
| `registration-public.mjs` | Exact/retained | registration-public.mjs |
| `resend-inbound-webhook.mjs` | Exact/retained | resend-inbound-webhook.mjs |
| `rsvp-public.mjs` | Exact/retained | rsvp-public.mjs |
| `staff-auth.mjs` | Replaced/consolidated | auth-login.mjs + tenant event assignments |
| `staff-password.mjs` | Replaced/consolidated | staff-invite.mjs + password reset modules |
| `stripe-webhook.mjs` | Exact/retained | stripe-webhook.mjs |
| `support-alert-test.mjs` | Replaced/consolidated | push-test.mjs + support.mjs |
| `support-issues.mjs` | Replaced/consolidated | support.mjs |
| `system-health.mjs` | Replaced/consolidated | tenant-health.mjs + platform-health.mjs |
| `team-admin.mjs` | Replaced/consolidated | team.mjs |
| `telnyx-inbound-sms.mjs` | Exact/retained | telnyx-inbound-sms.mjs |
| `vendor-admin.mjs` | Exact/retained | vendor-admin.mjs |
| `vendor-documents.mjs` | Replaced/consolidated | documents.mjs with vendor_id linkage |

## Original database table matrix

The white-label product intentionally consolidates many of the original single-business tables into tenant-scoped tables or event `workspace_data`. A smaller migration count is therefore not evidence that those records disappeared.

| Original table | Celebration Suite storage |
|---|---|
| `admin_users` | platform_admins / tenant_users |
| `agreement_vault` | tenant_contracts + tenant_documents |
| `appointment_types` | tenant_appointment_types |
| `blocked_dates` | tenant_calendar_blocks + tenant_scheduling_blocks |
| `booking_agreements` | tenant_contracts |
| `bookings` | tenant_events + tenant_booking_orders |
| `calendar_integrations` | tenant_integrations |
| `client_2fa` | tenant_client_users 2FA columns |
| `client_account_tokens` | password_reset_tokens + client invite tokens |
| `client_accounts` | tenant_client_users + tenant_clients |
| `client_login_audit` | tenant_audit_log / tenant_activity |
| `client_questionnaire_drafts` | client_portal_drafts + tenant_questionnaires.draft_answers |
| `communications_log` | tenant_messages + tenant_activity |
| `decor_rental_requests` | tenant_rental_orders |
| `decor_rental_reservations` | tenant_rental_reservations |
| `email_delivery_log` | tenant_activity / tenant_notifications delivery metadata |
| `event_ai_audit_log` | tenant_event_ai_audit_log |
| `event_ai_conversations` | tenant_event_ai_conversations |
| `event_ai_settings` | tenant_event_ai_settings |
| `event_appointments` | tenant_appointments |
| `event_approvals` | tenant_approvals |
| `event_automation_rules` | tenant_automation_rules |
| `event_automation_runs` | tenant_automation_runs |
| `event_budget_items` | tenant_events.workspace_data.budget.items + tenant_event_expenses |
| `event_budget_settings` | tenant_events financial fields + workspace_data.budget |
| `event_change_orders` | tenant_change_orders |
| `event_client_notifications` | tenant_notifications |
| `event_closeouts` | tenant_event_closeouts |
| `event_day_incidents` | tenant_event_incidents |
| `event_design_items` | tenant_inspiration_items |
| `event_document_folders` | tenant_events.workspace_data.compat.documentFolders |
| `event_documents` | tenant_documents |
| `event_emergency_contacts` | tenant_event_emergency_contacts |
| `event_guests` | tenant_guests |
| `event_inventory_gaps` | tenant_purchasing_gaps |
| `event_inventory_reservations` | tenant_inventory_reservations |
| `event_lifecycle_actions` | tenant_activity + workspace_data.compat.lifecycleActions |
| `event_messages` | tenant_messages |
| `event_notification_preferences` | tenant_events.workspace_data.notification_preferences |
| `event_push_subscriptions` | tenant_push_subscriptions |
| `event_questionnaire_questions` | tenant_questionnaires.questions JSON |
| `event_questionnaire_responses` | tenant_questionnaires.answers JSON |
| `event_questionnaire_reviews` | tenant_events.workspace_data.compat.questionnaireReviews |
| `event_questionnaire_template_questions` | tenant_questionnaire_templates.questions JSON |
| `event_questionnaire_templates` | tenant_questionnaire_templates |
| `event_questionnaires` | tenant_questionnaires |
| `event_referral_audit_log` | tenant_audit_log / tenant_activity |
| `event_referrals` | tenant_referrals |
| `event_registration_attendees` | tenant_registrations / tenant_ticket_attendees |
| `event_registration_orders` | tenant_ticket_orders |
| `event_registration_promo_codes` | tenant_registration_promos |
| `event_registration_settings` | tenant_registration_settings |
| `event_reminders` | tenant_automation_rules + workspace_data.compat.reminders |
| `event_staff_assignments` | tenant_event_assignments |
| `event_templates` | tenant_events.workspace_data.compat.eventTemplates |
| `event_ticket_types` | tenant_registration_types |
| `event_timeline_items` | tenant_events.workspace_data.timeline |
| `event_vendor_bookings` | tenant_vendors + workspace_data.compat.vendorBookings |
| `event_vendor_compliance` | tenant_documents(vendor_id) + workspace_data.compat.vendorCompliance |
| `event_vendor_operations` | tenant_vendor_operations |
| `event_vendor_payments` | tenant_event_expenses + workspace_data.compat.vendorPayments |
| `event_vendor_quotes` | tenant_vendor_quotes |
| `event_vendors` | tenant_vendors |
| `event_workspace_activity` | tenant_activity |
| `event_workspace_notes` | tenant_events.workspace_data.notes |
| `event_workspace_tasks` | tenant_events.workspace_data.checklist |
| `financial_adjustments` | tenant_financial_adjustments |
| `financial_expenses` | tenant_event_expenses |
| `financial_invoices` | tenant_invoices |
| `financial_payments` | tenant_payments |
| `guest_communication_campaigns` | tenant_events.workspace_data.compat.guestCampaigns + communications |
| `guest_events` | tenant_events invitation settings + tenant_guests |
| `integration_api_keys` | tenant_api_keys |
| `integration_webhook_deliveries` | tenant_webhook_deliveries |
| `integration_webhooks` | tenant_webhooks |
| `inventory_event_operations` | tenant_inventory_movements |
| `inventory_event_transactions` | tenant_inventory_movements |
| `inventory_items` | tenant_inventory_items |
| `inventory_stock_movements` | tenant_inventory_movements |
| `lead_activity` | tenant_activity |
| `leads` | tenant_leads |
| `marketing_source_spend` | analytics/source data via tenant_leads + expenses |
| `proposals` | tenant_proposals |
| `public_sms_consents` | tenant activity/communications consent fields |
| `quickbooks_connections` | tenant_integrations(kind=quickbooks) |
| `quickbooks_sync_log` | tenant_quickbooks_changes + tenant_reconciliation_snapshots |
| `quickbooks_sync_map` | tenant_reconciliation_snapshots / integration config |
| `quickbooks_webhook_events` | tenant_quickbooks_changes |
| `scheduling_availability` | tenant_scheduling_availability |
| `scheduling_blocks` | tenant_scheduling_blocks |
| `sms_opt_outs` | communications/Telnyx opt-out handling |
| `staff_account_tokens` | tenant_staff_invites + password_reset_tokens |
| `staff_availability_blocks` | tenant_staff_availability |
| `staff_login_audit` | tenant_audit_log |
| `support_issues` | tenant_support_tickets |
| `system_error_logs` | platform_error_logs |
| `system_versions` | platform release notices / package release lineage |
| `team_members` | tenant_users |
| `vendor_documents` | tenant_documents(vendor_id) |
| `vendor_reviews` | tenant_vendor_reviews |
| `vendors` | tenant_vendors |

## Remaining intentional differences

- Sage public marketing pages, location SEO pages, portfolio imagery, blog assets, and service pages are intentionally not copied into Celebration Suite because each buyer is expected to brand/integrate the planner product into their own website.
- Celebration Suite uses fewer migrations because it starts from a consolidated multi-tenant schema rather than replaying every historical Sage hotfix migration.
- Several original event-workspace sub-records (timeline, checklist, budget planning, reusable event templates, document folders, reminder metadata, lifecycle history, and certain vendor workflow records) are deliberately stored in tenant event `workspace_data` for backwards-compatible workspace behavior. They remain available in the UI and API; they are not missing features.
- Old function filenames are not duplicated when a tenant-scoped replacement exists, unless an external/legacy URL still needs compatibility.

## Launch conclusion

After the v1.0.2 reconciliation, the current application has no known internal references to missing HTML pages or missing Netlify functions. The one confirmed dead feature backend—the Event Workspace AI Assistant—has been restored. Legacy functional URLs that could be present in old emails/bookmarks now resolve to current Celebration Suite flows. Sage-only marketing content remains intentionally excluded.
