import fs from 'node:fs';import path from 'node:path';
const root=path.resolve('.');let pass=0,fail=0;const check=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${name}`);ok?pass++:fail++};const exists=f=>fs.existsSync(path.join(root,f));const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const core=['index.html','register.html','login.html','activate.html','app.html','event.html','portal.html','settings.html','platform-admin.html','license-expired.html','crm.html','proposals.html','proposal-public.html','contract-public.html','financials.html'];
const v3pages=['vendors.html','inventory.html','guests.html','rsvp-public.html','appointments.html','approvals.html','approval-public.html','registration.html','registration-public.html','floorplan.html','event-day.html'];
const v3fns=['vendors.mjs','inventory.mjs','guests.mjs','rsvp-public.mjs','appointments.mjs','approvals.mjs','approval-public.mjs','registrations.mjs','registration-public.mjs','registration-verify.mjs','floorplans.mjs','event-day.mjs'];
for(const f of [...core,...v3pages,'supabase/migrations/0001_WHITE_LABEL_PLATFORM.sql','supabase/migrations/0002_CRM_PROPOSALS_FINANCIALS.sql','supabase/migrations/0003_ADVANCED_PLANNING_TOOLS.sql','netlify/functions/_tenant.mjs','netlify/functions/events.mjs',...v3fns.map(x=>'netlify/functions/'+x)])check(`exists ${f}`,exists(f));
const m1=read('supabase/migrations/0001_WHITE_LABEL_PLATFORM.sql'),m2=read('supabase/migrations/0002_CRM_PROPOSALS_FINANCIALS.sql'),m3=read('supabase/migrations/0003_ADVANCED_PLANNING_TOOLS.sql');
check('tenant schema exists',m1.includes('create table if not exists public.tenants'));check('license plans exist',m1.includes('single_event')&&m1.includes('annual_unlimited'));check('license expiration RPC exists',m1.includes('expire_white_label_licenses'));
for(const t of ['tenant_clients','tenant_leads','tenant_activity','tenant_proposals','tenant_contracts','tenant_invoices','tenant_payments'])check(`v0.2 table ${t}`,m2.includes(`public.${t}`));
for(const t of ['tenant_vendors','tenant_inventory_items','tenant_inventory_reservations','tenant_guests','tenant_registration_types','tenant_registrations','tenant_appointments','tenant_approvals','tenant_floorplans'])check(`v0.3 table ${t}`,m3.includes(`public.${t}`));
const eventFn=read('netlify/functions/events.mjs');check('event API scopes by tenant',eventFn.includes('tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}'));check('event API enforces active license',eventFn.includes('requireActive(ctx)'));check('single event license event binding enforced',eventFn.includes('This Single Event license is already assigned to an event.')&&eventFn.includes('event_id:created.id'));
for(const f of ['vendors.mjs','inventory.mjs','guests.mjs','appointments.mjs','approvals.mjs','registrations.mjs','floorplans.mjs','event-day.mjs']){const s=read('netlify/functions/'+f);check(`${f} requires active license`,s.includes('requireActive(ctx)'));check(`${f} tenant scoped`,s.includes('ctx.tenant.id'));}
check('inventory enforces same-date availability',read('netlify/functions/inventory.mjs').includes('used+qty+designQty>Number(item.quantity||0)')&&read('netlify/functions/inventory.mjs').includes('available for manual reservation on that event date'));check('public RSVP tokenized',read('netlify/functions/rsvp-public.mjs').includes('client_portal_token=eq.'));check('public approval tokenized',read('netlify/functions/approval-public.mjs').includes('public_token=eq.'));check('public registration tokenized',read('netlify/functions/registration-public.mjs').includes('public_token=eq.'));check('paid registration uses tenant Stripe',read('netlify/functions/registration-public.mjs').includes('kind=eq.stripe'));check('paid registration verifies tenant metadata',read('netlify/functions/registration-verify.mjs').includes("metadata?.tenant_id!==reg.tenant_id"));check('event day tenant scoped',read('netlify/functions/event-day.mjs').includes('event_id=eq.${encodeURIComponent(eventId)}'));
const settings=read('netlify/functions/tenant-settings.mjs');check('integration credentials encrypted',settings.includes('encrypt(JSON.stringify'));const env=read('.env.example');check('separate secrets documented',env.includes('INTEGRATION_ENCRYPTION_KEY')&&env.includes('PLATFORM_ADMIN_KEY'));
const htmls=fs.readdirSync(root).filter(x=>x.endsWith('.html'));const all=htmls.map(x=>read(x)).join('\n');const tenantFacing=['app.html','event.html','portal.html','proposal-public.html','contract-public.html','rsvp-public.html','approval-public.html','registration-public.html','staff-invite.html'];const tenantFacingText=tenantFacing.map(x=>read(x)).join('\n');check('Sage seller branding stays out of tenant-facing white-label pages',!/(Sage\s*&\s*Celebration|sageandcelebration|702-827-7340)/i.test(tenantFacingText));check('Celebration Suite seller identity present',/Celebration Suite/.test(read('index.html'))&&/Sage\s*&amp;\s*Celebration LLC/.test(read('index.html')));check('dashboard stays focused on primary navigation',!read('app.html').includes('What are you working on today?')&&!read('app.html').includes('/automations.html')&&!read('app.html').includes('/closeouts.html'));check('event workspace links event day',read('event.html').includes('/event-day.html?event_id='));check('floor plan supports original palette drag and placed-object movement',read('floorplan.html').includes('ondragstart')&&read('floorplan.html').includes('ondrop')&&read('floorplan.html').includes('onpointerdown')&&read('floorplan.html').includes('floorplans'));check('guest page shares RSVP link',read('guests.html').includes('/rsvp-public.html?event=')&&read('guests.html').includes('&code='));check('registration page shares public link',read('registration.html').includes('data.public_url')&&read('registration.html').includes('Copy Ticket Sales Link'));check('event day supports guest and ticket check-in',read('event-day.html').includes("checkin('guest'")&&read('event-day.html').includes("checkin('ticket'"));

const v4pages=['team.html','staff-invite.html','time-tracking.html','automations.html','closeouts.html'];
const v4fns=['team.mjs','staff-invite.mjs','time-entries.mjs','automations.mjs','automation-run.mjs','closeouts.mjs','_automation-engine.mjs'];
for(const f of [...v4pages,'supabase/migrations/0004_TEAM_AUTOMATION_AGENCY.sql',...v4fns.map(x=>'netlify/functions/'+x)])check(`v0.4 exists ${f}`,exists(f));
const m4=read('supabase/migrations/0004_TEAM_AUTOMATION_AGENCY.sql');
for(const t of ['tenant_staff_invites','tenant_event_assignments','tenant_time_entries','tenant_automation_rules','tenant_automation_runs','tenant_event_closeouts'])check(`v0.4 table ${t}`,m4.includes(`public.${t}`));
check('team user permissions column',m4.includes('permissions jsonb'));check('team hourly rate column',m4.includes('hourly_rate numeric'));
const tenantHelper=read('netlify/functions/_tenant.mjs');check('tenant helper validates active user',tenantHelper.includes("user.status!=='active'"));check('permission helper exists',tenantHelper.includes('requirePermission'));check('assignment access helper exists',tenantHelper.includes('assertEventAccess'));
const teamFn=read('netlify/functions/team.mjs');check('team API requires manage_team',teamFn.includes("requirePermission(ctx,'manage_team')"));check('team invite expires seven days',teamFn.includes('7*86400000'));check('team API assigns events',teamFn.includes("action==='assign'"));
const inviteFn=read('netlify/functions/staff-invite.mjs');check('staff invite checks expiry',inviteFn.includes('Date.parse(inv.expires_at)<=Date.now()'));check('staff invite hashes password',inviteFn.includes('hashPassword(password)'));check('staff invite creates session',inviteFn.includes('createSession'));
const timeFn=read('netlify/functions/time-entries.mjs');check('time tracking permission enforced',timeFn.includes("requirePermission(ctx,'time_tracking')"));check('time tracking prevents two open clocks',timeFn.includes('already has an open time entry'));check('time tracking uses hourly rate',timeFn.includes('userRow.hourly_rate'));
const autoFn=read('netlify/functions/automations.mjs'),engine=read('netlify/functions/_automation-engine.mjs'),runner=read('netlify/functions/automation-run.mjs');check('automation management restricted',autoFn.includes("requirePermission(ctx,'manage_automations')"));for(const r of ['stale_lead','overdue_invoice','event_countdown','client_task_reminder','post_event_closeout'])check(`automation rule ${r}`,engine.includes(`rule.rule_type==='${r}'`));check('automation dedupe key storage',engine.includes('tenant_automation_runs'));check('automation uses tenant email',engine.includes('sendTenantEmail'));check('automation runner scheduled hourly',runner.includes("schedule:'0 * * * *'"));check('post event closes event',engine.includes("status:'completed'"));check('closeout can reopen event',read('netlify/functions/closeouts.mjs').includes("status==='reopened'?'active':'completed'"));
const eventsV4=read('netlify/functions/events.mjs'),bootV4=read('netlify/functions/bootstrap.mjs');check('event API filters assigned events',eventsV4.includes('assignedEventIds(ctx)'));check('event API asserts assigned event access',eventsV4.includes('assertEventAccess(ctx,id)'));check('dashboard bootstrap filters assigned events',bootV4.includes('assignedEventIds(ctx)'));check('bootstrap returns current user role',bootV4.includes('permissions:ctx.user.permissions'));
for(const [f,pn] of [['guests.mjs','manage_guests'],['approvals.mjs','manage_approvals'],['registrations.mjs','manage_guests'],['floorplans.mjs','manage_floorplans'],['event-day.mjs','event_day']]){const x=read('netlify/functions/'+f);check(`${f} permission enforced`,x.includes(`requirePermission(ctx,'${pn}')`));check(`${f} assignment enforced`,x.includes('assertEventAccess(ctx,'));}
check('dashboard links team',read('app.html').includes('/team.html'));check('event workspace links labor',read('event.html').includes('/time-tracking.html?event_id='));check('settings links automations',read('settings.html').includes('/automations.html'));check('event workspace links closeout',read('event.html').includes('event-closeout.html'));check('event workspace links labor',read('event.html').includes('/time-tracking.html?event_id='));check('event checklist stores parseable due date',read('event.html').includes('String(due).match(/\\d{4}-\\d{2}-\\d{2}/)')&&read('event.html').includes('due=m[0]')); 


const v5pages=['pricing.html','onboarding.html','billing.html','demo.html','terms.html','privacy.html','eula.html'];
const v5fns=['pricing-config.mjs','onboarding.mjs','account-license.mjs','account-export.mjs','legal-accept.mjs','marketplace-order.mjs'];
for(const f of [...v5pages,'supabase/migrations/0005_COMMERCIALIZATION_ONBOARDING.sql',...v5fns.map(x=>'netlify/functions/'+x)])check(`v0.5 exists ${f}`,exists(f));
const m5=read('supabase/migrations/0005_COMMERCIALIZATION_ONBOARDING.sql');
for(const t of ['tenant_onboarding','platform_orders','legal_acceptances'])check(`v0.5 table ${t}`,m5.includes(`public.${t}`));
check('single event license binds specific event',m5.includes('event_id uuid references public.tenant_events'));
check('pricing page has three commercial plans',read('pricing.html').includes('Single Event')&&read('pricing.html').includes('Planner Unlimited Monthly')&&read('pricing.html').includes('Planner Unlimited Annual'));
check('registration requires legal acceptance',read('register.html').includes('accept_legal')&&read('netlify/functions/auth-register.mjs').includes('accept_legal!==true'));
check('registration stores legal acceptances',read('netlify/functions/auth-register.mjs').includes("['terms','privacy','eula']"));
check('onboarding checks brand email payment and event',read('netlify/functions/onboarding.mjs').includes('brand_complete')&&read('netlify/functions/onboarding.mjs').includes('email_complete')&&read('netlify/functions/onboarding.mjs').includes('payment_complete')&&read('netlify/functions/onboarding.mjs').includes('first_event_complete'));
check('billing supports renewal upgrade and export',read('billing.html').includes('Renew Current Plan')&&read('billing.html').includes('Upgrade to Annual')&&read('billing.html').includes('account-export'));
check('annual checkout uses recurring subscription',read('netlify/functions/checkout-create.mjs').includes("['monthly_unlimited','annual_unlimited'].includes(plan)")&&read('netlify/functions/checkout-activate.mjs').includes("['monthly_unlimited','annual_unlimited'].includes(plan)")&&read('netlify/functions/checkout-activate.mjs').includes('oldSubscriptionId!==newSubscriptionId'));
check('marketplace fulfillment creates license code',read('netlify/functions/marketplace-order.mjs').includes('license_codes')&&read('netlify/functions/marketplace-order.mjs').includes('activation_url'));
check('marketplace fulfillment is admin protected',read('netlify/functions/marketplace-order.mjs').includes('x-platform-admin-key'));
check('direct Stripe purchases recorded as platform orders',read('netlify/functions/checkout-activate.mjs').includes("source:'stripe'")&&read('netlify/functions/checkout-activate.mjs').includes('platform_orders'));
check('redeemed marketplace order links tenant',read('netlify/functions/redeem-license.mjs').includes('platform_orders?license_code_id=eq.'));
check('public demo is read only',read('demo.html').includes('Read-only demo')&&!read('demo.html').includes('WLP.api('));
check('seller console includes marketplace fulfillment',read('platform-admin.html').includes('Fulfill Marketplace Order')&&read('platform-admin.html').includes('marketplace-order'));
check('settings links setup and billing',read('settings.html').includes('/onboarding.html')&&read('settings.html').includes('/billing.html'));



// v0.6 monthly billing + unified authentication
const v6files=['supabase/migrations/0006_MONTHLY_BILLING_AND_UNIFIED_AUTH.sql','platform-login.html','client-login.html','netlify/functions/_oauth.mjs','netlify/functions/google-auth-start.mjs','netlify/functions/google-auth-callback.mjs','netlify/functions/platform-auth-login.mjs','netlify/functions/platform-auth-bootstrap.mjs','netlify/functions/platform-auth-session.mjs','netlify/functions/client-auth-login.mjs','netlify/functions/client-auth-setup.mjs','netlify/functions/client-auth-session.mjs','netlify/functions/stripe-webhook.mjs','netlify/functions/billing-portal.mjs'];
for(const f of v6files)check(`v0.6 exists ${f}`,exists(f));
const m6=read('supabase/migrations/0006_MONTHLY_BILLING_AND_UNIFIED_AUTH.sql');
check('monthly unlimited plan added',m6.includes("'monthly_unlimited'"));
check('monthly billing stores subscription id',m6.includes('stripe_subscription_id'));
check('billing recovery fields exist',m6.includes('past_due_at')&&m6.includes('grace_until'));
check('billing suspension tenant state exists',m6.includes('billing_suspended'));
check('client account tables exist',m6.includes('tenant_client_users')&&m6.includes('tenant_client_event_access'));
check('monthly checkout uses subscription mode',read('netlify/functions/checkout-create.mjs').includes("isSubscription?'subscription':'payment'"));
check('monthly Stripe price env used',read('netlify/functions/checkout-create.mjs').includes('STRIPE_PRICE_MONTHLY'));
check('Stripe payment failure enters past due',read('netlify/functions/stripe-webhook.mjs').includes("event.type==='invoice.payment_failed'")&&read('netlify/functions/stripe-webhook.mjs').includes("status:'past_due'"));
check('Stripe payment recovery reactivates',read('netlify/functions/stripe-webhook.mjs').includes("event.type==='invoice.paid'")&&read('netlify/functions/stripe-webhook.mjs').includes("status:'active'"));
check('billing portal available',read('netlify/functions/billing-portal.mjs').includes('billing_portal/sessions'));
check('tenant context allows internal billing recovery only while usable',read('netlify/functions/_tenant.mjs').includes("license.status==='past_due'")&&read('netlify/functions/_tenant.mjs').includes('graceEnd>now'));
check('account license hides recovery timing fields',!read('netlify/functions/account-license.mjs').includes('grace_until:')&&!read('netlify/functions/account-license.mjs').includes('past_due_at:'));
check('planner Google sign-in is existing-account gated',read('netlify/functions/_oauth.mjs').includes('No Celebration Suite planner or team account is approved'));
check('platform Google sign-in is approved-email gated',read('netlify/functions/_oauth.mjs').includes('not approved for Celebration Suite platform administration'));
check('client Google sign-in requires invited email',read('netlify/functions/_oauth.mjs').includes('Use the Google account that received this client portal invitation'));
check('staff Google sign-in requires invited email',read('netlify/functions/_oauth.mjs').includes('Use the Google account that received this team invitation'));
check('client portal requires authenticated client session',read('netlify/functions/client-portal.mjs').includes('readClientSession')&&read('netlify/functions/client-portal.mjs').includes('tenant_client_event_access'));
check('platform admin UI uses account session',read('platform-admin.html').includes('platform-auth-session')&&!read('platform-admin.html').includes('Platform admin key'));
check('planner login offers Google',read('login.html').includes('google-auth-start?audience=tenant'));
check('platform login offers email and Google',read('platform-login.html').includes('platform-auth-login')&&read('platform-login.html').includes('audience=platform'));
check('client login offers email and Google',read('client-login.html').includes('client-auth-login')&&read('client-login.html').includes('audience=client'));
check('staff invite offers Google',read('staff-invite.html').includes('audience=staff_invite'));
const publicCopy=['index.html','pricing.html','billing.html','activate.html','terms.html','eula.html','login.html','platform-login.html','client-login.html','portal.html'].map(x=>read(x)).join('\n');
check('no customer-facing recovery duration disclosure',!/30\s*[- ]?day|grace period/i.test(publicCopy));
check('monthly public price is 59',read('netlify/functions/pricing-config.mjs').includes('PUBLIC_PRICE_MONTHLY,59')&&read('pricing.html').includes('$59'));

// v0.6.1 reliability, refresh and autosave hardening
for(const f of ['supabase/migrations/0007_RELIABILITY_DRAFTS_AND_SYNC.sql','netlify/functions/client-draft.mjs','docs/RELIABILITY-HOTFIX-REFERENCE.md','docs/V0.6.1-RELIABILITY-AUTOSAVE-HOTFIXES.md'])check(`v0.6.1 exists ${f}`,exists(f));
const m7=read('supabase/migrations/0007_RELIABILITY_DRAFTS_AND_SYNC.sql'),portalV61=read('portal.html'),eventV61=read('event.html'),eventDayV61=read('event-day.html'),clientDraft=read('netlify/functions/client-draft.mjs');
check('client cloud draft table exists',m7.includes('public.client_portal_drafts'));
check('client cloud draft RLS enabled',m7.includes('enable row level security'));
check('client draft endpoint checks client session',clientDraft.includes('readClientSession'));
check('client draft endpoint scopes event access',clientDraft.includes('tenant_client_event_access'));
check('client portal refreshes every 45 seconds',portalV61.includes('},45000)'));
check('client portal refreshes on focus and visibility',portalV61.includes("window.addEventListener('focus'")&&portalV61.includes("visibilitychange"));
check('client portal pauses refresh during dirty active edit',portalV61.includes("Editing — refresh paused"));
check('client message local autosave on input',portalV61.includes('storeLocalDraft()')&&portalV61.includes("messageBody.addEventListener('input'"));
check('client message secure cloud autosave after 2.5 seconds',portalV61.includes('setTimeout(run,2500)')&&portalV61.includes("client-draft?token="));
check('client draft newer local or cloud recovery',portalV61.includes('localTime>=remoteTime'));
check('client draft clears after successful send',portalV61.includes("method:'DELETE'"));
check('event workspace local backup exists',eventV61.includes("localStorage.setItem(localDraftKey"));
check('event workspace autosaves after 2.5 seconds',eventV61.includes('setTimeout(()=>save({quiet:true}),2500)'));
check('event workspace warns on dirty unload',eventV61.includes("beforeunload"));
check('event workspace saves on page hide',eventV61.includes("visibilityState==='hidden'&&dirty"));
check('event workspace explicit save status exists',eventV61.includes('Saved securely')&&eventV61.includes('cloud save failed'));
check('event day refreshes every 45 seconds',eventDayV61.includes('},45000)'));
check('event day foreground reconnect refresh exists',eventDayV61.includes("window.addEventListener('focus'")&&eventDayV61.includes("window.addEventListener('online'"));
check('planner password login case insensitive',read('netlify/functions/auth-login.mjs').includes('email=ilike.'));
check('client password login case insensitive',read('netlify/functions/client-auth-login.mjs').includes('email=ilike.'));
check('platform password login case insensitive',read('netlify/functions/platform-auth-login.mjs').includes('email=ilike.'));
check('Google tenant identity lookup case insensitive',read('netlify/functions/_oauth.mjs').includes('tenant_users?email=ilike.'));
check('reliability doc records 45 second and 2.5 second standards',read('docs/RELIABILITY-HOTFIX-REFERENCE.md').includes('45 seconds')&&read('docs/RELIABILITY-HOTFIX-REFERENCE.md').includes('2.5 seconds'));


// v0.6.2 OAuth redirect host hardening
for(const f of ['docs/V0.6.2-OAUTH-REDIRECT-HOTFIX.md'])check(`v0.6.2 exists ${f}`,exists(f));
const oauth62=read('netlify/functions/_oauth.mjs'), callback62=read('netlify/functions/google-auth-callback.mjs');
check('Google OAuth uses incoming request origin',oauth62.includes('oauthOrigin=request=>new URL(request.url).origin'));
check('Google OAuth no longer imports shared SITE_URL origin',!oauth62.includes("origin,supabase")&&!oauth62.includes('${origin(request)}'));
check('Google callback post-login redirect uses incoming request origin',callback62.includes('const o=new URL(request.url).origin'));
check('OAuth hotfix preserves host-only sessions',!read('netlify/functions/_session.mjs').includes('Domain='));


// v0.7 launch readiness, branding and password reset
for(const f of ['supabase/migrations/0008_LAUNCH_EMAIL_PASSWORD_RESETS.sql','forgot-password.html','reset-password.html','launch-health.html','netlify/functions/_platform_mailer.mjs','netlify/functions/password-reset-request.mjs','netlify/functions/password-reset-complete.mjs','netlify/functions/checkout-readiness.mjs','netlify/functions/launch-health.mjs','docs/V0.7-LAUNCH-READINESS.md'])check(`v0.7 exists ${f}`,exists(f));
const m8=read('supabase/migrations/0008_LAUNCH_EMAIL_PASSWORD_RESETS.sql');
check('password reset token table exists',m8.includes('public.password_reset_tokens'));
check('password reset token RLS enabled',m8.includes('enable row level security'));
check('password reset links expire in 24 hours',read('netlify/functions/password-reset-request.mjs').includes('24*60*60*1000'));
check('password reset token stored hashed',read('netlify/functions/password-reset-request.mjs').includes("createHash('sha256')")&&read('netlify/functions/password-reset-request.mjs').includes('token_hash'));
check('password reset is one-time',read('netlify/functions/password-reset-complete.mjs').includes('used_at=is.null')&&read('netlify/functions/password-reset-complete.mjs').includes('used_at:new Date().toISOString()'));
check('reset supports tenant platform client',read('netlify/functions/password-reset-request.mjs').includes("'tenant','platform','client'"));
check('planner login links password reset',read('login.html').includes('/forgot-password.html?type=tenant'));
check('platform login links password reset',read('platform-login.html').includes('/forgot-password.html?type=platform'));
check('client login links password reset',read('client-login.html').includes('/forgot-password.html?type=client'));
check('platform transactional email env documented',read('.env.example').includes('RESEND_API_KEY')&&read('.env.example').includes('PLATFORM_FROM_EMAIL'));
check('registration sends welcome email best effort',read('netlify/functions/auth-register.mjs').includes('Welcome to Celebration Suite')&&read('netlify/functions/auth-register.mjs').includes('.catch(()=>{})'));
check('checkout readiness endpoint exists',read('netlify/functions/checkout-readiness.mjs').includes('STRIPE_PRICE_SINGLE_EVENT')&&read('netlify/functions/checkout-readiness.mjs').includes('STRIPE_PRICE_MONTHLY')&&read('netlify/functions/checkout-readiness.mjs').includes('STRIPE_PRICE_ANNUAL'));
check('checkout error names missing config',read('netlify/functions/checkout-create.mjs').includes('Online checkout setup is incomplete'));
check('activation page checks checkout readiness',read('activate.html').includes('checkout-readiness')&&read('activate.html').includes('Secure online checkout is ready.'));
check('launch health is platform-session protected',read('netlify/functions/launch-health.mjs').includes('readPlatformSession'));
check('launch health does not return secret values',!read('netlify/functions/launch-health.mjs').includes('process.env[k]||')&&!read('launch-health.html').includes('STRIPE_SECRET_KEY='));
check('platform admin links launch health',read('platform-admin.html').includes('/launch-health.html'));
check('new elegant logo mark contains sparkle and botanical accent',read('assets/celebration-suite-mark.svg').includes('#D9BE8C')&&read('assets/celebration-suite-mark.svg').includes('#A9B89A'));
check('full logo includes Sage and Celebration endorsement',read('assets/celebration-suite-logo.svg').includes('BY SAGE &amp; CELEBRATION'));


// v0.11 business-grade operations
for(const f of ['supabase/migrations/0012_BUSINESS_GRADE_OPERATIONS.sql','purchasing.html','vendor-reviews.html','partner-access.html','partner-portal.html','reconciliation.html','netlify/functions/purchasing.mjs','netlify/functions/vendor-reviews.mjs','netlify/functions/partner-links.mjs','netlify/functions/partner-public.mjs','netlify/functions/reconciliation.mjs','docs/V0.11-BUSINESS-GRADE-OPERATIONS.md'])check(`v0.11 exists ${f}`,exists(f));
const m12=read('supabase/migrations/0012_BUSINESS_GRADE_OPERATIONS.sql');
for(const t of ['tenant_vendor_reviews','tenant_purchasing_gaps','tenant_event_day_tasks','tenant_event_incidents','tenant_referral_partner_links','tenant_reconciliation_snapshots'])check(`v0.11 table ${t}`,m12.includes(t));
check('purchasing API tenant scoped',read('netlify/functions/purchasing.mjs').includes('tenant_id=eq.')&&read('netlify/functions/purchasing.mjs').includes('requirePermission'));
check('vendor reviews tenant scoped',read('netlify/functions/vendor-reviews.mjs').includes('tenant_id=eq.')&&read('netlify/functions/vendor-reviews.mjs').includes('manage_vendors'));
check('partner portal uses token access',read('netlify/functions/partner-public.mjs').includes('token=eq.')&&read('partner-portal.html').includes('partner-public?token='));
check('partner links can be disabled',read('netlify/functions/partner-links.mjs').includes('active:d.active!==false'));
check('event day supports operational tasks',read('netlify/functions/event-day.mjs').includes("d.kind==='task'")&&read('event-day.html').includes('Run of Show / Tasks'));
check('event day supports incident log',read('netlify/functions/event-day.mjs').includes("d.kind==='incident'")&&read('event-day.html').includes('Incident Log'));
check('event day shows live labor',read('event-day.html').includes('Team on the Clock')&&read('netlify/functions/event-day.mjs').includes('tenant_time_entries'));
check('QuickBooks helper exported for reconciliation',read('netlify/functions/quickbooks.mjs').includes('export async function getQuickBooksSummary'));
check('reconciliation compares local and QuickBooks',read('netlify/functions/reconciliation.mjs').includes('invoice_delta')&&read('netlify/functions/reconciliation.mjs').includes('balance_delta'));
check('new operations included in account export',read('netlify/functions/account-export.mjs').includes('tenant_purchasing_gaps')&&read('netlify/functions/account-export.mjs').includes('tenant_event_incidents'));
check('purchasing remains available from event workspace',read('event.html').includes('purchasing.html'));
check('reconciliation remains available from accounting',read('accounting.html').includes('/reconciliation.html'));
check('referrals links partner access',read('referrals.html').includes('/partner-access.html'));


// v0.12 platform control + intelligence
for(const f of ['supabase/migrations/0013_PLATFORM_CONTROL_INTELLIGENCE.sql','audit.html','notifications.html','integration-center.html','netlify/functions/audit.mjs','netlify/functions/notifications.mjs','netlify/functions/integration-center.mjs','netlify/functions/external-api.mjs','netlify/functions/_webhooks.mjs','docs/V0.12-PLATFORM-CONTROL-INTELLIGENCE.md'])check(`v0.12 exists ${f}`,exists(f));
const m13=read('supabase/migrations/0013_PLATFORM_CONTROL_INTELLIGENCE.sql');
for(const t of ['tenant_audit_log','tenant_notifications','tenant_api_keys','tenant_webhooks','tenant_webhook_deliveries'])check(`v0.12 table ${t}`,m13.includes(t));
check('API keys stored hashed',read('netlify/functions/integration-center.mjs').includes("createHash('sha256')")&&read('netlify/functions/integration-center.mjs').includes('key_hash'));
check('external API supports event reads',read('netlify/functions/external-api.mjs').includes("resource==='events'"));
check('external API supports lead intake',read('netlify/functions/external-api.mjs').includes("request.method==='POST'&&resource==='leads'"));
check('webhooks are HMAC signed',read('netlify/functions/_webhooks.mjs').includes("createHmac('sha256'")&&read('netlify/functions/_webhooks.mjs').includes('x-celebration-signature'));
check('webhook deliveries logged',read('netlify/functions/_webhooks.mjs').includes('tenant_webhook_deliveries'));
check('client activity creates audit history',read('netlify/functions/client-portal.mjs').includes('tenant_audit_log'));
check('client activity creates planner notification',read('netlify/functions/client-portal.mjs').includes('tenant_notifications'));
check('client activity emits webhook',read('netlify/functions/client-portal.mjs').includes("emitWebhook(event.tenant_id,'client.activity'"));
check('owner BI includes event profitability',read('netlify/functions/analytics.mjs').includes('event_profitability')&&read('analytics.html').includes('Event Profitability'));
check('owner BI includes inventory utilization',read('netlify/functions/analytics.mjs').includes('inventory_utilization')&&read('analytics.html').includes('Inventory Utilization'));
check('new platform control data included in export',read('netlify/functions/account-export.mjs').includes('tenant_audit_log')&&read('netlify/functions/account-export.mjs').includes('tenant_webhook_deliveries'));
check('notification center page remains available',fs.existsSync(path.join(root,'notifications.html')));
check('integration center page remains available',fs.existsSync(path.join(root,'integration-center.html')));
check('event workspace links activity history',read('event.html').includes('/audit.html?event_id='));


// v0.13 deep workspace + design studio
for(const f of ['supabase/migrations/0014_DEEP_WORKSPACE_DESIGN_STUDIO.sql','inspiration.html','netlify/functions/inspiration.mjs','netlify/functions/inspiration-upload.mjs','docs/V0.13-DEEP-WORKSPACE-DESIGN-STUDIO.md'])check(`v0.13 exists ${f}`,exists(f));
const m14=read('supabase/migrations/0014_DEEP_WORKSPACE_DESIGN_STUDIO.sql');
check('design board table exists',m14.includes('tenant_inspiration_boards'));
for(const c of ['rotation','height','requested_quantity','client_note','is_client_visible'])check(`design item field ${c}`,m14.includes(`add column if not exists ${c}`));
check('design media bucket exists',m14.includes('celebration-suite-media'));
check('design studio supports rotation',read('inspiration.html').includes("'rotateL'")&&read('inspiration.html').includes("'rotateR'"));
check('design studio supports two dimensional resizing',read('inspiration.html').includes("gesture.kind==='resize'")&&read('inspiration.html').includes('x.height'));
check('design studio supports layer controls',read('inspiration.html').includes("'front'")&&read('inspiration.html').includes("'back'"));
check('design studio uses inventory gallery',read('inspiration.html').includes('Master Inventory')&&read('netlify/functions/inspiration.mjs').includes('tenant_inventory_items'));
check('approved designs reconcile inventory',read('netlify/functions/inspiration.mjs').includes('reconcileDesignReservation'));
check('manual and design reservation quantities split',m14.includes('manual_quantity')&&m14.includes('design_quantity'));
check('client portal receives design board',read('netlify/functions/client-portal.mjs').includes('tenant_inspiration_items')&&read('portal.html').includes("['design','Design Board']"));
check('client can leave design feedback',read('portal.html').includes('data-design-note')&&read('netlify/functions/client-portal.mjs').includes("d.action==='design-update'"));
check('event workspace is command center',read('event.html').includes('Event Operations')&&read('event.html').includes('Planning Checklist')&&read('event.html').includes('Client Portal Permissions'));
check('event workspace has richer budget',read('event.html').includes('Proposed')&&read('event.html').includes('Approved')&&read('event.html').includes('Actual'));
check('event book includes design board',read('event-book.html').includes("section('Design Board'"));
check('account export includes design board config',read('netlify/functions/account-export.mjs').includes('tenant_inspiration_boards'));


// v0.14 deep event operations parity
for(const f of ['supabase/migrations/0015_DEEP_EVENT_OPERATIONS_PARITY.sql','guest-checkin.html','guests.html','floorplan.html','documents.html','closeouts.html','netlify/functions/file-upload.mjs','netlify/functions/document-open.mjs','netlify/functions/event-closeout-run.mjs','docs/V0.14-DEEP-EVENT-OPERATIONS-PARITY.md'])check(`v0.14 exists ${f}`,exists(f));
const m15=read('supabase/migrations/0015_DEEP_EVENT_OPERATIONS_PARITY.sql');
for(const c of ['invitation_settings','invitation_code','meal_choices','background_url','tenant_floorplan_versions','version_number','expiration_date','pnl_snapshot','inventory_verified'])check(`v0.14 migration capability ${c}`,m15.includes(c));
check('guest suite has CSV bulk import',read('guests.html').includes('Import CSV')&&read('netlify/functions/guests.mjs').includes("action==='bulk-import'"));
check('guest suite sends personalized invites',read('netlify/functions/guests.mjs').includes("action==='send-invite'")&&read('guests.html').includes('Copy Link'));
check('public RSVP supports meal choices',read('rsvp-public.html').includes('Meal selection')&&read('netlify/functions/rsvp-public.mjs').includes('meal_choices'));
check('mobile guest checkin exists',read('guest-checkin.html').includes('QR Guest Check-In')&&read('guest-checkin.html').includes('qr-checkin'));
check('floor plan has original professional library',read('floorplan.html').includes('Production & Entertainment')&&read('floorplan.html').includes('Ceremony & Wedding')&&read('floorplan.html').includes('Room & Logistics'));
check('floor plan supports room dimensions rotation and item dimensions',read('floorplan.html').includes('Room width (ft)')&&read('floorplan.html').includes('Rotate 45°')&&read('floorplan.html').includes('Width px'));
check('floor plan versioning backend exists',read('netlify/functions/floorplans.mjs').includes("action==='version'")&&m15.includes('tenant_floorplan_versions'));
check('document vault supports 30 MB upload',read('netlify/functions/file-upload.mjs').includes('30*1024*1024'));
check('document vault supports locked versions and expiry',read('documents.html').includes('Lock permanent record')&&read('netlify/functions/documents.mjs').includes('expiration_date')&&read('netlify/functions/documents.mjs').includes('locked'));
check('private documents open via fresh signed URLs',read('netlify/functions/document-open.mjs').includes('/storage/v1/object/sign/'));
check('closeout has P&L and gates',read('netlify/functions/closeouts.mjs').includes('estimated_profit')&&read('netlify/functions/closeouts.mjs').includes('inventory_verified')&&read('closeouts.html').includes('Finalize & Archive'));
check('daily closeout runner configured',read('netlify.toml').includes('event-closeout-run')&&read('netlify.toml').includes('15 8 * * *'));
check('dashboard separates archive',read('app.html').includes('Active / Upcoming')&&read('app.html').includes('Archive'));
check('client portal includes guests and floorplan',read('portal.html').includes("['guests','Invitations & Guests']")&&read('portal.html').includes("['floorplan','Floor Plan']"));
check('client portal backend returns guests and floorplans',read('netlify/functions/client-portal.mjs').includes('guests,floorplans'));
check('account export includes floor plan versions and closeouts',read('netlify/functions/account-export.mjs').includes('tenant_floorplan_versions')&&read('netlify/functions/account-export.mjs').includes('tenant_event_closeouts'));



// v0.15 deep client journey + communications
for(const f of ['supabase/migrations/0016_DEEP_CLIENT_JOURNEY_COMMUNICATIONS.sql','scheduling.html','vendor-quotes.html','netlify/functions/scheduling.mjs','netlify/functions/vendor-quotes.mjs','netlify/functions/resend-inbound-webhook.mjs','netlify/functions/telnyx-inbound-sms.mjs','netlify/functions/_communication-match.mjs','docs/V0.15-DEEP-CLIENT-JOURNEY-COMMUNICATIONS.md'])check(`v0.15 exists ${f}`,exists(f));
const m16=read('supabase/migrations/0016_DEEP_CLIENT_JOURNEY_COMMUNICATIONS.sql');
for(const t of ['tenant_appointment_types','tenant_scheduling_availability','tenant_scheduling_blocks','tenant_vendor_quotes'])check(`v0.15 table ${t}`,m16.includes(t));
for(const c of ['consultation_at','lost_reason','temperature','provider_event_id','match_status'])check(`v0.15 field ${c}`,m16.includes(c));
check('client portal supports appointment booking',read('netlify/functions/client-portal.mjs').includes("d.action==='appointment-book'")&&read('portal.html').includes("['appointments','Appointments']"));
check('client appointment cancellation has 24 hour rule',read('netlify/functions/client-portal.mjs').includes('24*3600000'));
check('scheduling supports weekly availability and blackout periods',read('scheduling.html').includes('Weekly Availability')&&read('scheduling.html').includes('Blackout Periods'));
check('vendor quotes compute full costs',read('netlify/functions/vendor-quotes.mjs').includes("'tax_amount'")&&read('netlify/functions/vendor-quotes.mjs').includes("'delivery_fee'"));
check('vendor quote selection books vendor and commits budget',read('netlify/functions/vendor-quotes.mjs').includes("status:'booked'")&&read('netlify/functions/vendor-quotes.mjs').includes('source_quote_id'));
check('client portal receives vendor options',read('netlify/functions/client-portal.mjs').includes('tenant_vendor_quotes')&&read('portal.html').includes("['vendors','Vendor Options']"));
check('Resend inbound webhook validates signature',read('netlify/functions/resend-inbound-webhook.mjs').includes('new Webhook(secret).verify'));
check('Telnyx inbound webhook verifies signature',read('netlify/functions/telnyx-inbound-sms.mjs').includes('crypto.verify'));
check('communications supports unmatched resolution',read('communications.html').includes('Resolve Match')&&read('netlify/functions/communications.mjs').includes("request.method==='PATCH'"));
check('communications contextual reply routing exists',read('netlify/functions/communications.mjs').includes('booking-${d.event_id}@${inboundDomain}'));
check('CRM tracks lead temperature and lost reason',read('crm.html').includes('Temperature')&&read('crm.html').includes('Lost reason'));
for(const r of ['agreement_signed','invoice_due','questionnaire_followup','overdue_task','vendor_document_due'])check(`v0.15 automation ${r}`,read('netlify/functions/_automation-engine.mjs').includes(`rule.rule_type==='${r}'`));
check('new scheduling and quote data included in export',read('netlify/functions/account-export.mjs').includes('tenant_appointment_types')&&read('netlify/functions/account-export.mjs').includes('tenant_vendor_quotes'));
// v0.16 easy-mode usability + floor-plan discoverability
for(const f of ['docs/V0.16-CHILD-SIMPLE-UX-FLOORPLAN.md'])check(`v0.16 exists ${f}`,exists(f));
check('dashboard removes duplicate task launcher',!read('app.html').includes('What are you working on today?'));
check('floor plan is event-workspace tool',read('event.html').includes('floorplan.html'));
check('event workspace promotes floor plan',read('event.html').includes('id="floorQuick"')&&read('event.html').includes('/floorplan.html?event_id='));
check('floor plan uses original drag-or-tap guidance',read('floorplan.html').includes('Drag an item from the library onto the room, or tap it to add'));
check('global task launcher removed',!read('assets/app.js').includes('easyOpen'));
check('easy mode toggle removed',!read('assets/app.js').includes('easyModeToggle')&&!read('assets/app.js').includes('cs-easy-mode')&&!read('assets/app.js').includes('simple-mode'));
check('floorplan uses original native library drag',read('floorplan.html').includes("setData('text/floor-type'")&&read('floorplan.html').includes("getData('text/floor-type'"));
check('floorplan library drag drops by coordinates',read('floorplan.html').includes('(e.clientX-r.left)/r.width')&&read('floorplan.html').includes('(e.clientY-r.top)/r.height'));


// v0.17 Guest Commerce, QR Ticketing & unified check-in
for(const f of ['supabase/migrations/0017_GUEST_COMMERCE_QR_TICKETING.sql','ticket.html','guest-checkin.html','netlify/functions/ticketing.mjs','netlify/functions/ticket-public.mjs','netlify/functions/qr-checkin.mjs','docs/V0.17-GUEST-COMMERCE-QR-TICKETING.md'])check(`v0.17 exists ${f}`,exists(f));
const m17=read('supabase/migrations/0017_GUEST_COMMERCE_QR_TICKETING.sql');
for(const t of ['tenant_registration_settings','tenant_registration_promos','tenant_ticket_orders','tenant_ticket_attendees'])check(`v0.17 table ${t}`,m17.includes(t));
check('ticket sales support multiple attendee QR codes',read('netlify/functions/registration-public.mjs').includes('tenant_ticket_attendees')&&read('ticket.html').includes('CSTICKET:'));
check('RSVP guest QR exists',read('guests.html').includes('CSGUEST:')&&read('rsvp-public.html').includes('CSGUEST:'));
check('unified QR scanner exists',read('guest-checkin.html').includes('Html5Qrcode')&&read('netlify/functions/qr-checkin.mjs').includes('CSTICKET:')&&read('netlify/functions/qr-checkin.mjs').includes('CSGUEST:'));
check('ticket sales supports promo codes',read('netlify/functions/registration-public.mjs').includes('tenant_registration_promos'));
check('ticket refunds supported',read('netlify/functions/ticketing.mjs').includes("action==='refund-order'"));
check('Stripe webhook completes ticket orders',read('netlify/functions/stripe-webhook.mjs').includes('ticket_order_id'));
check('event workspace exposes tickets and QR checkin',read('event.html').includes('registration.html')&&read('event.html').includes('guest-checkin.html'));
check('event workspace exposes ticketing',read('event.html').includes('Tickets & Registration')&&read('event.html').includes('QR Check-In'));
check('guest suite includes ticket holders',read('guests.html').includes('Ticket Holders')&&read('guests.html').includes('RSVP QR'));
check('account export includes ticket commerce',read('netlify/functions/account-export.mjs').includes('tenant_ticket_orders')&&read('netlify/functions/account-export.mjs').includes('tenant_ticket_attendees'));

// v0.18 QR inventory, bulk media and design-reservation sync
for(const f of ['supabase/migrations/0018_QR_INVENTORY_BULK_MEDIA_RESERVATIONS.sql','netlify/functions/inventory-image-upload.mjs','docs/V0.18-QR-INVENTORY-BULK-MEDIA-RESERVATIONS.md'])check(`v0.18 exists ${f}`,exists(f));
const m18=read('supabase/migrations/0018_QR_INVENTORY_BULK_MEDIA_RESERVATIONS.sql');
for(const c of ['qr_code','tenant_inventory_images','tenant_inventory_import_batches','design_item_ids','celebration-suite-inventory'])check(`v0.18 capability ${c}`,m18.includes(c));
check('inventory bulk CSV import exists',read('inventory.html').includes('Bulk inventory CSV import')&&read('netlify/functions/inventory.mjs').includes("action==='bulk-import'"));
check('bulk photo matching exists',read('inventory.html').includes('Match & upload photos')&&read('netlify/functions/inventory.mjs').includes("action==='match-photo'"));
check('inventory photo upload syncs primary image',read('netlify/functions/inventory-image-upload.mjs').includes('image_url:url')&&read('netlify/functions/inventory-image-upload.mjs').includes('tenant_inventory_images'));
check('inventory QR labels are 2x2',read('inventory.html').includes('width:2in;height:2in')&&read('inventory.html').includes('QR label'));
check('inventory QR phone lookup matches original flow',read('inventory-scan.html').includes('STORAGE LOCATION')&&read('inventory-scan.html').includes('action=lookup&code='));
check('design reservation stores source design ids',read('netlify/functions/inspiration.mjs').includes('design_item_ids:designIds')&&read('netlify/functions/client-portal.mjs').includes('design_item_ids:designIds'));
check('event inventory separates manual and approved design',read('event-inventory.html').includes('Approved Design')&&read('event-inventory.html').includes('manual_quantity'));
check('account export includes inventory media and import batches',read('netlify/functions/account-export.mjs').includes('tenant_inventory_images')&&read('netlify/functions/account-export.mjs').includes('tenant_inventory_import_batches'));



// v0.20 original-product parity bridge
for(const f of ['supabase/migrations/0019_ORIGINAL_PRODUCT_PARITY_BRIDGE.sql','staff-operations.html','inventory-reservation-calendar.html','netlify/functions/staff-operations.mjs','netlify/functions/inventory-operations.mjs','netlify/functions/questionnaire-tools.mjs','netlify/functions/quickbooks-webhook.mjs','netlify/functions/quickbooks-changes.mjs','netlify/functions/account-restore.mjs','docs/V0.20-ORIGINAL-PRODUCT-PARITY-BRIDGE.md'])check(`v0.20 exists ${f}`,exists(f));
const m19=read('supabase/migrations/0019_ORIGINAL_PRODUCT_PARITY_BRIDGE.sql');
for(const c of ['service_fee','client_decor_budget','tenant_staff_availability','tenant_event_expenses','tenant_inventory_movements','tenant_quickbooks_changes','tenant_restore_runs','shared_editable'])check(`v0.20 capability ${c}`,m19.includes(c));
check('staff operations synchronizes labor expenses',read('netlify/functions/staff-operations.mjs').includes('tenant_event_expenses')&&read('netlify/functions/staff-operations.mjs').includes('planned_hours'));
check('staff operations checks conflicts',read('netlify/functions/staff-operations.mjs').includes('conflict')&&read('staff-operations.html').includes('override'));
check('inventory operations preserve movement history',read('netlify/functions/inventory-operations.mjs').includes('tenant_inventory_movements')&&read('event-inventory.html').includes('Return'));
check('inventory reservation calendar exists',read('inventory-reservation-calendar.html').includes('Reservation Calendar'));
check('questionnaire analysis creates planning checklist',read('netlify/functions/questionnaire-tools.mjs').includes('create-plan')&&read('questionnaires.html').includes('Create Plan'));
check('floor plans support multiple layout operations',read('netlify/functions/floorplans.mjs').includes("action==='duplicate'")&&read('floorplan.html').includes('+ New layout')&&read('floorplan.html').includes('Rename')&&read('floorplan.html').includes('Delete'));
check('client can update shared floorplan objects',read('netlify/functions/client-portal.mjs').includes("d.action==='floorplan-object-update'")&&read('portal.html').includes('Save layout changes'));
check('event finances separate service fee and decor allowance',read('financials.html').includes('Service Fee')&&read('financials.html').includes('Decor Allowance')&&read('netlify/functions/financials.mjs').includes('estimated_service_profit'));
check('event book has three packet modes',read('event-book.html').includes('Staff Production Book')&&read('event-book.html').includes('Vendor Packet')&&read('event-book.html').includes('Client Final Details'));
check('safe restore includes dry run and confirmation phrase',read('netlify/functions/account-restore.mjs').includes('RESTORE CELEBRATION DATA')&&read('backup.html').includes('Dry-run'));
check('QuickBooks webhook is signed and review first',read('netlify/functions/quickbooks-webhook.mjs').includes('QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN')&&read('netlify/functions/quickbooks-changes.mjs').includes("status:'reviewed'"));
check('QuickBooks customer apply uses full_name',read('netlify/functions/quickbooks-changes.mjs').includes('full_name:snap.DisplayName'));
check('support UI can update status and resolution',read('support.html').includes('Save update')&&read('support.html').includes('Waiting on user'));
check('support backend sends followup notifications',read('netlify/functions/support.mjs').includes('SUPPORT_NOTIFICATION_EMAIL')&&read('netlify/functions/support.mjs').includes('resolved'));
check('original event workspace route is compatible',read('event-workspace.html').includes('event.html'));
check('original financial admin route is compatible',read('financials-admin.html').includes('financials.html'));
check('export includes parity operational tables',read('netlify/functions/account-export.mjs').includes('tenant_inventory_movements')&&read('netlify/functions/account-export.mjs').includes('tenant_staff_availability')&&read('netlify/functions/account-export.mjs').includes('tenant_event_expenses'));


// v0.21 deep operations + workspace parity
for(const f of ['supabase/migrations/0020_DEEP_OPERATIONS_WORKSPACE_PARITY.sql','vendor-operations.html','netlify/functions/vendor-operations.mjs','manifest.webmanifest','sw.js','offline.html','docs/V0.21-DEEP-OPERATIONS-WORKSPACE-PARITY.md'])check(`v0.21 exists ${f}`,exists(f));
const m20=read('supabase/migrations/0020_DEEP_OPERATIONS_WORKSPACE_PARITY.sql');
check('vendor operations schema exists',m20.includes('tenant_vendor_operations')&&m20.includes('scheduled_arrival')&&m20.includes('checked_in_at'));
check('event emergency contacts schema exists',m20.includes('tenant_event_emergency_contacts'));
check('vendor operations supports checkin and checkout',read('netlify/functions/vendor-operations.mjs').includes("d.action==='checkin'")&&read('netlify/functions/vendor-operations.mjs').includes("d.action==='checkout'"));
check('event day consumes vendor operations',read('netlify/functions/event-day.mjs').includes('tenant_vendor_operations')&&read('event-day.html').includes('Vendor Arrivals'));
check('event book has BEO packet',read('event-book.html').includes('BEO / Function Sheet')&&read('event-book.html').includes('Food / Beverage Notes'));
check('workspace timeline has calendar mode',read('event.html').includes("timelineView==='calendar'")&&read('event.html').includes('downloadEventIcs'));
check('PWA shell exists',read('assets/app.js').includes("serviceWorker.register('/sw.js')")&&read('manifest.webmanifest').includes('standalone'));
check('export includes vendor operations',read('netlify/functions/account-export.mjs').includes('tenant_vendor_operations')&&read('netlify/functions/account-export.mjs').includes('tenant_event_emergency_contacts'));


check('v0.23 migration exists',exists('supabase/migrations/0021_ORIGINAL_CORE_WORKFLOW_CLONE.sql'));
check('v0.23 inventory add form is inline',read('inventory.html').includes('Add inventory item')&&read('inventory.html').includes('Automatically reserve from floor plan'));
check('v0.23 inventory save creates QR-ready record',read('netlify/functions/inventory.mjs').includes('autoSku')&&read('netlify/functions/inventory.mjs').includes('qr_code:qrcode'));
check('v0.23 floorplan syncs linked inventory',exists('netlify/functions/floorplan-inventory-sync.mjs')&&read('floorplan.html').includes('floorplan-inventory-sync'));
check('v0.23 floorplan matches original save/share model',read('floorplan.html').includes('Save + Share')&&read('floorplan.html').includes('Print / PDF')&&read('floorplan.html').includes('Measure distance'));

const fp22=read('floorplan.html');
check('v0.22 floorplan removes duplicate start-here sections',(fp22.match(/Start here/g)||[]).length<=1);
check('v0.22 floorplan has pro catalog',fp22.includes('Decor & Floral')&&fp22.includes('Outdoor & Specialty')&&fp22.includes('Guest Experience'));
check('v0.23 removes non-original starter-template behavior',!read('floorplan.html').includes('Starter layout'));
check('v0.23 restores original category accordion library',read('floorplan.html').includes('<details')&&read('floorplan.html').includes('palette-grid'));
check('v0.23 floorplan has original snap-to-grid control',read('floorplan.html').includes('snapToggle')&&read('floorplan.html').includes('Snap to grid'));
console.log(`\n${pass} checks passed, ${fail} failed`);
if(fail)process.exit(1);
