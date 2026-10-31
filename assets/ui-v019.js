(()=>{
  const path=(location.pathname.split('/').pop()||'app.html').toLowerCase();
  const publicPages=['index.html','login.html','register.html','forgot-password.html','reset-password.html','pricing.html','privacy.html','terms.html','eula.html','proposal-public.html','contract-public.html','approval-public.html','change-order-public.html','questionnaire-public.html','registration-public.html','rsvp-public.html','ticket.html','portal.html','client-login.html','partner-portal.html','platform-login.html','activate.html','checkout-success.html','license-expired.html','demo.html'];
  if(publicPages.includes(path)||path==='app.html')return;
  document.body.classList.add('cs-app-shell');
  document.body.dataset.page=path.replace('.html','');
  const items=[
    ['app.html','⌂','Home'],['event.html','✦','Event'],['inspiration.html','🎨','Design'],['floorplan.html','▦','Floor'],['guests.html','♟','Guests'],['inventory.html','◫','Items'],['financials.html','$','Money'],['communications.html','✉','Inbox']
  ];
  const active=(href)=>path===href || (href==='event.html' && ['event-day.html','event-inventory.html','event-book.html','closeouts.html'].includes(path)) || (href==='guests.html' && ['guest-checkin.html','registration.html'].includes(path));
  const q=new URLSearchParams(location.search),eid=q.get('event_id')||q.get('id');
  const withEvent=(href)=>eid&&['event.html','inspiration.html','floorplan.html','guests.html'].includes(href)?`${href}?${href==='event.html'?'id':'event_id'}=${encodeURIComponent(eid)}`:href;
  const nav=document.createElement('nav');nav.className='cs-nav-dock';nav.setAttribute('aria-label','Main navigation');
  nav.innerHTML='<div class="cs-nav-logo">CS</div>'+items.map(([h,i,l])=>`<a class="cs-nav-link ${active(h)?'active':''}" href="/${withEvent(h)}" title="${l}"><b aria-hidden="true">${i}</b><span>${l}</span></a>`).join('')+'<div class="cs-nav-spacer"></div><a class="cs-nav-link" href="/settings.html" title="Settings"><b>⚙</b><span>Settings</span></a>';
  document.body.appendChild(nav);

  // Give every page a clear category label and remove accidental full-screen emptiness.
  const main=document.querySelector('main');
  const head=main?.querySelector('.page-head');
  if(head){
    const title=head.querySelector('h1,h2');
    if(title&&!head.querySelector('.cs-page-kicker')){
      const k=document.createElement('div');k.className='cs-page-kicker';
      const groups={inventory:'Your things',financials:'Money',accounting:'Money',event:'Event workspace','event-inventory':'Event workspace',guests:'Guests & invitations','guest-checkin':'Guests & invitations',registration:'Tickets & registration',floorplan:'Plan the room',inspiration:'Design the look',communications:'Messages',crm:'Leads & clients',vendors:'Vendors',documents:'Files & agreements'};
      k.textContent=groups[document.body.dataset.page]||'Celebration Suite';title.parentNode.insertBefore(k,title);
    }
  }

  const enhanceEmpty=()=>document.querySelectorAll('.empty:not([data-cs-enhanced])').forEach(el=>{
    el.dataset.csEnhanced='1';
    const t=(el.textContent||'').trim();
    if(!t||/no .*yet|no .*matches|no .*reserved|nothing/i.test(t)){
      el.classList.add('cs-smart-empty');
      const page=document.body.dataset.page;
      const copy={inventory:['Your inventory will live here','Add an item or use Bulk Upload to bring in a whole list at once.'],'event-inventory':['Nothing is packed yet','Add items from inventory, or approve them on the Design Board and they will appear here automatically.'],financials:['No invoices yet','Create the first invoice when you are ready to collect a deposit or payment.'],guests:['No guests yet','Add one guest, import a list, or share your RSVP link.'],communications:['No messages yet','Choose a client or lead and send the first message.']}[page];
      if(copy)el.innerHTML=`<div class="cs-empty-icon">✦</div><b>${copy[0]}</b><small>${copy[1]}</small>`;
    }
  });
  enhanceEmpty();
  new MutationObserver(enhanceEmpty).observe(document.body,{subtree:true,childList:true});

  // Page-specific 'start here' actions.
  const actionMaps={
    inventory:[['+','Add one item','Add something you own',"document.querySelector('.top-actions .btn.primary')?.click()"],['⇧','Bulk upload','Add many items at once',"document.querySelector('.top-actions button:nth-of-type(1)')?.click()"],['▣','Scan QR','Find an item with your phone',"location='/inventory-scan.html'"],['▤','Print labels','Put QR labels on storage bins',"document.querySelectorAll('.top-actions button')[1]?.click()"]],
    'event-inventory':[['1','Choose items','Add what this event needs',"document.querySelector('input[placeholder*=Search],input[type=search]')?.focus()"],['2','Pack','Mark items as packed','void 0'],['3','Check out','Scan when loading the vehicle',"location='/inventory-scan.html'"],['4','Return','Scan and record condition',"location='/inventory-scan.html'"]],
    financials:[['+','Create invoice','Charge a deposit or balance',"document.querySelector('.top-actions .btn.primary')?.click()"],['✓','Record payment','Keep balances accurate','void 0'],['!','See overdue','Find payments that need follow-up','void 0']],
    guests:[['+','Add guests','Add one person or household','void 0'],['⇧','Import list','Bring in a CSV guest list','void 0'],['▣','RSVP QR','Print or share your RSVP code','void 0'],['✓','Check in','Scan guests at the door',"location='/guest-checkin.html'+location.search"]],
    floorplan:[['○','Round table','Place a guest table','void 0'],['▭','Long table','Place a banquet table','void 0'],['♟','Chair','Add seating','void 0'],['⌂','Venue plan','Upload the room layout','void 0']],
    inspiration:[['+','Add picture','Upload an inspiration photo','void 0'],['◫','Use inventory','Place items you already own','void 0'],['✓','Get approval','Share choices with the client','void 0']]
  };
  const actions=actionMaps[document.body.dataset.page];
  if(main&&actions&&!main.querySelector('.cs-start-actions')){
    const block=document.createElement('section');block.className='cs-start-actions';
    block.innerHTML='<div class="cs-start-title"><div><b>Start here</b><span>Pick what you want to do.</span></div></div><div class="cs-start-grid">'+actions.map(([ico,title,sub,js])=>`<button type="button" onclick="${js}"><i>${ico}</i><span><b>${title}</b><small>${sub}</small></span><em>›</em></button>`).join('')+'</div>';
    const anchor=head?head.nextSibling:main.firstChild;main.insertBefore(block,anchor);
  }

  // Promote one primary action in top bars so users do not face five equal choices.
  document.querySelectorAll('.top-actions').forEach(bar=>{
    const candidates=[...bar.querySelectorAll('.btn')];
    const preferred=candidates.find(x=>/add|new|create|invoice|inventory item|floor plan|send|scan/i.test(x.textContent||''));
    if(preferred&&!preferred.classList.contains('primary'))preferred.classList.add('primary');
  });
})();
