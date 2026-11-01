const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const api=async(path,options={})=>{const r=await fetch('/.netlify/functions/'+path,{headers:{'content-type':'application/json',...(options.headers||{})},credentials:'same-origin',...options});const j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(j.error||'Request failed');e.status=r.status;e.payload=j;throw e}return j};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmtDate=v=>v?new Date(v+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'TBD';
window.WLP={$, $$, api, esc, fmtDate};


// Celebration Suite shared UI polish: local inline icons, no external dependency.
(()=>{
  const icons={
    calendar:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2v3M18 2v3M3.5 8.5h17M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>',
    overview:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-3H4v3Zm10-13h6V4h-6v3Z"/></svg>',
    clients:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    leads:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16M4 12h10M4 19h7M18 14v6M15 17h6"/></svg>',
    proposal:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h9l5 5v15H6V2Zm8 1v5h5M9 12h8M9 16h8"/></svg>',
    financials:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M17 6.5c0-1.4-1.8-2.5-4-2.5s-4 1.1-4 2.5S10.8 9 13 9s4 1.1 4 2.5-1.8 2.5-4 2.5-4 1.1-4 2.5S10.8 19 13 19s4-1.1 4-2.5"/></svg>',
    vendors:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v10H4V10Zm2-6h12l2 6H4l2-6Zm3 10h6M8 20v-4h8v4"/></svg>',
    inventory:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7.5 12 3l9 4.5L12 12 3 7.5Zm0 0V17l9 4 9-4V7.5M12 12v9"/></svg>',
    clock:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    team:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 2a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2m1-6h1a5 5 0 0 1 5 5v1"/></svg>',
    settings:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1H21v4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>',
    help:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.6 2.1c-.9.5-1.4 1-1.4 2M12 17h.01"/></svg>'
  };
  const decorate=()=>{
    document.querySelectorAll('[data-icon]').forEach(el=>{
      if(el.querySelector('.nav-icon')) return;
      const key=el.dataset.icon,svg=icons[key];
      if(!svg) return;
      const span=document.createElement('span');span.className='nav-icon';span.innerHTML=svg;el.prepend(span);
    });
    const path=location.pathname.replace(/\/$/,'')||'/';
    document.querySelectorAll('.nav a[href]').forEach(a=>{
      if(a.getAttribute('href')===path) a.classList.add('active-link');
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',decorate); else decorate();
})();

// v0.24.3: task launcher removed; primary navigation is the single source of truth.

// v0.21 installable/offline shell
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));}
let csInstallPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();csInstallPrompt=e;document.documentElement.dataset.installable='1';});
window.CSInstallApp=async()=>{if(!csInstallPrompt)return false;csInstallPrompt.prompt();await csInstallPrompt.userChoice;csInstallPrompt=null;document.documentElement.dataset.installable='0';return true};

// v0.29 contextual help / knowledge base
(()=>{
  const pageHelp={
    '/app.html':'dashboard-events','/planner-dashboard.html':'dashboard-events','/my-events.html':'dashboard-events',
    '/event.html':'event-workspace','/event-workspace.html':'event-workspace',
    '/portal.html':'client-portal','/client-login.html':'client-portal','/portal-login.html':'client-portal','/client-security.html':'security',
    '/inspiration.html':'design-studio','/inventory-design-picker.html':'inventory-picker-design','/floorplan.html':'floor-plan',
    '/inventory.html':'inventory-master','/inventory-admin.html':'inventory-master','/inventory-scan.html':'inventory-qr','/inventory-reservation-calendar.html':'inventory-reservations','/inventory-reservation-calendar-admin.html':'inventory-reservations','/event-inventory.html':'inventory-reservations','/inventory-event-sheet.html':'inventory-reservations',
    '/guests.html':'guests','/guests-admin.html':'guests','/guest-checkin.html':'guest-checkin','/rsvp-public.html':'rsvp-settings',
    '/registration.html':'ticketing','/registration-admin.html':'ticketing','/registration-public.html':'ticketing','/ticket.html':'ticketing',
    '/financials.html':'financials','/financials-admin.html':'financials','/pay-invoice.html':'financials',
    '/vendors.html':'vendors','/vendors-admin.html':'vendors','/vendor-operations.html':'vendors','/vendor-reviews.html':'vendors','/vendor-quotes.html':'vendor-quotes','/vendor-document-vault.html':'documents',
    '/communications.html':'communications','/communications-admin.html':'communications',
    '/calendar.html':'calendar','/scheduling.html':'calendar','/scheduling-admin.html':'calendar','/appointments.html':'calendar',
    '/accounting.html':'quickbooks','/quickbooks-admin.html':'quickbooks','/reconciliation.html':'quickbooks',
    '/team.html':'team','/team-admin.html':'team','/staff-invite.html':'team','/staff-operations.html':'staff-scheduling','/staff-events.html':'staff-scheduling','/time-tracking.html':'staff-scheduling',
    '/documents.html':'documents','/agreement-vault.html':'documents',
    '/questionnaires.html':'questionnaires','/questionnaire-public.html':'questionnaires',
    '/approvals.html':'approvals','/approval-public.html':'approvals','/change-orders.html':'approvals','/change-order-public.html':'approvals',
    '/event-day.html':'event-day','/event-day-command.html':'event-day','/event-book.html':'event-book','/event-book-admin.html':'event-book','/closeouts.html':'closeout','/event-closeout.html':'closeout',
    '/settings.html':'branding','/security.html':'security','/forgot-password.html':'security','/reset-password.html':'security','/backup.html':'backup','/backup-admin.html':'backup','/restore-admin.html':'backup',
    '/support.html':'support','/platform-admin.html':'platform-admin','/platform-login.html':'platform-admin',
    '/billing.html':'getting-started','/onboarding.html':'getting-started','/integration-center.html':'getting-started','/integrations-admin.html':'getting-started','/automations.html':'getting-started',
    '/crm.html':'dashboard-events','/leads-admin.html':'dashboard-events','/proposals.html':'financials','/proposals-admin.html':'financials','/proposal-public.html':'financials',
    '/audit.html':'platform-admin','/notifications.html':'getting-started','/system-health.html':'platform-admin','/launch-health.html':'platform-admin','/support-admin.html':'platform-admin',
    '/referrals.html':'financials','/purchasing.html':'inventory-reservations','/partner-portal.html':'vendors','/partner-access.html':'vendors'
  };
  function addHelp(){
    if(location.pathname==='/knowledge-base.html'||location.pathname==='/getting-started.html') return;
    const id=pageHelp[location.pathname]||'getting-started';
    const href='/knowledge-base.html?article='+encodeURIComponent(id);
    if(document.querySelector('[data-context-help]')) return;
    const a=document.createElement('a');a.href=href;a.className='btn';a.dataset.contextHelp='1';a.textContent='? Help';a.title='Help for this page';
    const actions=document.querySelector('.top-actions');
    if(actions){actions.insertBefore(a,actions.firstChild);return;}
    const topbar=document.querySelector('.topbar,header');
    if(topbar){a.style.marginLeft='auto';topbar.appendChild(a);return;}
    a.style.cssText='position:fixed;right:18px;bottom:18px;z-index:9998;text-decoration:none';document.body.appendChild(a);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',addHelp); else addHelp();
})();

// v0.32 planner-wide white-label branding. Product/auth/platform-owner pages opt out.
(()=>{
  const excluded=new Set(['/index.html','/pricing.html','/register.html','/login.html','/activate.html','/platform-admin.html','/platform-login.html','/privacy.html','/terms.html','/eula.html']);
  const run=()=>{if(!excluded.has(location.pathname)&&window.CSBrand?.loadPlanner)CSBrand.loadPlanner()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
