const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const api=async(path,options={})=>{const r=await fetch('/.netlify/functions/'+path,{headers:{'content-type':'application/json',...(options.headers||{})},credentials:'same-origin',...options});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Request failed');return j};
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
