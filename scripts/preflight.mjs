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
check('inventory enforces same-date availability',read('netlify/functions/inventory.mjs').includes('Only ${Math.max(0,Number(item.quantity||0)-used)} available for that event date.'));check('public RSVP tokenized',read('netlify/functions/rsvp-public.mjs').includes('client_portal_token=eq.'));check('public approval tokenized',read('netlify/functions/approval-public.mjs').includes('public_token=eq.'));check('public registration tokenized',read('netlify/functions/registration-public.mjs').includes('public_token=eq.'));check('paid registration uses tenant Stripe',read('netlify/functions/registration-public.mjs').includes('kind=eq.stripe'));check('paid registration verifies tenant metadata',read('netlify/functions/registration-verify.mjs').includes("metadata?.tenant_id!==reg.tenant_id"));check('event day tenant scoped',read('netlify/functions/event-day.mjs').includes('event_id=eq.${encodeURIComponent(eventId)}'));
const settings=read('netlify/functions/tenant-settings.mjs');check('integration credentials encrypted',settings.includes('encrypt(JSON.stringify'));const env=read('.env.example');check('separate secrets documented',env.includes('INTEGRATION_ENCRYPTION_KEY')&&env.includes('PLATFORM_ADMIN_KEY'));
const htmls=fs.readdirSync(root).filter(x=>x.endsWith('.html'));const all=htmls.map(x=>read(x)).join('\n');const tenantFacing=['app.html','event.html','portal.html','proposal-public.html','contract-public.html','rsvp-public.html','approval-public.html','registration-public.html','staff-invite.html'];const tenantFacingText=tenantFacing.map(x=>read(x)).join('\n');check('Sage seller branding stays out of tenant-facing white-label pages',!/(Sage\s*&\s*Celebration|sageandcelebration|702-827-7340)/i.test(tenantFacingText));check('Celebration Suite seller identity present',/Celebration Suite/.test(read('index.html'))&&/Sage\s*&amp;\s*Celebration LLC/.test(read('index.html')));check('dashboard links advanced tools',v3pages.filter(x=>!x.includes('public')).slice(0,8).every(x=>read('app.html').includes('/'+x)));check('event workspace links event day',read('event.html').includes('/event-day.html?event_id='));check('floor plan supports dragging',read('floorplan.html').includes('onpointermove')&&read('floorplan.html').includes('floorplans'));check('guest page shares RSVP link',read('guests.html').includes('/rsvp-public.html?token='));check('registration page shares public link',read('registration.html').includes('/registration-public.html?token='));check('event day supports guest and registration check-in',read('event-day.html').includes("checkin('guest'")&&read('event-day.html').includes("checkin('registration'"));

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
check('dashboard links team',read('app.html').includes('/team.html'));check('dashboard links labor',read('app.html').includes('/time-tracking.html'));check('dashboard links automations',read('app.html').includes('/automations.html'));check('dashboard links closeouts',read('app.html').includes('/closeouts.html'));check('event workspace links labor',read('event.html').includes('/time-tracking.html?event_id='));check('event checklist stores parseable due date',read('event.html').includes('obj.due_date=m[0]'));


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
check('annual renewal preserves remaining term',read('netlify/functions/checkout-activate.mjs').includes('currentEnd>now'));
check('marketplace fulfillment creates license code',read('netlify/functions/marketplace-order.mjs').includes('license_codes')&&read('netlify/functions/marketplace-order.mjs').includes('activation_url'));
check('marketplace fulfillment is admin protected',read('netlify/functions/marketplace-order.mjs').includes('x-platform-admin-key'));
check('direct Stripe purchases recorded as platform orders',read('netlify/functions/checkout-activate.mjs').includes("source:'stripe'")&&read('netlify/functions/checkout-activate.mjs').includes('platform_orders'));
check('redeemed marketplace order links tenant',read('netlify/functions/redeem-license.mjs').includes('platform_orders?license_code_id=eq.'));
check('public demo is read only',read('demo.html').includes('Read-only demo')&&!read('demo.html').includes('WLP.api('));
check('seller console includes marketplace fulfillment',read('platform-admin.html').includes('Fulfill Marketplace Order')&&read('platform-admin.html').includes('marketplace-order'));
check('dashboard links setup and billing',read('app.html').includes('/onboarding.html')&&read('app.html').includes('/billing.html'));



// v0.6 monthly billing + unified authentication
const v6files=['supabase/migrations/0006_MONTHLY_BILLING_AND_UNIFIED_AUTH.sql','platform-login.html','client-login.html','netlify/functions/_oauth.mjs','netlify/functions/google-auth-start.mjs','netlify/functions/google-auth-callback.mjs','netlify/functions/platform-auth-login.mjs','netlify/functions/platform-auth-bootstrap.mjs','netlify/functions/platform-auth-session.mjs','netlify/functions/client-auth-login.mjs','netlify/functions/client-auth-setup.mjs','netlify/functions/client-auth-session.mjs','netlify/functions/stripe-webhook.mjs','netlify/functions/billing-portal.mjs'];
for(const f of v6files)check(`v0.6 exists ${f}`,exists(f));
const m6=read('supabase/migrations/0006_MONTHLY_BILLING_AND_UNIFIED_AUTH.sql');
check('monthly unlimited plan added',m6.includes("'monthly_unlimited'"));
check('monthly billing stores subscription id',m6.includes('stripe_subscription_id'));
check('billing recovery fields exist',m6.includes('past_due_at')&&m6.includes('grace_until'));
check('billing suspension tenant state exists',m6.includes('billing_suspended'));
check('client account tables exist',m6.includes('tenant_client_users')&&m6.includes('tenant_client_event_access'));
check('monthly checkout uses subscription mode',read('netlify/functions/checkout-create.mjs').includes("plan==='monthly_unlimited'?'subscription':'payment'"));
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

console.log(`\n${pass} checks passed, ${fail} failed`);if(fail)process.exit(1);
