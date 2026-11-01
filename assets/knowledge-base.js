window.CSKnowledgeBase = [
  {
    id:'getting-started', category:'Getting Started', title:'Getting Started with Celebration Suite',
    summary:'Set up your planner account, brand, integrations, team, inventory, and first event in the right order.',
    pages:['/getting-started.html','/onboarding.html','/app.html'], keywords:['setup','start','first event','onboarding'],
    steps:[
      'Open Settings and enter your business name, logo, brand colors, sender name, and reply-to email.',
      'Open Security and enable two-factor authentication for the planner/admin account.',
      'Connect Google Calendar if you want appointments and personal busy time reflected in availability.',
      'Connect QuickBooks if you want accounting sync and reconciliation.',
      'Connect Email and SMS providers if you want to send messages from the Communications Center.',
      'Open Team and invite staff members who need access.',
      'Open Inventory and add or bulk-import the décor and supplies you own.',
      'Create your first event from the Dashboard, then open its Event Workspace.',
      'Use the event checklist, timeline, design board, floor plan, guests, vendors, financials and Event Day tools as needed.',
      'Preview the Client Portal before inviting the client so you can verify branding and permissions.'
    ],
    tips:['You do not need to configure every integration before creating an event.','Use the Setup Checklist as a progress tracker.']
  },
  {
    id:'dashboard-events', category:'Getting Started', title:'Dashboard and Events', summary:'Create events, find active events, archive old events, and open the Event Workspace.',
    pages:['/app.html','/planner-dashboard.html','/my-events.html'], keywords:['dashboard','events','archive','create event'],
    steps:['Open the Dashboard.','Choose + New Event.','Enter the event name, client information, date, event type, venue/location and any starting budget details.','Save the event.','Use Open Workspace on the event card to enter the unified Event Workspace.','Use the event filters to switch between active/upcoming and archived events.'],
    tips:['Event-specific work belongs inside Event Workspace; business-wide tools stay in the main navigation.']
  },
  {
    id:'event-workspace', category:'Events', title:'Using the Event Workspace', summary:'The Event Workspace is the home for one event and keeps the event planning tools connected.',
    pages:['/event-workspace.html','/event.html'], keywords:['workspace','event','overview','checklist','timeline'],
    steps:['Open an event from the Dashboard.','Review Overview for event status, finances, guests, vendors and next work.','Use Checklist for tasks and deadlines.','Use Timeline for event-day and planning schedule items.','Use Guests, Financials and Messages for the core event records.','Open More Tools for Design, Floor Plan, Questionnaires, Vendors, Inventory, Appointments, Event Book, Event Day and Closeout.','Use Preview Client Portal to confirm what the client sees.'],
    tips:['The event ID is carried between connected event tools automatically.']
  },
  {
    id:'checklist', category:'Events', title:'Event Checklist and Tasks', summary:'Create, assign, prioritize and complete planning tasks.',
    pages:['/event-workspace.html'], keywords:['task','checklist','deadline','owner'],
    steps:['Open the event and choose Checklist.','Choose Add Task.','Enter the task name, due date, priority and owner.','Save the task.','Update status as work progresses.','Mark the task complete when finished.'],
    tips:['Questionnaire analysis can create recommended checklist items automatically.']
  },
  {
    id:'timeline', category:'Events', title:'Timeline and Run of Show', summary:'Build the event timeline, switch views, and export calendar files.',
    pages:['/event-workspace.html','/event-day.html','/event-day-command.html'], keywords:['timeline','run of show','calendar','ics'],
    steps:['Open the event and choose Timeline.','Add a timeline item with date/time, title, owner and notes.','Reorder or edit items as the event changes.','Switch between list and calendar views when available.','Export an individual item or the event timeline as an .ics calendar file.','Use Event Day for the live operational view.']
  },
  {
    id:'client-portal', category:'Client Portal', title:'Client Portal: Setup, Preview and Permissions', summary:'Control what clients can access and preview the portal safely before sending access.',
    pages:['/portal.html','/client-login.html','/portal-login.html','/client-security.html'], keywords:['client portal','preview','client access','permissions'],
    steps:['Open the event workspace.','Review Client Access/permissions for the event.','Enable the sections the client should use, such as tasks, design approvals, guests, floor plans, appointments, vendors, documents, financials and messages.','Choose Preview Client Portal to open a read-only planner preview.','Verify the planner business name, logo and brand colors.','Send or provide client access only after the preview looks correct.','Clients sign in through the client login and can enable optional 2FA from Security.'],
    tips:['Planner preview uses planner authorization and cannot perform client mutations.','The Client Portal should use tenant branding, never the Celebration Suite product logo.']
  },
  {
    id:'design-studio', category:'Design', title:'Inspiration & Design Studio', summary:'Build a visual design board with uploaded images and inventory-backed items.',
    pages:['/inspiration.html'], keywords:['inspiration','design','board','mood board','inspo'],
    steps:['Open the event and choose Inspiration/Design.','Upload an inspiration image or paste an image URL.','Add a title and notes if helpful.','Choose Use Inventory or Master Inventory to add owned items through the event-specific inventory picker.','Drag items around the board, resize, rotate and change layers.','Shortlist design options as the concept develops.','Share the board with the client for approval when ready.'],
    tips:['Inventory-backed board items carry their photo and requested quantity.','Adding an inventory item to the board does not reserve it until the approval/reservation workflow requires it.']
  },
  {
    id:'design-board-settings', category:'Design', title:'Design Board Settings', summary:'Change the board title, background, canvas size and client editing behavior.',
    pages:['/inspiration.html'], keywords:['board settings','background','canvas','client rearrange'],
    steps:['Open the Design Studio.','Choose Board Settings.','Change the board title.','Choose the background style.','Adjust canvas height as needed.','Add board-level notes.','Enable or disable client rearranging if the event allows it.','Save and refresh once to confirm the settings persisted.']
  },
  {
    id:'inventory-picker-design', category:'Design', title:'Add Master Inventory to a Design Board', summary:'Choose owned inventory with photos and quantities and add it directly to the event board.',
    pages:['/inventory-design-picker.html','/inspiration.html'], keywords:['master inventory','design picker','quantity','photo'],
    steps:['From the Design Studio choose Master Inventory or Use Inventory.','Search or browse the inventory picker.','Review the item photo, SKU, owned quantity and storage location.','Enter the quantity you want represented on the board.','Choose Add to Board.','You are returned to the same event/design workflow with the inventory-linked item added.']
  },
  {
    id:'floor-plan', category:'Design', title:'Floor Plan Maker', summary:'Create room layouts using tables, chairs, décor, production objects and owned inventory.',
    pages:['/floorplan.html'], keywords:['floor plan','tables','chairs','layout','seating'],
    steps:['Open the event Floor Plan.','Create a new layout and give the layout its real name, such as Reception or Ceremony.','Add objects by clicking/tapping them or dragging them onto the canvas.','Move placed objects into position.','Select an object to edit its label, rotation, seats, dimensions, assignment and notes.','Upload a venue plan image if you have one.','Use snap-to-grid and measurements for more precise placement.','Save the layout.','Use Save Version for historical versions; version names are separate from layout names.','Share the layout with the client when appropriate.'],
    tips:['Table objects use shape-specific symbols so round, square, rectangle, half-round, serpentine and highboy tables are visually distinct.']
  },
  {
    id:'inventory-master', category:'Inventory', title:'Master Inventory', summary:'Create the permanent inventory records used by QR labels, reservations, Design and Floor Plan.',
    pages:['/inventory.html','/inventory-admin.html'], keywords:['inventory','sku','qr','storage','rentable'],
    steps:['Open Inventory.','Choose Add Inventory Item.','Enter item name, quantity owned, unit, category, storage location, replacement cost and notes.','Upload or attach the item photo.','Set floor-plan symbol mapping and quantity-per-symbol if you use the item in Floor Plan.','Enable automatic reservation from floor plan if appropriate.','Mark the item rentable and set rental pricing only if it should appear as a rental.','Save the item.','The system keeps the persistent inventory identity used by QR labels and scanning.']
  },
  {
    id:'inventory-bulk-upload', category:'Inventory', title:'Bulk Upload Inventory and Photos', summary:'Import many inventory records and match photos in batches.',
    pages:['/inventory.html'], keywords:['bulk upload','csv','photos','import'],
    steps:['Open Inventory and choose Bulk Upload.','Download or use the supported inventory CSV template.','Complete the inventory rows without changing the required headers.','Upload the CSV.','Review import results and correct any rejected rows.','Upload the matching image batch.','Use the matching workflow to associate photos to the imported items.','Review missing-photo filters before finishing.'],
    tips:['Use consistent SKU/file naming when preparing a large photo batch.']
  },
  {
    id:'inventory-qr', category:'Inventory', title:'QR Inventory Labels and Phone Scanning', summary:'Print QR labels and scan an item to see its record, image and storage location.',
    pages:['/inventory-scan.html','/inventory.html'], keywords:['qr','scan','label','phone'],
    steps:['Create and save the inventory record first.','Open Print QR Labels from Inventory.','Select the items/labels to print.','Print using the 2x2 label/square format.','Scan a label with your phone camera or the Inventory Scanner.','The scan opens the saved inventory record and shows the item, picture and storage location.'],
    tips:['Long item names wrap automatically on the label.']
  },
  {
    id:'inventory-reservations', category:'Inventory', title:'Inventory Reservations and Availability', summary:'Reserve items for event dates and see conflicts before committing stock.',
    pages:['/inventory-reservation-calendar.html','/event-inventory.html','/inventory-event-sheet.html'], keywords:['reserve','availability','event inventory','packing'],
    steps:['Open the event inventory or Reservation Calendar.','Choose the event/date range.','Search the inventory item.','Review owned, reserved and available quantity for the event dates.','Reserve the needed quantity.','Use the event inventory workflow to pack, load out and return items.','Record returned-good, damaged, repair and missing quantities during closeout.'],
    tips:['Design approvals and floor-plan auto-reservations can create event reservations automatically when enabled.']
  },
  {
    id:'guests', category:'Guests & RSVP', title:'Guest Management', summary:'Maintain one working guest record for invitations, RSVP, meals, seating and check-in.',
    pages:['/guests.html','/guests-admin.html'], keywords:['guests','rsvp','meal','seating','check in'],
    steps:['Open Guests for the event.','Choose + Guest or import a CSV.','Enter household/party, email, phone and guest details.','Track RSVP status, attending count, children and plus-one information.','Record meal and dietary choices.','Assign table and seat numbers.','Use VIP, accessibility, hotel and transportation fields when needed.','Send personalized invitations or RSVP links.','Use guest QR codes for event-day check-in.']
  },
  {
    id:'guest-import-export', category:'Guests & RSVP', title:'Guest CSV Import and Exports', summary:'Bulk-import guest lists and export catering, seating and working guest reports.',
    pages:['/guests.html'], keywords:['csv','import guests','export','catering','seating'],
    steps:['Open Guest Management.','Choose Import CSV.','Map/use the supported guest columns and upload the file.','Review imported guests.','Use Export for the working guest list.','Use Catering for meal/dietary output.','Use Seating for table/seat output.']
  },
  {
    id:'rsvp-settings', category:'Guests & RSVP', title:'Invitation and RSVP Settings', summary:'Configure the public invitation and what information guests are asked to provide.',
    pages:['/guests.html','/rsvp-public.html'], keywords:['invitation','rsvp deadline','meal options','plus one'],
    steps:['Open Guest Management.','Complete Invitation & RSVP Settings.','Set invitation title and welcome message.','Set RSVP deadline, start time and event location.','Enter meal options one per line.','Choose whether plus-one, meal choice, dietary restrictions and song requests are collected.','Turn RSVP Open on when the form is ready.','Save.','Preview Invitation before sending.','Print or copy the RSVP QR/link as needed.']
  },
  {
    id:'guest-checkin', category:'Guests & RSVP', title:'QR Guest and Ticket Check-In', summary:'Use one event-day scanner for RSVP guest QR codes and ticket attendee QR codes.',
    pages:['/guest-checkin.html'], keywords:['check-in','scanner','ticket','guest qr'],
    steps:['Open the event and choose QR Check-In.','Allow camera access.','Scan the guest or ticket QR code.','Confirm the attendee record shown on screen.','Complete check-in.','Use search/manual entry if a QR cannot be scanned.','Review duplicate/already-checked-in status before overriding.']
  },
  {
    id:'ticketing', category:'Guests & RSVP', title:'Ticket Sales and Registration', summary:'Create free or paid ticket types, accept registrations and issue attendee-level QR tickets.',
    pages:['/registration.html','/registration-admin.html','/registration-public.html','/ticket.html'], keywords:['tickets','registration','stripe','promo'],
    steps:['Open Tickets/Registration for the event.','Create ticket types and set free/paid price, capacity and description.','Set overall capacity and sale closing time if needed.','Add promo codes if applicable.','Publish/copy the registration link or QR.','Paid tickets use Stripe Checkout; free tickets complete directly.','Each attendee receives a unique ticket code/QR.','Manage orders, cancellations/refunds and attendee status from Registration.']
  },
  {
    id:'financials', category:'Money', title:'Financial Center', summary:'Manage event contract values, invoices, payments, expenses, décor allowance and adjustments.',
    pages:['/financials.html','/financials-admin.html'], keywords:['financials','invoice','payment','expense','profit'],
    steps:['Open Financials.','Select/open the event if needed.','Set the service/labor fee and client-funded décor allowance.','Create invoice schedule/items.','Send or create payment links when needed.','Record payments received outside the integrated checkout flow.','Enter business expenses and client-funded décor spending separately.','Use adjustments for discounts, credits, refunds, fees or tax.','Review collected, outstanding, décor remaining and estimated service profit.']
  },
  {
    id:'stripe', category:'Integrations', title:'Connect Stripe Payments', summary:'Use the planner’s own Stripe account so client invoice payments go directly to the planner.',
    pages:['/settings.html','/financials.html','/registration.html'], keywords:['stripe','payments','secret key','checkout'],
    steps:['Open Settings.','Find Stripe Payments.','Enter the planner Stripe secret key.','Save Settings.','Confirm the Stripe status shows connected.','Create a test invoice/payment link or test-priced ticket before using live payments.'],
    troubleshoot:['If checkout cannot start, confirm the key belongs to the intended Stripe account and the environment is correct.']
  },
  {
    id:'vendors', category:'Vendors', title:'Vendor CRM', summary:'Maintain vendor records, event assignments, operational information and reviews.',
    pages:['/vendors.html','/vendors-admin.html','/vendor-operations.html','/vendor-reviews.html'], keywords:['vendor','crm','arrival','review','compliance'],
    steps:['Open Vendors.','Add or edit the vendor company/contact record.','Set category and business/contact information.','Assign vendors to an event from the event vendor workflow.','Enter event arrival, load-in window, assigned area, responsibilities and access instructions.','Track day-of check-in/check-out.','Attach compliance documents in the document/vendor vault.','After the event, record ratings and rehire/recommendation notes.']
  },
  {
    id:'vendor-quotes', category:'Vendors', title:'Vendor Quote Comparison', summary:'Compare vendor quotes using true event cost and select the option for an event.',
    pages:['/vendor-quotes.html'], keywords:['vendor quote','compare','select book'],
    steps:['Open Vendor Quotes for the event.','Add the vendor option and quoted cost.','Include fees/tax/additional costs so the comparison reflects true cost.','Review the options side-by-side.','Choose Select & Book for the chosen option.','Carry the selected vendor into event operations and financial tracking.']
  },
  {
    id:'communications', category:'Communications', title:'Communications Center', summary:'Send and track email, SMS and internal event notes from one place.',
    pages:['/communications.html','/communications-admin.html'], keywords:['email','sms','messages','resend','telnyx'],
    steps:['Open Communications.','Choose the client, lead or event thread.','Select email or SMS when available.','Write the message and send.','Inbound replies are matched to the appropriate thread when provider webhooks are configured.','Use internal notes for staff-only communication.','Review unresolved inbound items when a reply could not be matched automatically.']
  },
  {
    id:'email-integration', category:'Integrations', title:'Connect Email (Resend or SMTP)', summary:'Configure outbound email and inbound replies for the Communications Center.',
    pages:['/settings.html','/communications.html'], keywords:['resend','smtp','email integration','inbound email'],
    steps:['Open Settings.','Choose Resend or SMTP as the email provider.','For Resend, enter the API key and From email.','For SMTP, enter host, port, username and password.','Set sender name and reply-to email in Brand settings.','Save Settings.','For inbound Resend replies, configure the provider webhook to the Celebration Suite inbound endpoint and add the webhook signing secret to Netlify environment variables.','Send a test message and reply to it to verify threading.']
  },
  {
    id:'sms-integration', category:'Integrations', title:'Connect Telnyx SMS', summary:'Connect a Telnyx number for client text messaging.',
    pages:['/settings.html','/communications.html'], keywords:['telnyx','sms','text','messaging'],
    steps:['Open Settings.','Enter the Telnyx API key and sending phone number.','Save Settings.','In Telnyx, configure the Messaging Profile inbound webhook to the Celebration Suite inbound SMS endpoint.','Add the Telnyx webhook signing public key to the site environment.','Send a test SMS from Communications and reply to confirm inbound matching.']
  },
  {
    id:'calendar', category:'Integrations', title:'Google Calendar and Availability', summary:'Connect Google Calendar for appointment availability and planner busy-time blocking.',
    pages:['/calendar.html','/scheduling.html','/scheduling-admin.html','/appointments.html'], keywords:['google calendar','oauth','availability','appointment'],
    steps:['Open Calendar or Scheduling.','Choose Connect Google Calendar.','Complete Google OAuth permission.','Select/configure appointment types.','Set weekly availability.','Add blackout periods when needed.','Personal calendar events can block availability when synchronization is enabled.','Use Appointments to review scheduled client sessions and status.']
  },
  {
    id:'quickbooks', category:'Integrations', title:'QuickBooks Online', summary:'Connect QuickBooks, review synchronization and reconcile accounting changes.',
    pages:['/accounting.html','/quickbooks-admin.html','/reconciliation.html'], keywords:['quickbooks','qbo','accounting','reconciliation'],
    steps:['Open Accounting/QuickBooks.','Choose Connect QuickBooks.','Complete Intuit OAuth and select the company.','Review the connected company/realm.','Use reconciliation to compare Celebration Suite and QuickBooks records.','Review inbound QuickBooks changes before applying them when the review queue is enabled.','Use Disconnect only when you intentionally want to remove the integration.'],
    troubleshoot:['If OAuth fails with a redirect mismatch, verify the registered callback URL exactly matches the production callback.']
  },
  {
    id:'team', category:'Team', title:'Team Members and Roles', summary:'Invite staff, assign roles and control who can access planner functions.',
    pages:['/team.html','/team-admin.html','/staff-invite.html'], keywords:['team','staff','role','invite'],
    steps:['Open Team.','Choose Invite Team Member.','Enter the person’s email and select their role/permissions.','Send the invite.','The team member uses the invitation link to create/access their account.','Review active team members and update roles if responsibilities change.']
  },
  {
    id:'staff-scheduling', category:'Team', title:'Staff Scheduling and Labor', summary:'Schedule event staff, avoid conflicts and track planned/actual labor.',
    pages:['/staff-operations.html','/staff-events.html','/time-tracking.html'], keywords:['staff','labor','call time','clock in','hourly rate'],
    steps:['Open Staff Operations.','Add staff availability if used.','Assign staff to the event.','Set event role, call time, shift end, hourly rate and planned hours.','Resolve or explicitly override scheduling conflicts.','On Event Day track actual start/end or time records.','Review actual hours and labor cost after the event.']
  },
  {
    id:'documents', category:'Documents', title:'Document Vault', summary:'Store event, vendor and client documents and control visibility.',
    pages:['/documents.html','/agreement-vault.html','/vendor-document-vault.html'], keywords:['documents','upload','contract','vendor document'],
    steps:['Open Documents.','Choose the event/vendor association when applicable.','Upload the file.','Set document type, expiration date and client visibility when available.','Use vendor document expiration status for compliance tracking.','Open/download files from the same vault later.']
  },
  {
    id:'questionnaires', category:'Client Portal', title:'Questionnaires', summary:'Create reusable questionnaires, send them to clients and turn responses into planning tasks.',
    pages:['/questionnaires.html','/questionnaire-public.html'], keywords:['questionnaire','template','client questions','analysis'],
    steps:['Open Questionnaires.','Create a reusable template or import a questionnaire template CSV.','Assign the template to the event or create a custom event questionnaire.','Send/share the questionnaire link or QR.','Review Draft/Sent/Submitted/Reviewed status.','Open submitted responses.','Run questionnaire analysis to identify missing details and suggested planning work.','Choose Create Planning Tasks to add selected suggestions to the event checklist.']
  },
  {
    id:'approvals', category:'Client Portal', title:'Client Approvals and Change Orders', summary:'Collect client decisions and maintain a clear record of requested changes.',
    pages:['/approvals.html','/approval-public.html','/change-orders.html','/change-order-public.html'], keywords:['approval','change order','client decision'],
    steps:['Create the approval/change request from the event.','Enter the decision/request details and any financial impact.','Share it with the client through the portal/public link.','The client reviews and responds.','The planner reviews the response and updates the event plan/financials as needed.','Keep the resolved record for the event history.']
  },
  {
    id:'event-day', category:'Event Day', title:'Event Day Command Center', summary:'Run the event live from one operational screen.',
    pages:['/event-day-command.html','/event-day.html'], keywords:['event day','command center','run of show','vendors','staff'],
    steps:['Open Event Day from the Event Workspace.','Review the live timeline/run of show.','Confirm scheduled staff and assignments.','Review vendor arrival/load-in times and check vendors in/out.','Review inventory/packing status.','Use QR Guest Check-In for arrivals.','Record issues, notes or operational changes as they happen.','Use Event Book/BEO/floor-plan references as needed during execution.']
  },
  {
    id:'event-book', category:'Event Day', title:'Event Book, Vendor Packet and BEO', summary:'Generate purpose-specific event packets from current event data.',
    pages:['/event-book.html','/event-book-admin.html'], keywords:['event book','beo','vendor packet','production book'],
    steps:['Open Event Book from the event.','Choose Staff Production Book for internal execution details.','Choose Vendor Packet for vendor-facing information.','Choose Client Final Details for client-facing final information.','Choose BEO / Function Sheet for function/service operations.','Review the generated information before printing/exporting.']
  },
  {
    id:'closeout', category:'Event Day', title:'Event Closeout', summary:'Close the event after execution and resolve inventory, finances and outstanding work.',
    pages:['/closeouts.html','/event-closeout.html'], keywords:['closeout','archive','return','missing items'],
    steps:['Open Event Closeout.','Confirm event-day tasks are complete.','Finish inventory return and condition tracking.','Resolve missing/damaged items.','Confirm vendor/staff operational records.','Review outstanding invoices/payments/expenses.','Complete closeout notes.','Archive the event when everything is reconciled.']
  },
  {
    id:'branding', category:'Setup & Branding', title:'White-Label Branding', summary:'Set the business name, logo and colors clients should see.',
    pages:['/settings.html'], keywords:['branding','logo','colors','white label'],
    steps:['Open Settings.','Enter the planner business name.','Enter/upload the planner logo URL.','Choose primary, secondary and accent colors.','Set email sender name and reply-to email.','Save Settings.','Open an event and Preview Client Portal to verify the branding.'],
    tips:['Tenant/client surfaces use the tenant logo. If no logo exists, the app should use business initials—not the Celebration Suite product logo.']
  },
  {
    id:'security', category:'Setup & Branding', title:'Security, Passwords and 2FA', summary:'Protect planner and client accounts with password recovery and two-factor authentication.',
    pages:['/security.html','/client-security.html','/forgot-password.html','/reset-password.html'], keywords:['security','2fa','password','reset'],
    steps:['Open Security.','Enroll planner/admin 2FA and save recovery information securely.','Use Forgot Password when an account cannot sign in.','Use the emailed reset link before it expires.','Clients can enroll optional 2FA from Client Security when enabled.']
  },
  {
    id:'backup', category:'Setup & Branding', title:'Backup, Export and Restore', summary:'Export account data and safely validate a backup before restoring it.',
    pages:['/backup.html','/backup-admin.html','/restore-admin.html'], keywords:['backup','restore','export','recovery'],
    steps:['Open Backup & Export.','Create/download a current backup before a major change.','For restore, upload the Celebration Suite backup JSON.','Run dry-run validation first.','Review supported tables and row counts.','Select tables to restore.','Use skip-existing mode unless overwrite is intentionally required.','Enter the required confirmation phrase before a real restore.','Review restore results table-by-table.']
  },
  {
    id:'support', category:'Troubleshooting', title:'Get Help and Submit a Support Ticket', summary:'Search the Knowledge Base first, then create a support ticket with enough context to investigate.',
    pages:['/support.html','/knowledge-base.html'], keywords:['support','ticket','bug','help'],
    steps:['Search the Knowledge Base using the feature/page name or the task you are trying to complete.','Follow the troubleshooting section of the matching article.','If the issue remains, open Support.','Enter a clear subject and choose the closest category.','Describe what you clicked, what you expected, and what happened instead.','Include the event/account context when relevant.','Set priority appropriately and submit.'],
    tips:['The platform admin can review recent runtime errors, activity logs, account status and integrations when investigating a ticket.']
  },
  {
    id:'troubleshoot-dead-page', category:'Troubleshooting', title:'Page Loads but Buttons Do Nothing', summary:'What to do when a page shell appears but controls do not respond.',
    pages:['/support.html'], keywords:['buttons not working','blank page','loading','javascript','dead page'],
    steps:['Refresh the page once.','Confirm you are signed in and the correct event is selected.','Return to Dashboard and reopen the event/tool.','If the page still shows Loading or controls remain inert, open Support and submit a bug ticket.','Include the page name, event, approximate time, and what button you clicked.'],
    tips:['Celebration Suite reports uncaught browser/runtime errors to the platform error log when possible, so the administrator can correlate your report with the technical failure.']
  },
  {
    id:'troubleshoot-event-context', category:'Troubleshooting', title:'Wrong Event or Empty Event Page', summary:'Fix tools that opened without the event you were working on.',
    pages:['/support.html'], keywords:['wrong event','empty event','event id','booking id'],
    steps:['Return to the Event Workspace for the correct event.','Open the tool from inside that workspace rather than from an old bookmark.','Confirm the page/event selector shows the correct event.','If the wrong event continues to load, submit a support ticket with the event name and page URL.']
  },
  {
    id:'platform-admin', category:'Administration', title:'Platform Owner Admin Console', summary:'Manage tenants, users, support, logs, licenses, integrations and runtime errors as the SaaS owner.',
    pages:['/platform-admin.html','/platform-login.html'], keywords:['admin','users','last login','logs','tenant','support'],
    steps:['Sign in through the Platform Admin login.','Use Tenants to find a planner/business account.','Use Users to review user email, role, status, account creation and last login.','Open Support to review customer tickets and resolutions.','Use Activity Logs to investigate account actions.','Use Integrations to review connection state.','Use Licenses to review plan and expiration status.','Use Errors to see captured runtime/browser failures by tenant/user/page.','Use the tenant drill-down to combine account, users, licenses, events, support and error context during troubleshooting.']
  }
];

window.CSKBPageMap = {};
for (const a of window.CSKnowledgeBase) for (const p of (a.pages||[])) if (!window.CSKBPageMap[p]) window.CSKBPageMap[p]=a.id;
