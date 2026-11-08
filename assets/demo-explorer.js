(() => {
  'use strict';

  const modules = [
    { id:'dashboard', icon:'⌂', label:'Command center', group:'Start here', title:'Planner Command Center', subtitle:'See the business and every event at a glance.', tour:'See events, leads, balances and attention items from one executive view.' },
    { id:'crm', icon:'◇', label:'CRM & sales', group:'Business', title:'CRM & Lead Pipeline', subtitle:'Capture inquiries and move opportunities from first contact to booked.', tour:'Move a sample lead through the pipeline and see the sales workflow.' },
    { id:'commerce', icon:'◈', label:'Booking & rentals', group:'Business', title:'Instant Booking & Decor Rentals', subtitle:'Sell packages and rent owned inventory without a separate storefront.', tour:'Preview instant-book packages, add-ons, rental availability and checkout recovery.' },
    { id:'workspace', icon:'✦', label:'Event workspace', group:'Planning', title:'Unified Event Workspace', subtitle:'One event hub for planning, client work and operations.', tour:'Switch between Guided and Professional modes inside the same event.' },
    { id:'client', icon:'◎', label:'Client portal', group:'Planning', title:'White-Label Client Portal', subtitle:'A branded client experience connected to planner operations.', tour:'Click through approvals, payments, files, messages and client-facing planning.' },
    { id:'design', icon:'✧', label:'Inspiration board', group:'Design', title:'Inspiration Board & Approvals', subtitle:'A collaborative visual board connected to inventory and client decisions.', tour:'Select, move and approve sample inspiration while seeing the inventory connection.' },
    { id:'floorplan', icon:'▦', label:'Floor plan + seating', group:'Design', title:'True-Scale Floor Plan & Seating', subtitle:'Physical-size furniture connected to the real guest list.', tour:'Select tables and assign sample guests while keeping the room in view.' },
    { id:'invitations', icon:'▧', label:'Invites & QR RSVP', group:'Guest experience', title:'Virtual Invitations & QR RSVP', subtitle:'Branded invitations, RSVP choices and printable QR access.', tour:'Preview the invitation, QR entry point, meal choices and personalized RSVP flow.' },
    { id:'guestphotos', icon:'▤', label:'Guest photo QR', group:'Guest experience', title:'Guest Photo QR Gallery', subtitle:'Guests scan, upload and create a private event keepsake gallery.', tour:'Walk through the wedding-day QR upload and the client download/print gallery.' },
    { id:'guests', icon:'♙', label:'Guest management', group:'Guest experience', title:'Guests, RSVP & QR Check-In', subtitle:'Invitations, meals, seating, attendance and check-in in one record.', tour:'Filter guests, inspect meal/table data and try a temporary QR-style check-in.' },
    { id:'ticketing', icon:'▣', label:'Tickets & registration', group:'Guest experience', title:'Ticket Sales & Registration', subtitle:'Paid/free admission with QR tickets and unified check-in.', tour:'Preview ticket types, promo codes, attendee QR passes and event-day scanning.' },
    { id:'inventory', icon:'▥', label:'Inventory & QR', group:'Operations', title:'Inventory, Rentals & QR Operations', subtitle:'Owned decor, reservations, labels, load-out and return tracking.', tour:'Search sample inventory, reserve an item and see QR operational controls.' },
    { id:'vendors', icon:'✺', label:'Vendor CRM', group:'Operations', title:'Vendor CRM & Operations', subtitle:'Contacts, quotes, files, ratings and event assignments.', tour:'Inspect a rich vendor record with compliance and performance details.' },
    { id:'documents', icon:'▱', label:'Documents', group:'Collaboration', title:'Document Vault & Sharing', subtitle:'Secure planner/client files, versions and event-specific access.', tour:'Open a sample shared-file workflow and see client/planner visibility.' },
    { id:'questionnaires', icon:'☷', label:'Forms & approvals', group:'Collaboration', title:'Questionnaires, Forms & Approvals', subtitle:'Intake, drafts, approvals and decision history in one workflow.', tour:'Answer a sample intake question and preview approval tracking.' },
    { id:'financials', icon:'$', label:'Financials', group:'Business', title:'Financials & Client Payments', subtitle:'Invoices, schedules, balances, expenses and reconciliation.', tour:'Simulate a payment status change without touching real money.' },
    { id:'communications', icon:'✉', label:'Communications', group:'Business', title:'Communications Center', subtitle:'Event, lead and partner conversations in context.', tour:'Open a sample thread and draft a reply without sending.' },
    { id:'automation', icon:'↻', label:'Automations', group:'Platform', title:'Automations & Integrations', subtitle:'Reduce follow-up work while core systems stay connected.', tour:'Toggle sample automations and review connected services.' },
    { id:'branding', icon:'◐', label:'Branding & domains', group:'Platform', title:'White-Label Branding & Custom Domains', subtitle:'Planner logo, colors, client portal and custom-domain controls.', tour:'Preview a tenant brand change and the custom-domain workflow.' },
    { id:'reporting', icon:'▥', label:'Reports & admin', group:'Platform', title:'Reporting & Platform Control', subtitle:'Business analytics, logs, users, support and operational health.', tour:'Explore executive metrics and the admin observability layer.' },
    { id:'eventday', icon:'✓', label:'Event day', group:'Execute', title:'Event-Day Command Center', subtitle:'Run the event from one live operational view.', tour:'Check off a run-of-show milestone and see live execution context.' }
  ];

  const state = {
    active:'dashboard', visited:new Set(['dashboard']),
    plannerMode:'professional', workspaceTab:'overview', clientTab:'overview',
    inspoApproved:new Set([2]), selectedInspo:1,
    floorLayout:'reception', selectedTable:'t2',
    guestAssignments:{ 'Maya & Chris':'t2', 'Nina Patel':'t1', 'Marcus Lee':'t3' },
    checkedIn:new Set(['Nina Patel','Marcus Lee']),
    inventoryReserved:new Set(), vendorFavorite:true,
    invoiceStatus:'partial', draftedReply:'',
    automations:{ reminder:true, approval:true, review:false },
    runDone:new Set(['loadin','doors']), inviteRsvp:'pending', demoPhotoCount:18, questionnaireAnswered:false, brandPreview:'sage',
    leads:[
      {id:'l1',name:'Taylor Monroe',event:'40th Birthday',budget:'$3,500',stage:'new'},
      {id:'l2',name:'Morgan Rivera',event:'Wedding',budget:'$28,000',stage:'proposal'},
      {id:'l3',name:'BrightCo',event:'Corporate Retreat',budget:'$18,500',stage:'consult'},
      {id:'l4',name:'Avery Brooks',event:'Baby Shower',budget:'$2,800',stage:'new'}
    ]
  };

  const guestData = [
    {name:'Maya & Chris',party:2,rsvp:'Attending',meal:'Chicken / Vegetarian',table:'Table 2'},
    {name:'Nina Patel',party:1,rsvp:'Attending',meal:'Salmon',table:'Table 1'},
    {name:'Marcus Lee',party:1,rsvp:'Attending',meal:'Chicken',table:'Table 3'},
    {name:'The Johnson Family',party:4,rsvp:'Attending',meal:'Mixed',table:'Unassigned'},
    {name:'Elena Garcia',party:2,rsvp:'Pending',meal:'—',table:'Unassigned'},
    {name:'Andre Wilson',party:1,rsvp:'Declined',meal:'—',table:'—'},
    {name:'Lena & Priya',party:2,rsvp:'Attending',meal:'Vegetarian',table:'Unassigned'}
  ];

  const inventory = [
    {name:'Gold taper candle holders',cat:'Tabletop',qty:96,reserved:42,icon:'♜'},
    {name:'Ivory linen 120 in round',cat:'Linens',qty:28,reserved:18,icon:'◯'},
    {name:'Black metal arch 7.5 ft',cat:'Structures',qty:16,reserved:6,icon:'∩'},
    {name:'Clear cylinder vase 10 in',cat:'Vases',qty:80,reserved:48,icon:'▯'},
    {name:'White folding chair',cat:'Seating',qty:240,reserved:142,icon:'♧'},
    {name:'60 in round table',cat:'Tables',qty:24,reserved:14,icon:'●'},
    {name:'Champagne wall',cat:'Backdrops',qty:2,reserved:1,icon:'▦'},
    {name:'Battery fairy-light strand',cat:'Lighting',qty:60,reserved:32,icon:'✦'}
  ];

  const tableData = {
    t1:{name:'Table 1',capacity:8,seated:['Nina Patel'],style:'round',left:13,top:18,w:74,h:74},
    t2:{name:'Table 2',capacity:8,seated:['Maya & Chris'],style:'round',left:42,top:18,w:74,h:74},
    t3:{name:'Table 3',capacity:8,seated:['Marcus Lee'],style:'round',left:71,top:18,w:74,h:74},
    t4:{name:'Table 4',capacity:8,seated:[],style:'round',left:25,top:56,w:74,h:74},
    t5:{name:'Table 5',capacity:8,seated:[],style:'round',left:58,top:56,w:74,h:74},
    sweetheart:{name:'Sweetheart',capacity:2,seated:[],style:'rect',left:42,top:78,w:112,h:40}
  };

  const $ = (s,root=document) => root.querySelector(s);
  const $$ = (s,root=document) => [...root.querySelectorAll(s)];
  const esc = (v='') => String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  function toast(title, detail='Demo changes are temporary and reset when you refresh.') {
    const el=$('#demoToast'); if(!el) return;
    el.innerHTML=`${esc(title)}<small>${esc(detail)}</small>`;
    el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),2600);
  }

  function initNav(){
    const nav=$('#demoNav'); let group='';
    nav.innerHTML=modules.map(m=>{
      const label=m.group!==group?`<div class="demo-nav-label">${esc(m.group)}</div>`:''; group=m.group;
      return `${label}<button type="button" data-demo-module="${m.id}" class="${m.id===state.active?'active':''}"><span class="nav-ico">${m.icon}</span><span>${esc(m.label)}</span><span class="nav-check">✓</span></button>`;
    }).join('');
    $$('[data-demo-module]',nav).forEach(b=>b.addEventListener('click',()=>setModule(b.dataset.demoModule)));
  }

  function updateNav(){
    $$('[data-demo-module]').forEach(b=>{
      b.classList.toggle('active',b.dataset.demoModule===state.active);
      b.classList.toggle('visited',state.visited.has(b.dataset.demoModule));
    });
    const pct=Math.round((state.visited.size/modules.length)*100); $('#demoProgress').style.width=`${Math.max(8,pct)}%`;
  }

  function updateTour(){
    const i=modules.findIndex(m=>m.id===state.active); const m=modules[i];
    $('#tourStepLabel').textContent=`Recommended tour · Step ${i+1} of ${modules.length}`;
    $('#tourTitle').textContent=m.title;
    $('#tourText').textContent=m.tour;
    $('#tourPrev').disabled=i===0; $('#tourNext').textContent=i===modules.length-1?'Finish tour':'Next stop';
  }

  function setModule(id){
    const m=modules.find(x=>x.id===id); if(!m) return;
    state.active=id; state.visited.add(id); updateNav(); updateTour();
    $('#stageIcon').textContent=m.icon; $('#stageTitle').textContent=m.title; $('#stageSubtitle').textContent=m.subtitle;
    render();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function render(){
    const stage=$('#demoStage');
    const map={dashboard:dashboardView,crm:crmView,commerce:commerceView,workspace:workspaceView,client:clientView,invitations:invitationsView,design:designView,floorplan:floorplanView,guestphotos:guestPhotosView,guests:guestsView,ticketing:ticketingView,inventory:inventoryView,vendors:vendorsView,documents:documentsView,questionnaires:questionnairesView,financials:financialsView,communications:communicationsView,automation:automationView,branding:brandingView,reporting:reportingView,eventday:eventDayView};
    stage.innerHTML=(map[state.active]||dashboardView)(); bindView();
  }

  function dashboardView(){ return `
    <div class="demo-callout"><div><b>Sample tenant: Lumière Events</b><span>This workspace is populated so buyers can experience the product without creating anything.</span></div><span class="demo-chip dark">Professional workspace</span></div>
    <div class="demo-grid four" style="margin-top:14px">
      ${stat('Active events','8','3 need attention')}${stat('Open leads','14','$71k pipeline')}${stat('Outstanding','$7,450','Across 4 invoices')}${stat('Next 14 days','3 events','1 wedding · 2 corporate')}
    </div>
    <div class="demo-grid two" style="margin-top:14px">
      <div class="demo-card"><h3>Upcoming events</h3><div class="demo-list">
        ${eventRow('Jordan & Alex Wedding','Nov 14 · 142 guests','2 approvals pending','good')}
        ${eventRow('Acme Holiday Gala','Dec 5 · 280 guests','Vendor confirmations due','warn')}
        ${eventRow('Lena’s 40th','Dec 12 · 65 guests','Design approved','good')}
      </div></div>
      <div class="demo-card"><h3>Needs attention</h3><div class="demo-list">
        ${attention('Client approval','Jordan & Alex · centerpiece direction','Open design')}
        ${attention('Payment due','Acme · second installment due Friday','View invoice')}
        ${attention('Inventory gap','18 white chairs still need sourcing','Review gap')}
      </div></div>
    </div>
    <div class="demo-grid three" style="margin-top:14px">
      <div class="demo-card"><h3>Planning progress</h3><p>Jordan & Alex Wedding</p><div class="demo-progressbar" style="margin:14px 0 7px"><span style="width:78%"></span></div><p><b>78%</b> complete · 11 of 14 milestones</p></div>
      <div class="demo-card"><h3>Revenue forecast</h3><div class="demo-chart">${bar('Nov',78,'$18k')}${bar('Dec',92,'$24k')}${bar('Jan',54,'$12k')}</div></div>
      <div class="demo-card"><h3>Fast paths</h3><div class="demo-list"><button class="demo-button soft" data-jump="workspace">Open event workspace</button><button class="demo-button soft" data-jump="client">Preview client portal</button><button class="demo-button soft" data-jump="eventday">See Event Day</button></div></div>
    </div>`; }

  function crmView(){
    const stages=[['new','New inquiry'],['consult','Consultation'],['proposal','Proposal sent'],['booked','Booked']];
    return `<div class="demo-toolbar"><span class="demo-chip">Try it: move a lead forward</span><button class="demo-button" data-demo-action="reset-leads">Reset pipeline</button></div>
      <div class="demo-kanban">${stages.map(([id,label])=>`<div class="demo-kanban-col"><div class="demo-kanban-head"><span>${label}</span><span>${state.leads.filter(l=>l.stage===id).length}</span></div>${state.leads.filter(l=>l.stage===id).map(l=>leadCard(l,stages)).join('')||'<div class="demo-locknote">No sample leads here yet.</div>'}</div>`).join('')}</div>
      <div class="demo-grid three" style="margin-top:14px"><div class="demo-card"><h3>Lead intake</h3><p>Capture event date, type, budget, guest count, location, source and inquiry details.</p></div><div class="demo-card"><h3>Follow-up discipline</h3><p>Next follow-up, consultations, notes and communication history stay attached to the lead.</p></div><div class="demo-card"><h3>Convert without retyping</h3><p>Booked leads become client/event records while retaining sales context.</p></div></div>`;
  }

  function commerceView(){return `<div class="demo-grid two"><div class="demo-card"><h3>Instant-book packages</h3>${eventRow('Day-of Coordination','$1,250 · 30% deposit','Bookable','good')}${eventRow('Birthday Design + Setup','$799 · full payment','Bookable','good')}<div class="demo-row-actions" style="margin-top:10px"><button class="demo-button primary" data-demo-action="checkout-preview">Preview checkout</button></div></div><div class="demo-card"><h3>Decor rental storefront</h3><p>Rentable inventory respects event reservations and date-range availability.</p>${eventRow('Gold taper holders','42 available','Nov 12–15','')}${eventRow('Champagne wall','1 available','Nov 14','warn')}</div></div><div class="demo-grid three" style="margin-top:14px"><div class="demo-card"><h3>Abandoned checkout</h3><p>Two branded recovery reminders, then automatic expiration.</p></div><div class="demo-card"><h3>Capacity rules</h3><p>General events and exclusive wedding/corporate dates can use different daily limits.</p></div><div class="demo-card"><h3>Tenant Stripe</h3><p>Each planner connects their own payment account.</p></div></div>`}

  function invitationsView(){return `<div class="demo-grid two"><div class="demo-phone"><div class="demo-phone-top">Guest invitation preview</div><div class="demo-phone-body"><div class="demo-phone-brand"><b>Jordan & Alex</b><div>November 14 · Garden Terrace</div></div><div class="demo-phone-card"><b>You’re invited</b><p>Dinner, dancing and a very good reason to celebrate.</p></div><div class="demo-phone-card"><b>RSVP</b><p>Meal choice · dietary notes · plus-one · song request</p><button class="demo-button primary" data-demo-action="rsvp-demo">${state.inviteRsvp==='attending'?'RSVP saved ✓':'Try RSVP'}</button></div><div class="demo-qr-box"><span>▦</span><b>Invitation QR</b><small>Scan → branded RSVP page</small></div></div></div><div class="demo-card"><h3>One guest record, full journey</h3><div class="demo-list">${kv('Invitation','Personalized email + QR')}${kv('RSVP','Meal, dietary, plus-one')}${kv('Seating','Table + seat assignment')}${kv('Event day','Same record checks in')}${kv('Reporting','Attendance + responses')}</div><div class="demo-locknote" style="margin-top:12px"><b>Production:</b> each event can have its own colors, invitation content, meal choices and printable QR code.</div></div></div>`}

  function guestPhotosView(){return `<div class="demo-grid two"><div class="demo-card"><h3>Wedding-day QR upload</h3><div class="demo-qr-large"><span>▦</span><b>SCAN TO SHARE PHOTOS</b><small>Jordan & Alex · Lumière Events</small></div><div class="demo-row-actions" style="margin-top:12px"><button class="demo-button primary" data-demo-action="guest-photo-upload">Simulate guest upload</button><button class="demo-button" data-demo-action="guest-photo-copy">Copy QR link</button></div><p>Guests do not need an account. They scan, choose photos from their phone, add an optional name/caption, and upload.</p></div><div class="demo-card"><h3>Private client keepsake gallery</h3><div class="demo-photo-grid">${[1,2,3,4,5,6].map((n,i)=>`<div class="demo-photo-tile"><span>${['🥂','💃','✨','💐','📸','🎉'][i]}</span><small>${n<=2?'Pending review':'Approved'}</small></div>`).join('')}</div><div class="demo-grid three" style="margin-top:10px">${stat('Uploads',String(state.demoPhotoCount),'Guest photos')}${stat('Retention','2+ years','Minimum')}${stat('Client tools','3','View · Download · Print')}</div></div></div>`}

  function ticketingView(){return `<div class="demo-grid two"><div class="demo-card"><h3>Registration types</h3>${eventRow('General Admission','$125 · 180 capacity','126 sold','good')}${eventRow('VIP Sponsor Table','$1,500 · 12 tables','8 sold','')}${eventRow('Volunteer','Free · 25 capacity','19 issued','')}<button class="demo-button primary" data-demo-action="ticket-preview" style="margin-top:10px">Preview attendee QR</button></div><div class="demo-card"><h3>Unified check-in</h3><div class="demo-qr-box"><span>▦</span><b>CSTICKET · A7K4P2</b><small>One scanner handles RSVP guests and ticket holders</small></div>${stat('Checked in','87 / 126','Live attendance')}</div></div>`}

  function documentsView(){return `<div class="demo-grid two"><div class="demo-card"><h3>Shared event documents</h3><div class="demo-list">${doc('Signed planning agreement','PDF · client visible','View')}${doc('Venue floor plan','PDF · version 3','View')}${doc('Catering menu','PDF · expires Nov 10','View')}${doc('Photographer COI','PDF · vendor vault','Internal')}</div></div><div class="demo-card"><h3>Controlled sharing</h3><p>Planner and client uploads are stored securely, linked to the event, and opened through permission-checked signed URLs.</p><div class="demo-row-actions"><button class="demo-button primary" data-demo-action="document-open">Open sample document</button></div><div class="demo-locknote" style="margin-top:12px"><b>Also included:</b> document versions, vendor vault, expiration tracking and client-visible/internal access.</div></div></div>`}

  function questionnairesView(){return `<div class="demo-grid two"><div class="demo-card"><h3>Client questionnaire</h3><label class="demo-label">What feeling should the reception have?<textarea id="demoQuestion" class="demo-field" placeholder="Warm, candlelit, romantic…">${state.questionnaireAnswered?'Warm, candlelit and intimate with lots of movement.':''}</textarea></label><button class="demo-button primary" data-demo-action="question-save">Save demo answer</button><p class="demo-muted">Draft autosave and final submission are separate in production.</p></div><div class="demo-card"><h3>Approvals & decision history</h3>${attention('Centerpiece direction','Planner needs client decision','Open')}${activity('Nov 3','Ceremony backdrop approved')}${activity('Nov 2','Menu selection approved')}<p style="margin-top:10px">CSV questionnaire imports, reusable templates, client drafts and approvals all stay attached to the event.</p></div></div>`}

  function brandingView(){const sage=state.brandPreview==='sage';return `<div class="demo-grid two"><div class="demo-card"><h3>Tenant branding</h3><div class="demo-brand-preview ${sage?'sage':''}"><div class="demo-client-logo">${sage?'L':'M'}</div><div><b>${sage?'Lumière Events':'Midnight Social Co.'}</b><span>Client portal · invitations · emails · public pages</span></div></div><div class="demo-row-actions" style="margin-top:12px"><button class="demo-button ${sage?'primary':''}" data-demo-action="brand-toggle">Switch sample brand</button></div></div><div class="demo-card"><h3>Custom domain</h3><p><b>portal.lumiereevents.com</b></p><div class="demo-list">${kv('TXT verification','Verified')}${kv('SSL','Active')}${kv('Client login','White-labeled')}${kv('Business email','Tenant controlled')}</div></div></div>`}

  function reportingView(){return `<div class="demo-grid four">${stat('Revenue','$184k','YTD booked')}${stat('Conversion','31%','Lead → booked')}${stat('Avg event','$8,420','Contract value')}${stat('On-time tasks','94%','Planning health')}</div><div class="demo-grid two" style="margin-top:14px"><div class="demo-card"><h3>Business intelligence</h3><div class="demo-chart">${bar('Weddings',82,'$96k')}${bar('Corporate',61,'$52k')}${bar('Social',44,'$36k')}</div></div><div class="demo-card"><h3>Platform administration</h3><div class="demo-list">${kv('Users','12 active')}${kv('Support tickets','2 open')}${kv('Integration health','5 connected')}${kv('Error log','0 unresolved')}${kv('License health','Good')}</div></div></div>`}

  function workspaceView(){
    const tabs=['overview','checklist','timeline','approvals','messages'];
    return `<div class="demo-toolbar"><span class="demo-chip dark">Jordan & Alex Wedding</span><button class="demo-button ${state.plannerMode==='guided'?'primary':''}" data-mode="guided">Guided</button><button class="demo-button ${state.plannerMode==='professional'?'primary':''}" data-mode="professional">Professional</button><span class="demo-chip">${state.plannerMode==='guided'?'Simplified planning':'Full business + event operations'}</span></div>
      <div class="demo-grid four">${stat('Progress','78%','11/14 milestones')}${stat('Contract','$12,500','Signed')}${stat('Paid','$8,750','70% collected')}${stat('Guests','142','126 attending')}</div>
      <div class="demo-workspace-tabs" style="margin-top:14px">${tabs.map(t=>`<button data-workspace-tab="${t}" class="${state.workspaceTab===t?'active':''}">${cap(t)}</button>`).join('')}${state.plannerMode==='professional'?'<button data-workspace-tab="operations" class="'+(state.workspaceTab==='operations'?'active':'')+'">Operations</button>':''}</div>
      <div id="workspacePanel">${workspacePanel()}</div>`;
  }

  function workspacePanel(){
    if(state.workspaceTab==='checklist') return `<div class="demo-grid two"><div class="demo-card"><h3>Planning checklist</h3><div class="demo-list">${checkItem('Confirm final guest count',false,'Due Nov 6')}${checkItem('Approve linen quantities',true,'Completed Nov 2')}${checkItem('Finalize ceremony music',false,'Due Nov 8')}${checkItem('Send vendor load-in sheet',true,'Completed Nov 3')}</div></div><div class="demo-card"><h3>Guidance</h3><p>Guided mode explains what to do next. Professional mode exposes the deeper operational tools without changing event data.</p><div class="demo-locknote" style="margin-top:12px"><b>Demo guardrail:</b> checklist toggles are temporary.</div></div></div>`;
    if(state.workspaceTab==='timeline') return `<div class="demo-card"><h3>Planning timeline</h3><div class="demo-list">${timeline('9:00 AM','Venue access + rental delivery')}${timeline('10:30 AM','Design team begins tablescape setup')}${timeline('2:30 PM','Wedding party arrival')}${timeline('4:00 PM','Ceremony')}${timeline('5:00 PM','Cocktail hour')}${timeline('6:15 PM','Reception entrance')}</div></div>`;
    if(state.workspaceTab==='approvals') return `<div class="demo-grid two"><div class="demo-card"><h3>Pending client approvals</h3>${attention('Centerpiece direction','Warm candlelight + ivory runners','Open')}${attention('Welcome sign proof','Final typography proof','Open')}</div><div class="demo-card"><h3>Decision history</h3><p>Every approval stays attached to the event so planner and client know what was approved and when.</p></div></div>`;
    if(state.workspaceTab==='messages') return `<div class="demo-grid two"><div class="demo-card"><h3>Event conversation</h3><div class="demo-list"><div class="demo-row"><div><strong>Jordan</strong><span>Can we shift cocktail hour by 15 minutes?</span></div><span class="demo-chip">Client</span></div><div class="demo-row"><div><strong>Planner</strong><span>Yes — I’ll reflect that in the final run of show.</span></div><span class="demo-chip good">Sent</span></div></div></div><div class="demo-card"><h3>Context stays together</h3><p>Messages can be read from the event or the owner-wide Communications Center.</p></div></div>`;
    if(state.workspaceTab==='operations') return `<div class="demo-grid three"><div class="demo-card"><h3>Team</h3><p>4 staff scheduled · lead planner assigned.</p></div><div class="demo-card"><h3>Vendor operations</h3><p>8 vendors confirmed · 1 COI expiring soon.</p></div><div class="demo-card"><h3>Change orders</h3><p>1 approved · $425 added to contract.</p></div></div>`;
    return `<div class="demo-grid two"><div class="demo-card"><h3>Do this next</h3><div class="demo-callout"><div><b>Resolve two client decisions</b><span>Centerpieces and welcome-sign proof are blocking final purchasing.</span></div><button class="demo-button primary" data-workspace-tab="approvals">Review</button></div><div style="height:10px"></div><div class="demo-callout"><div><b>Finalize seating</b><span>18 attending guests are still unassigned.</span></div><button class="demo-button" data-jump="floorplan">Seating chart</button></div></div><div class="demo-card"><h3>Recent activity</h3><div class="demo-list">${activity('Nov 4 · 10:42 AM','Client approved ceremony backdrop')}${activity('Nov 4 · 9:18 AM','Invoice payment received · $2,500')}${activity('Nov 3 · 6:05 PM','Floor plan “Reception Final” saved')}</div></div></div>`;
  }

  function clientView(){
    const tabs=['overview','approvals','documents','guest photos','payments','messages'];
    return `<div class="demo-callout"><div><b>White-label experience</b><span>The planner’s logo, business name and colors carry into the client portal. Celebration Suite stays in the background.</span></div><span class="demo-chip pink">Client view</span></div><div class="demo-client-shell" style="margin-top:14px"><div class="demo-client-head"><div class="demo-client-brand"><div class="demo-client-logo">L</div><div><b>Lumière Events</b><div style="font-size:9px;color:#e1d8e4">Jordan & Alex Wedding</div></div></div><span class="demo-chip good">Updated today</span></div><div class="demo-client-nav">${tabs.map(t=>`<button data-client-tab="${t}" class="${state.clientTab===t?'active':''}">${cap(t)}</button>`).join('')}</div><div class="demo-client-body">${clientPanel()}</div></div>`;
  }
  function clientPanel(){
    if(state.clientTab==='approvals') return `<div class="demo-grid two"><div class="demo-card"><h3>Centerpiece direction</h3><p>Ivory runner · mixed-height candles · clear cylinders · no florals.</p><div class="demo-row-actions" style="margin-top:12px"><button class="demo-button primary" data-demo-action="client-approve">Approve sample</button><button class="demo-button">Request change</button></div></div><div class="demo-card"><h3>Welcome sign proof</h3><p>Waiting for final approval before print.</p><span class="demo-chip warn">Decision needed</span></div></div>`;
    if(state.clientTab==='documents') return `<div class="demo-list">${doc('Signed planning agreement','PDF · signed Oct 12','Signed')}${doc('Venue floor plan','PDF · uploaded Oct 28','Shared')}${doc('Final menu','PDF · uploaded Nov 2','Shared')}</div>`;
    if(state.clientTab==='guest photos') return `<div class="demo-callout"><div><b>Private guest photo gallery</b><span>Approved wedding-day uploads remain available to the client for at least two years.</span></div><span class="demo-chip good">18 photos</span></div><div class="demo-photo-grid" style="margin-top:12px">${[1,2,3,4,5,6].map((n,i)=>`<div class="demo-photo-tile"><span>${['🥂','💃','✨','💐','📸','🎉'][i]}</span><small>Guest upload ${n}</small></div>`).join('')}</div><div class="demo-row-actions" style="margin-top:12px"><button class="demo-button primary" data-demo-action="photo-download">Download sample</button><button class="demo-button" data-demo-action="photo-print">Print sample</button></div>`;
    if(state.clientTab==='payments') return `<div class="demo-grid three">${stat('Contract','$12,500','Total')}${stat('Paid','$8,750','70%')}${stat('Remaining','$3,750','Due Nov 14')}</div><div class="demo-card" style="margin-top:12px"><h3>Payment schedule</h3>${invoiceRow('Deposit','Paid','$5,000')}${invoiceRow('Second installment','Paid','$3,750')}${invoiceRow('Final balance','Upcoming','$3,750')}</div>`;
    if(state.clientTab==='messages') return `<div class="demo-card"><h3>Message your planner</h3><div class="demo-list"><div class="demo-row"><div><strong>Planner</strong><span>Your updated reception floor plan is ready for review.</span></div></div><div class="demo-row"><div><strong>You</strong><span>Perfect — the new table spacing looks much better.</span></div></div></div><div class="demo-locknote" style="margin-top:12px"><b>Demo guardrail:</b> messaging is preview-only here.</div></div>`;
    return `<div class="demo-grid four">${stat('Progress','78%','Planning')}${stat('Open tasks','3','Client actions')}${stat('Approvals','2','Need review')}${stat('Balance','$3,750','Remaining')}</div><div class="demo-grid two" style="margin-top:12px"><div class="demo-card"><h3>Do this next</h3><p>Review the centerpiece direction before purchasing is finalized.</p><button class="demo-button primary" data-client-tab="approvals" style="margin-top:10px">Review approval</button></div><div class="demo-card"><h3>Upcoming</h3><p>Final venue walkthrough · Nov 9 at 3:00 PM</p></div></div>`;
  }

  function designView(){
    const cards=[['Candlelight tablescape','Taper candles + ivory runner','🕯'],['Modern welcome moment','Layered signage + soft lighting','✦'],['Champagne escort display','Interactive guest arrival feature','🥂']];
    return `<div class="demo-toolbar"><span class="demo-chip">Try it: select an image, then approve it</span><button class="demo-button" data-demo-action="approve-inspo">Approve selected</button></div><div class="demo-gallery">${cards.map((c,i)=>`<div class="demo-inspo ${state.selectedInspo===i?'selected':''}" data-inspo="${i}">${state.inspoApproved.has(i)?'<span class="approved">APPROVED</span>':''}<div class="demo-inspo-art">${c[2]}</div><div class="demo-inspo-copy"><b>${c[0]}</b><span>${c[1]}</span></div></div>`).join('')}</div><div class="demo-grid two" style="margin-top:14px"><div class="demo-card"><h3>Inventory-aware design</h3><p>Planners can pull real inventory—with photos and quantities—onto the design board and reserve approved items for the event.</p></div><div class="demo-card"><h3>Client decisions</h3><p>Approvals and requested changes flow between the planner and branded client portal.</p></div></div>`;
  }

  function floorplanView(){
    const selected=tableData[state.selectedTable];
    const unseated=guestData.filter(g=>g.rsvp==='Attending'&&!state.guestAssignments[g.name]);
    return `<div class="demo-toolbar"><span class="demo-chip dark">Reception Final</span><span class="demo-chip">True-scale sample · 36 ft × 24 ft</span><button class="demo-button ${state.floorLayout==='reception'?'primary':''}" data-layout="reception">Reception</button><button class="demo-button ${state.floorLayout==='ceremony'?'primary':''}" data-layout="ceremony">Ceremony</button></div>
      ${state.floorLayout==='ceremony'?ceremonyFloor():`<div class="demo-floor-wrap"><div class="demo-floor">${Object.entries(tableData).map(([id,t])=>`<div class="demo-table ${t.style} ${state.selectedTable===id?'selected':''}" data-table="${id}" style="left:${t.left}%;top:${t.top}%;width:${t.w}px;height:${t.h}px;transform:translate(-50%,-50%)"><div>${t.name}<small>${tableOccupancy(id)}/${t.capacity} seated</small></div></div>`).join('')}</div><div class="demo-floor-side"><div class="demo-card"><h3>${selected.name}</h3><p>${tableOccupancy(state.selectedTable)} of ${selected.capacity} seats used.</p><div class="demo-guest-pool" style="margin-top:10px">${unseated.length?unseated.map(g=>`<div class="demo-guest"><b>${g.name}</b><span>${g.party} seat${g.party>1?'s':''}</span><button class="demo-button" data-assign-guest="${esc(g.name)}" style="margin-top:6px;width:100%">Assign here</button></div>`).join(''):'<div class="demo-locknote">All attending sample guests are seated.</div>'}</div></div><div class="demo-locknote"><b>Demo guardrail:</b> you can inspect tables and assign a few sample guests, but the demo does not let you add, resize or drag furniture. Full floor-plan editing is available inside a real account.</div></div></div>`}
      <div class="demo-grid three" style="margin-top:14px"><div class="demo-card"><h3>Physical scale</h3><p>Room dimensions, tables, specialty shapes, chairs and spacing use real-world measurements.</p></div><div class="demo-card"><h3>Guest-list seating</h3><p>Assignments sync back to Guest Management and can include party size and seat labels.</p></div><div class="demo-card"><h3>Floor-plan-only PDF</h3><p>Print/PDF outputs the active plan and seating legend—not the application chrome.</p></div></div>`;
  }

  function ceremonyFloor(){ return `<div class="demo-floor-wrap"><div class="demo-floor"><div class="demo-table rect" style="left:50%;top:15%;width:115px;height:30px;transform:translate(-50%,-50%)"><div>Ceremony arch<small>7.5 ft</small></div></div>${[25,36,47,58,69,80].map((y,ri)=>[35,65].map(x=>`<div class="demo-table rect" style="left:${x}%;top:${y}%;width:120px;height:22px;transform:translate(-50%,-50%)"><div>Chair row ${ri*2+(x===35?1:2)}<small>8 seats</small></div></div>`).join('')).join('')}</div><div class="demo-floor-side"><div class="demo-card"><h3>Ceremony layout</h3><p>48 guest chairs shown in sample rows with a centered aisle.</p></div><div class="demo-locknote"><b>Explore, don’t build:</b> the demo intentionally limits editing while still showing how the finished planning surface behaves.</div></div></div>`; }

  function guestsView(){
    return `<div class="demo-toolbar"><input id="guestSearch" placeholder="Search sample guests"><select id="guestFilter"><option>All RSVP</option><option>Attending</option><option>Pending</option><option>Declined</option></select><span class="demo-chip">126 attending · 18 unseated</span></div><div class="demo-card"><div class="table-wrap"><table class="demo-table-list"><thead><tr><th>Guest / household</th><th>Party</th><th>RSVP</th><th>Meal</th><th>Table</th><th>Event day</th></tr></thead><tbody id="guestRows">${guestRows(guestData)}</tbody></table></div></div><div class="demo-grid three" style="margin-top:14px"><div class="demo-card"><h3>Invitation workflow</h3><p>Email invitations, virtual event pages and RSVP collection can be tied to the same guest record.</p></div><div class="demo-card"><h3>QR check-in</h3><p>Each guest can receive a QR code for faster event-day arrival.</p></div><div class="demo-card"><h3>Meal + seating</h3><p>Meal choices, household counts and floor-plan assignments stay connected.</p></div></div>`;
  }

  function inventoryView(){
    return `<div class="demo-toolbar"><input id="inventorySearch" placeholder="Search sample inventory"><select id="inventoryFilter"><option>All categories</option>${[...new Set(inventory.map(x=>x.cat))].map(c=>`<option>${c}</option>`).join('')}</select><span class="demo-chip">8 sample items</span></div><div class="demo-inventory-grid" id="inventoryGrid">${inventoryCards(inventory)}</div><div class="demo-grid three" style="margin-top:14px"><div class="demo-card"><h3>Reservations</h3><p>Approved event inventory can reserve against the event date to prevent double-booking.</p></div><div class="demo-card"><h3>QR operations</h3><p>Scan items for storage, packing, check-out, return condition and missing-item alerts.</p></div><div class="demo-card"><h3>Rental storefront</h3><p>Rentable inventory can be exposed on a public storefront with availability checks.</p></div></div>`;
  }

  function vendorsView(){ return `<div class="demo-grid two"><div class="demo-card"><h3>Silverline Photography</h3><div class="demo-list">${kv('Category','Photography')}${kv('Primary contact','Joni Carter')}${kv('Phone','(702) 555-0142')}${kv('Typical investment','$2,800–$4,500')}${kv('Minimum spend','$2,500')}${kv('Referral terms','10% partner referral')}${kv('COI','Valid through May 2027')}</div><div class="demo-row-actions" style="margin-top:12px"><button class="demo-button ${state.vendorFavorite?'primary':''}" data-demo-action="vendor-favorite">${state.vendorFavorite?'Preferred vendor ✓':'Mark preferred'}</button><button class="demo-button">View sample documents</button></div></div><div class="demo-card"><h3>Performance snapshot</h3><div class="demo-grid two">${rating('Communication','4.9')}${rating('Reliability','5.0')}${rating('Quality','4.8')}${rating('Value','4.6')}</div><div style="height:12px"></div><h3>Assigned events</h3><div class="demo-list">${eventRow('Jordan & Alex Wedding','Nov 14','Confirmed','good')}${eventRow('Acme Holiday Gala','Dec 5','Quote requested','warn')}</div></div></div><div class="demo-grid three" style="margin-top:14px"><div class="demo-card"><h3>Quotes</h3><p>Compare quotes and keep decisions attached to the vendor record.</p></div><div class="demo-card"><h3>Document vault</h3><p>W-9s, COIs, contracts and vendor files can be monitored for completeness and expiration.</p></div><div class="demo-card"><h3>Preferred network</h3><p>Build a reliable partner directory instead of searching old email threads.</p></div></div>`; }

  function financialsView(){
    return `<div class="demo-grid four">${stat('Contract','$12,500','Jordan & Alex')}${stat('Collected','$8,750','70%')}${stat('Expenses','$4,180','Committed + paid')}${stat('Forecast margin','$5,420','43%')}</div><div class="demo-grid two" style="margin-top:14px"><div class="demo-card"><h3>Invoice schedule</h3>${invoiceRow('Deposit','Paid','$5,000')}${invoiceRow('Second installment',state.invoiceStatus==='paid'?'Paid':'Partial','$3,750')}${invoiceRow('Final balance','Upcoming','$3,750')}<button class="demo-button primary" data-demo-action="simulate-payment" style="margin-top:12px">${state.invoiceStatus==='paid'?'Reset payment preview':'Simulate payment received'}</button></div><div class="demo-card"><h3>Event budget</h3><div class="demo-chart">${bar('Venue',72,'$4,200')}${bar('Catering',88,'$5,100')}${bar('Design',56,'$3,250')}${bar('Photo',44,'$2,550')}</div><p style="margin-top:12px">Budget vs. committed spend can be reviewed without leaving the event workspace.</p></div></div>`;
  }

  function communicationsView(){ return `<div class="demo-grid two"><div class="demo-card"><h3>Unified inbox</h3><div class="demo-list"><button class="demo-row" data-demo-action="open-thread" style="text-align:left;cursor:pointer"><div class="demo-row-main"><strong>Jordan & Alex · Client</strong><span>Can we shift cocktail hour by 15 minutes?</span></div><span class="demo-chip good">Email</span></button><button class="demo-row" style="text-align:left"><div class="demo-row-main"><strong>Silverline Photography</strong><span>Updated certificate of insurance attached.</span></div><span class="demo-chip">Vendor</span></button><button class="demo-row" style="text-align:left"><div class="demo-row-main"><strong>Taylor Monroe</strong><span>Thanks — Friday at 2 PM works for our consultation.</span></div><span class="demo-chip pink">Lead</span></button></div></div><div class="demo-card"><h3>Draft reply</h3><textarea id="demoReply" class="demo-field" style="width:100%;min-height:130px;resize:vertical" placeholder="Try drafting a reply…">${esc(state.draftedReply)}</textarea><div class="demo-row-actions" style="margin-top:8px"><button class="demo-button primary" data-demo-action="draft-save">Save demo draft</button><button class="demo-button" data-demo-action="fake-send">Send disabled in demo</button></div><div class="demo-locknote" style="margin-top:10px"><b>Production behavior:</b> Celebration Suite can connect event, lead and referral-partner communication history while keeping tenant messaging credentials separate.</div></div></div>`; }

  function automationView(){
    const auto=(id,title,desc)=>`<div class="demo-row"><div class="demo-row-main"><strong>${title}</strong><span>${desc}</span></div><button class="demo-button ${state.automations[id]?'primary':''}" data-automation="${id}">${state.automations[id]?'On':'Off'}</button></div>`;
    return `<div class="demo-grid two"><div class="demo-card"><h3>Workflow automations</h3><div class="demo-list">${auto('reminder','Payment reminder','Send a branded reminder before an invoice becomes overdue.')}${auto('approval','Approval follow-up','Nudge clients when a design decision is blocking the plan.')}${auto('review','Post-event review request','Send a review/referral request after event closeout.')}</div></div><div class="demo-card"><h3>Connected services</h3><div class="demo-integration-grid">${integration('S','Stripe','Payments + subscriptions')}${integration('G','Google Calendar','Two-way availability')}${integration('Q','QuickBooks','Accounting sync')}${integration('T','Telnyx','SMS communications')}${integration('R','Resend / SMTP','Branded email')}${integration('D','Custom domain','White-label portal')}</div></div></div>`;
  }

  function eventDayView(){
    const steps=[['loadin','9:00 AM','Venue access + rentals received'],['doors','3:30 PM','Guest arrival team in position'],['ceremony','4:00 PM','Ceremony begins'],['cocktail','5:00 PM','Cocktail hour opens'],['reception','6:15 PM','Reception entrance'],['close','11:00 PM','Vendor strike + inventory check-in']];
    return `<div class="demo-grid four">${stat('Guests checked in','87 / 126','69%')}${stat('Staff on shift','4','All confirmed')}${stat('Open issues','1','Low severity')}${stat('Next milestone','4:00 PM','Ceremony')}</div><div class="demo-grid two" style="margin-top:14px"><div class="demo-card"><h3>Live run of show</h3><div class="demo-list">${steps.map(([id,time,title])=>`<div class="demo-row"><div class="demo-row-main"><strong>${time} · ${title}</strong><span>${state.runDone.has(id)?'Completed':'Upcoming / ready'}</span></div><button class="demo-button ${state.runDone.has(id)?'primary':''}" data-run="${id}">${state.runDone.has(id)?'Done ✓':'Mark done'}</button></div>`).join('')}</div></div><div class="demo-card"><h3>Operational command</h3><div class="demo-list">${attention('Guest issue','One dietary accommodation needs catering confirmation','Open')}${activity('3:18 PM','Photography team checked in')}${activity('2:54 PM','Ceremony chairs verified · 148')}</div><div class="demo-locknote" style="margin-top:12px"><b>Event closeout:</b> after the event, teams can reconcile inventory, documents, payments, notes and follow-up work.</div></div></div>`;
  }

  function bindView(){
    $$('[data-jump]').forEach(b=>b.addEventListener('click',()=>setModule(b.dataset.jump)));
    $$('[data-mode]').forEach(b=>b.addEventListener('click',()=>{state.plannerMode=b.dataset.mode;if(state.plannerMode==='guided'&&state.workspaceTab==='operations')state.workspaceTab='overview';render();toast(`${cap(state.plannerMode)} workspace preview`);}));
    $$('[data-workspace-tab]').forEach(b=>b.addEventListener('click',()=>{state.workspaceTab=b.dataset.workspaceTab;render();}));
    $$('[data-client-tab]').forEach(b=>b.addEventListener('click',()=>{state.clientTab=b.dataset.clientTab;render();}));
    $$('[data-inspo]').forEach(el=>el.addEventListener('click',()=>{state.selectedInspo=Number(el.dataset.inspo);render();}));
    $$('[data-table]').forEach(el=>el.addEventListener('click',()=>{state.selectedTable=el.dataset.table;render();}));
    $$('[data-layout]').forEach(el=>el.addEventListener('click',()=>{state.floorLayout=el.dataset.layout;render();}));
    $$('[data-assign-guest]').forEach(b=>b.addEventListener('click',()=>assignGuest(b.dataset.assignGuest)));
    $$('[data-lead-forward]').forEach(b=>b.addEventListener('click',()=>moveLead(b.dataset.leadForward)));
    $$('[data-inventory-reserve]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.inventoryReserve;state.inventoryReserved.has(n)?state.inventoryReserved.delete(n):state.inventoryReserved.add(n);render();toast(state.inventoryReserved.has(n)?'Sample item reserved':'Sample reservation removed');}));
    $$('[data-checkin]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.checkin;state.checkedIn.has(n)?state.checkedIn.delete(n):state.checkedIn.add(n);render();toast(state.checkedIn.has(n)?`${n} checked in`:`${n} returned to not checked in`);}));
    $$('[data-automation]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.automation;state.automations[id]=!state.automations[id];render();toast(`${cap(id)} automation ${state.automations[id]?'enabled':'disabled'} in demo`);}));
    $$('[data-run]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.run;state.runDone.has(id)?state.runDone.delete(id):state.runDone.add(id);render();toast('Run-of-show status updated');}));
    $$('[data-demo-action]').forEach(b=>b.addEventListener('click',()=>demoAction(b.dataset.demoAction)));
    $('#guestSearch')?.addEventListener('input',filterGuests); $('#guestFilter')?.addEventListener('change',filterGuests);
    $('#inventorySearch')?.addEventListener('input',filterInventory); $('#inventoryFilter')?.addEventListener('change',filterInventory);
  }

  function demoAction(action){
    if(action==='approve-inspo'){state.inspoApproved.add(state.selectedInspo);render();toast('Sample inspiration approved','In a real event, this decision can sync to the client portal and inventory workflow.');}
    else if(action==='client-approve') toast('Approval recorded in demo','No production event or client record was changed.');
    else if(action==='vendor-favorite'){state.vendorFavorite=!state.vendorFavorite;render();toast(state.vendorFavorite?'Preferred vendor marked':'Preferred status removed');}
    else if(action==='simulate-payment'){state.invoiceStatus=state.invoiceStatus==='paid'?'partial':'paid';render();toast(state.invoiceStatus==='paid'?'Payment received preview':'Payment preview reset');}
    else if(action==='draft-save'){state.draftedReply=$('#demoReply')?.value||'';toast('Demo draft saved locally');}
    else if(action==='fake-send') toast('Sending is intentionally disabled','The demo lets prospects explore communication context without contacting anyone.');
    else if(action==='open-thread'){state.draftedReply='Absolutely — I can shift cocktail hour by 15 minutes and update the vendor timeline accordingly.';render();}
    else if(action==='rsvp-demo'){state.inviteRsvp='attending';render();toast('Sample RSVP recorded','In production the same guest record feeds seating and QR check-in.');}
    else if(action==='guest-photo-upload'){state.demoPhotoCount+=1;render();toast('Guest photo received','The real gallery stores uploads privately and keeps them for at least two years.');}
    else if(action==='guest-photo-copy') toast('Guest photo QR link copied in production');
    else if(action==='photo-download') toast('Download preview','Production downloads the original approved guest photo.');
    else if(action==='photo-print') toast('Print preview','Production opens a clean photo-only print view.');
    else if(action==='ticket-preview') toast('Attendee QR opened','The same event-day scanner handles tickets and RSVP guests.');
    else if(action==='document-open') toast('Secure document opened','Production uses a short-lived signed URL after permission checks.');
    else if(action==='question-save'){state.questionnaireAnswered=!!($('#demoQuestion')?.value||'').trim();render();toast('Questionnaire draft saved in demo');}
    else if(action==='brand-toggle'){state.brandPreview=state.brandPreview==='sage'?'midnight':'sage';render();toast('Tenant brand preview switched');}
    else if(action==='checkout-preview') toast('Checkout preview','Production creates a tenant Stripe checkout and temporary date/inventory hold.');
    else if(action==='reset-leads'){state.leads.forEach((l,i)=>l.stage=['new','proposal','consult','new'][i]);render();toast('Sample pipeline reset');}
  }

  function moveLead(id){ const l=state.leads.find(x=>x.id===id); if(!l)return; const order=['new','consult','proposal','booked']; const i=order.indexOf(l.stage); if(i<order.length-1) l.stage=order[i+1]; render(); toast(`${l.name} moved to ${cap(l.stage)}`); }
  function assignGuest(name){ const t=tableData[state.selectedTable]; const g=guestData.find(x=>x.name===name); if(!t||!g)return; const used=tableOccupancy(state.selectedTable); if(used+g.party>t.capacity){toast('That party will not fit at this table',`${t.name} has ${t.capacity-used} open seat(s).`);return;} state.guestAssignments[name]=state.selectedTable; render(); toast(`${name} assigned to ${t.name}`); }
  function tableOccupancy(id){ return guestData.filter(g=>state.guestAssignments[g.name]===id).reduce((n,g)=>n+g.party,0); }

  function filterGuests(){ const q=($('#guestSearch')?.value||'').toLowerCase(); const f=$('#guestFilter')?.value||'All RSVP'; const rows=guestData.filter(g=>(!q||g.name.toLowerCase().includes(q))&&(f==='All RSVP'||g.rsvp===f)); $('#guestRows').innerHTML=guestRows(rows); $$('[data-checkin]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.checkin;state.checkedIn.has(n)?state.checkedIn.delete(n):state.checkedIn.add(n);filterGuests();toast(`${n} check-in updated`);})); }
  function filterInventory(){ const q=($('#inventorySearch')?.value||'').toLowerCase(); const f=$('#inventoryFilter')?.value||'All categories'; const rows=inventory.filter(x=>(!q||x.name.toLowerCase().includes(q))&&(f==='All categories'||x.cat===f)); $('#inventoryGrid').innerHTML=inventoryCards(rows); $$('[data-inventory-reserve]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.inventoryReserve;state.inventoryReserved.has(n)?state.inventoryReserved.delete(n):state.inventoryReserved.add(n);filterInventory();toast('Demo reservation updated');})); }

  function resetState(){ location.reload(); }
  function stat(label,value,sub){return `<div class="demo-card demo-stat"><small>${label}</small><strong>${value}</strong><p>${sub}</p></div>`;}
  function eventRow(title,meta,status,tone=''){return `<div class="demo-row"><div class="demo-row-main"><strong>${title}</strong><span>${meta}</span></div><span class="demo-chip ${tone}">${status}</span></div>`;}
  function attention(type,text,action){return `<div class="demo-row"><div class="demo-row-main"><strong>${type}</strong><span>${text}</span></div><span class="demo-chip warn">${action}</span></div>`;}
  function activity(time,text){return `<div class="demo-row"><div class="demo-row-main"><strong>${time}</strong><span>${text}</span></div><span class="demo-chip good">✓</span></div>`;}
  function bar(label,pct,value){return `<div class="demo-chart-row"><span>${label}</span><div class="demo-chart-bar"><i style="width:${pct}%"></i></div><b>${value}</b></div>`;}
  function leadCard(l,stages){ const idx=stages.findIndex(s=>s[0]===l.stage); return `<div class="demo-lead"><b>${l.name}</b><span>${l.event} · ${l.budget}</span><div class="demo-lead-actions">${idx<stages.length-1?`<button data-lead-forward="${l.id}">Move forward →</button>`:'<button disabled>Booked ✓</button>'}</div></div>`; }
  function checkItem(title,done,due){return `<label class="demo-row demo-check ${done?'done':''}"><input type="checkbox" ${done?'checked':''}><span><strong>${title}</strong><small>${due}</small></span></label>`;}
  function timeline(time,title){return `<div class="demo-row"><div class="demo-row-main"><strong>${time}</strong><span>${title}</span></div><span class="demo-chip">Timeline</span></div>`;}
  function doc(name,meta,status){return `<div class="demo-row"><div class="demo-row-main"><strong>${name}</strong><span>${meta}</span></div><span class="demo-chip good">${status}</span></div>`;}
  function invoiceRow(name,status,amount){return `<div class="demo-row"><div class="demo-row-main"><strong>${name}</strong><span>${status}</span></div><b class="demo-money">${amount}</b></div>`;}
  function guestRows(rows){return rows.map(g=>`<tr><td><b>${g.name}</b></td><td>${g.party}</td><td><span class="demo-chip ${g.rsvp==='Attending'?'good':g.rsvp==='Pending'?'warn':''}">${g.rsvp}</span></td><td>${g.meal}</td><td>${state.guestAssignments[g.name]?tableData[state.guestAssignments[g.name]].name:g.table}</td><td>${g.rsvp==='Attending'?`<button class="demo-button ${state.checkedIn.has(g.name)?'primary':''}" data-checkin="${esc(g.name)}">${state.checkedIn.has(g.name)?'Checked in ✓':'Check in'}</button>`:'—'}</td></tr>`).join('');}
  function inventoryCards(rows){return rows.map(x=>`<div class="demo-inventory-card"><div class="demo-inventory-img">${x.icon}</div><div class="demo-inventory-info"><b>${x.name}</b><span>${x.cat} · ${x.qty-x.reserved} available of ${x.qty}</span><button class="demo-button ${state.inventoryReserved.has(x.name)?'primary':''}" data-inventory-reserve="${esc(x.name)}" style="margin-top:8px;width:100%">${state.inventoryReserved.has(x.name)?'Preview reserved ✓':'Preview reserve'}</button></div></div>`).join('')||'<div class="demo-locknote">No sample inventory matches that filter.</div>';}
  function kv(k,v){return `<div class="demo-row"><span>${k}</span><strong>${v}</strong></div>`;}
  function rating(k,v){return `<div class="demo-card demo-stat" style="min-height:82px"><small>${k}</small><strong style="font-size:23px">${v}</strong></div>`;}
  function integration(icon,name,desc){return `<div class="demo-integration"><div class="demo-integration-head"><div class="demo-integration-icon">${icon}</div><span class="demo-status-good">● Connected</span></div><b>${name}</b><p>${desc}</p></div>`;}
  function cap(s){return String(s).replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());}

  $('#tourNext').addEventListener('click',()=>{const i=modules.findIndex(m=>m.id===state.active); if(i<modules.length-1)setModule(modules[i+1].id); else toast('You reached the end of the guided tour','Continue exploring any module or create an account when you are ready.');});
  $('#tourPrev').addEventListener('click',()=>{const i=modules.findIndex(m=>m.id===state.active); if(i>0)setModule(modules[i-1].id);});
  $('#resetDemo').addEventListener('click',resetState);

  initNav(); updateNav(); updateTour(); render();
})();
