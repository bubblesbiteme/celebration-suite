(() => {
  'use strict';
  if (window.__CS_ULTRA_LUXURY__) return;
  window.__CS_ULTRA_LUXURY__ = true;

  const doc = document;
  const root = doc.documentElement;
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const slug = page.replace(/\.html$/,'').replace(/[^a-z0-9-]/g,'-') || 'index';
  root.classList.add('cs-ultra-luxury');
  doc.body?.classList.add(`cs-page-${slug}`);

  const onReady = (fn) => doc.readyState === 'loading'
    ? doc.addEventListener('DOMContentLoaded', fn, {once:true})
    : fn();

  function hexToRgb(value){
    const v = String(value || '').trim();
    const m = v.match(/^#([0-9a-f]{6})$/i);
    if (!m) return null;
    const n = parseInt(m[1],16);
    return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};
  }
  function luminance(c){
    if(!c) return .5;
    const f = (x) => {x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)};
    return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b);
  }
  function contrastText(hex){return luminance(hexToRgb(hex))>.48?'#171419':'#ffffff'}
  function refreshBrandContrast(detail){
    const style = getComputedStyle(root);
    const primary = detail?.primary || style.getPropertyValue('--brand-primary').trim() || '#A9B89A';
    const secondary = detail?.secondary || style.getPropertyValue('--brand-secondary').trim() || '#37243F';
    const accent = detail?.accent || style.getPropertyValue('--brand-accent').trim() || '#D9BE8C';
    root.style.setProperty('--brand-on-primary',contrastText(primary));
    root.style.setProperty('--brand-on-secondary',contrastText(secondary));
    root.style.setProperty('--brand-on-accent',contrastText(accent));
  }
  refreshBrandContrast();
  window.addEventListener('celebration:brand-applied',(e)=>refreshBrandContrast(e.detail));

  const pageProgress = doc.createElement('div');
  pageProgress.className = 'cs-page-progress';
  pageProgress.setAttribute('aria-hidden','true');
  doc.documentElement.appendChild(pageProgress);

  const icons = {
    home:'<svg viewBox="0 0 24 24"><path d="M3.5 11.2 12 4l8.5 7.2v8.3a1.5 1.5 0 0 1-1.5 1.5h-5v-6H10v6H5a1.5 1.5 0 0 1-1.5-1.5Z"/></svg>',
    event:'<svg viewBox="0 0 24 24"><path d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/><path d="m18.2 16.3.8 2.1 2 .8-2 .8-.8 2.1-.8-2.1-2-.8 2-.8Z"/></svg>',
    design:'<svg viewBox="0 0 24 24"><path d="M4 18.5 14.8 7.7l1.5 1.5L5.5 20H4Z"/><path d="m13.8 6.7 2.6-2.6a1.5 1.5 0 0 1 2.1 0l1.4 1.4a1.5 1.5 0 0 1 0 2.1l-2.6 2.6Z"/><path d="M4 5h5M4 9h3"/></svg>',
    floor:'<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4Z"/><path d="M4 10h8V4M12 10h8M9 10v10M9 15h11"/></svg>',
    guests:'<svg viewBox="0 0 24 24"><path d="M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20v-1.5a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5V20"/><path d="M17 11a3 3 0 1 0 0-6M15.5 14.2a5 5 0 0 1 6 4.8V20"/></svg>',
    items:'<svg viewBox="0 0 24 24"><path d="m4 7 8-4 8 4-8 4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/></svg>',
    money:'<svg viewBox="0 0 24 24"><path d="M12 3v18M17 7.2C17 5.8 15.2 5 12.8 5 10.5 5 9 6 9 7.4c0 3.5 8 1.6 8 5.2 0 1.5-1.6 2.4-4.2 2.4-2.4 0-4.3-.8-4.8-2.2"/></svg>',
    inbox:'<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4Z"/><path d="m4 7 8 6 8-6"/></svg>',
    settings:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.6a7 7 0 0 0-.7-1.6l1-1.8-2.1-2.1-1.8 1a7 7 0 0 0-1.6-.7L11.5 3h-3l-.6 2a7 7 0 0 0-1.6.7l-1.8-1-2.1 2.1 1 1.8a7 7 0 0 0-.7 1.6l-2 .6v3l2 .6a7 7 0 0 0 .7 1.6l-1 1.8 2.1 2.1 1.8-1a7 7 0 0 0 1.6.7l.6 2h3l.6-2a7 7 0 0 0 1.6-.7l1.8 1 2.1-2.1-1-1.8a7 7 0 0 0 .7-1.6Z"/></svg>',
    search:'<svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>'
  };

  function refineDock(){
    const dock = doc.querySelector('.cs-nav-dock');
    if(!dock) return;
    const logo = dock.querySelector('.cs-nav-logo');
    if(logo && logo.dataset.csLuxuryLogoApplied!=='1'){
      logo.innerHTML='<img src="/assets/celebration-suite-mark.svg" alt="" aria-hidden="true">';
      logo.dataset.csLuxuryLogoApplied='1';
    }
    const map = [
      ['app.html','home'],['event-workspace.html','event'],['inspiration.html','design'],['floorplan.html','floor'],
      ['guests.html','guests'],['inventory.html','items'],['financials.html','money'],['communications.html','inbox'],['settings.html','settings']
    ];
    dock.querySelectorAll('a[href]').forEach((a)=>{
      const target = (new URL(a.href,location.href).pathname.split('/').pop()||'').toLowerCase();
      const icon = map.find(([name])=>name===target)?.[1];
      const b = a.querySelector('b');
      if(!icon || !b || b.dataset.csLuxuryIcon===icon) return;
      b.innerHTML=icons[icon];
      b.dataset.csLuxuryIcon=icon;
    });
  }

  function currentEventId(){
    const q = new URLSearchParams(location.search);
    return q.get('event_id') || q.get('id') || q.get('booking_id') || '';
  }
  function withEvent(href){
    const id=currentEventId();
    if(!id) return href;
    const u=new URL(href,location.origin);
    const target=(u.pathname.split('/').pop()||'').toLowerCase();
    const eventPages=new Set(['event-workspace.html','inspiration.html','floorplan.html','guests.html','guest-checkin.html','event-day.html','event-closeout.html','event-book.html','event-inventory.html','inventory-event-sheet.html','documents.html','appointments.html','questionnaires.html','approvals.html','change-orders.html','financials.html']);
    if(eventPages.has(target) && !['event_id','id','booking_id'].some(k=>u.searchParams.has(k))){
      u.searchParams.set(target==='event-workspace.html'?'id':'event_id',id);
    }
    return u.pathname+u.search+u.hash;
  }

  const plannerPages = new Set([
    'app.html','planner-dashboard.html','event-workspace.html','crm.html','calendar.html','documents.html','inventory.html',
    'guests.html','communications.html','financials.html','proposals.html','questionnaires.html','approvals.html','team.html',
    'support.html','commerce.html','settings.html','inspiration.html','floorplan.html','appointments.html','event-day.html',
    'event-closeout.html','event-book.html','vendor-operations.html','vendors.html','purchasing.html','analytics.html'
  ]);

  function setMode(mode){
    mode=mode==='diy'?'diy':'professional';
    localStorage.setItem('celebration_suite_experience_mode',mode);
    root.dataset.csAudience=mode;
    root.dataset.csShowPro='false';
    doc.querySelectorAll('[data-cs-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.csMode===mode)));
    doc.querySelectorAll('.cs-luxury-mode-option').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.mode===mode)));
    doc.querySelectorAll('.cs-mode-text').forEach(el=>el.textContent=mode==='diy'?'Guided':'Professional');
    window.dispatchEvent(new CustomEvent('celebration:experience-mode',{detail:{mode}}));
  }


  function actionHost(){
    let bar=doc.querySelector('.top-actions,.topin>div:last-child');
    if(bar) return bar;
    const top=doc.querySelector('.top,.topbar,header');
    if(!top) return null;
    bar=top.querySelector(':scope > .cs-luxury-header-actions');
    if(!bar){
      bar=doc.createElement('div');bar.className='cs-luxury-header-actions';
      const existing=[...top.children].filter(x=>x.matches('a,button'));
      existing.forEach(x=>bar.appendChild(x));
      top.appendChild(bar);
    }
    return bar;
  }

  const modePages=new Set(['app.html','planner-dashboard.html','event-workspace.html']);
  function mountModeControl(){
    if(!modePages.has(page) || doc.querySelector('.cs-luxury-mode-wrap')) return;
    const bar=actionHost();
    if(!bar) return;
    let mode=localStorage.getItem('celebration_suite_experience_mode')||'professional';
    const wrap=doc.createElement('div');
    wrap.className='cs-luxury-mode-wrap';
    wrap.setAttribute('role','group');
    wrap.setAttribute('aria-label','Workspace experience');
    wrap.innerHTML=`<span class="cs-mode-label">Workspace</span>
      <div class="cs-mode-segmented">
        <button type="button" class="cs-mode-segment" data-mode="diy" aria-pressed="${mode==='diy'}">Guided</button>
        <button type="button" class="cs-mode-segment" data-mode="professional" aria-pressed="${mode!=='diy'}">Professional</button>
      </div>`;
    bar.insertBefore(wrap,bar.firstChild);
    const apply=()=>wrap.querySelectorAll('.cs-mode-segment').forEach((b)=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
    wrap.querySelectorAll('.cs-mode-segment').forEach((b)=>b.addEventListener('click',()=>{mode=b.dataset.mode;setMode(mode);apply()}));
    apply();
    setMode(mode);
  }

  const navItems = [
    {group:'Workspace',label:'Events',desc:'All active and archived events',href:'/app.html',icon:'home'},
    {group:'Workspace',label:'Current event',desc:'Open the unified event workspace',href:'/event-workspace.html',icon:'event',event:true},
    {group:'Planning',label:'Inspiration board',desc:'Design, mood board and approvals',href:'/inspiration.html',icon:'design',event:true},
    {group:'Planning',label:'Floor plan',desc:'Room layouts, tables, seating and scale',href:'/floorplan.html',icon:'floor',event:true},
    {group:'Planning',label:'Guests & RSVP',desc:'Guest list, invitations and check-in',href:'/guests.html',icon:'guests',event:true},
    {group:'Operations',label:'Inventory',desc:'Master inventory, reservations and QR',href:'/inventory.html',icon:'items'},
    {group:'Business',label:'Financials',desc:'Invoices, payments, refunds and budgets',href:'/financials.html',icon:'money',event:true},
    {group:'Business',label:'Communications',desc:'Email, SMS, portal and internal notes',href:'/communications.html',icon:'inbox'},
    {group:'Business',label:'Leads & CRM',desc:'Inquiries, pipeline and follow-up',href:'/crm.html',icon:'guests'},
    {group:'Business',label:'Proposals',desc:'Proposals, agreements and signatures',href:'/proposals.html',icon:'event'},
    {group:'Operations',label:'Vendors',desc:'Directory, quotes, documents and reviews',href:'/vendors.html',icon:'guests'},
    {group:'Operations',label:'Calendar',desc:'Availability, appointments and scheduling',href:'/calendar.html',icon:'event'},
    {group:'Account',label:'Settings',desc:'Branding, integrations and account',href:'/settings.html',icon:'settings'},
    {group:'Account',label:'Knowledge base',desc:'Guides and troubleshooting',href:'/knowledge-base.html',icon:'search'}
  ];

  function mountCommandPalette(){
    if(!plannerPages.has(page) || doc.querySelector('.cs-command-backdrop')) return;
    const bar=actionHost();
    const trigger=doc.createElement('button');
    trigger.type='button';trigger.className='btn ghost cs-command-trigger';
    trigger.innerHTML=`${icons.search}<span>Search</span><kbd>⌘K</kbd>`;
    trigger.setAttribute('aria-label','Open quick navigation');
    if(bar) bar.insertBefore(trigger,bar.firstChild); else {trigger.style.cssText='position:fixed;right:18px;bottom:18px;z-index:9000';doc.body.appendChild(trigger)}

    const overlay=doc.createElement('div');overlay.className='cs-command-backdrop';overlay.hidden=true;
    overlay.innerHTML=`<section class="cs-command-panel" role="dialog" aria-modal="true" aria-label="Quick navigation">
      <div class="cs-command-search">${icons.search}<input type="search" autocomplete="off" placeholder="Search pages and actions…" aria-label="Search pages and actions"></div>
      <div class="cs-command-results"></div>
      <div class="cs-command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div>
    </section>`;
    doc.body.appendChild(overlay);
    const input=overlay.querySelector('input');const results=overlay.querySelector('.cs-command-results');let selected=0;
    const actionItems=()=>{
      const items=[...navItems];
      if(doc.querySelector('#newEventBtn')) items.unshift({group:'Actions',label:'Create a new event',desc:'Start a new planning workspace',action:()=>doc.querySelector('#newEventBtn')?.click(),icon:'event'});
      if(doc.querySelector('#previewClientPortal')) items.unshift({group:'Actions',label:'Preview client portal',desc:'See the exact client experience',action:()=>doc.querySelector('#previewClientPortal')?.click(),icon:'guests'});
      if(doc.querySelector('#refresh,#refreshPortal')) items.unshift({group:'Actions',label:'Refresh this page',desc:'Reload the latest information',action:()=>doc.querySelector('#refresh,#refreshPortal')?.click(),icon:'search'});
      return items;
    };
    const render=()=>{
      const q=input.value.trim().toLowerCase();
      const filtered=actionItems().filter(x=>!q||`${x.label} ${x.desc} ${x.group}`.toLowerCase().includes(q));
      selected=Math.min(selected,Math.max(0,filtered.length-1));
      let last='';
      results.innerHTML=filtered.length?filtered.map((x,i)=>{
        const head=x.group!==last?`<div class="cs-command-group">${x.group}</div>`:'';last=x.group;
        return `${head}<button type="button" class="cs-command-item" data-index="${i}" aria-selected="${i===selected}"><i>${icons[x.icon]||icons.event}</i><span><b>${x.label}</b><small>${x.desc}</small></span><kbd>↵</kbd></button>`;
      }).join(''):'<div class="cs-smart-empty"><b>No matching page</b><small>Try a different word.</small></div>';
      results.querySelectorAll('.cs-command-item').forEach((b)=>b.addEventListener('click',()=>activate(filtered[Number(b.dataset.index)])));
      results.querySelector(`[data-index="${selected}"]`)?.scrollIntoView({block:'nearest'});
      overlay._filtered=filtered;
    };
    const activate=(item)=>{
      if(!item)return;
      close();
      if(item.action){item.action();return}
      location.href=item.event?withEvent(item.href):item.href;
    };
    const open=()=>{overlay.hidden=false;selected=0;input.value='';render();setTimeout(()=>input.focus(),0)};
    const close=()=>{overlay.hidden=true;trigger.focus({preventScroll:true})};
    trigger.addEventListener('click',open);
    overlay.addEventListener('click',(e)=>{if(e.target===overlay)close()});
    input.addEventListener('input',()=>{selected=0;render()});
    doc.addEventListener('keydown',(e)=>{
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();overlay.hidden?open():close();return}
      if(overlay.hidden)return;
      const list=overlay._filtered||[];
      if(e.key==='Escape'){e.preventDefault();close()}
      else if(e.key==='ArrowDown'){e.preventDefault();selected=Math.min(list.length-1,selected+1);render()}
      else if(e.key==='ArrowUp'){e.preventDefault();selected=Math.max(0,selected-1);render()}
      else if(e.key==='Enter'){e.preventDefault();activate(list[selected])}
    });
  }

  function enhancePage(){
    doc.body.classList.add(`cs-page-${slug}`);
    refineDock();
    mountModeControl();
    mountCommandPalette();
    doc.querySelectorAll('h1,h2').forEach((h)=>{if(!h.title)h.title=h.textContent.trim()});
    let dockRefreshQueued=false;
    const observer=new MutationObserver((records)=>{
      if(dockRefreshQueued) return;
      const relevant=records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1 && (n.matches?.('.cs-nav-dock,.cs-nav-dock *') || n.querySelector?.('.cs-nav-dock'))));
      if(!relevant) return;
      dockRefreshQueued=true;
      requestAnimationFrame(()=>{dockRefreshQueued=false;refineDock()});
    });
    observer.observe(doc.body,{childList:true,subtree:true});
  }
  onReady(enhancePage);
})();
