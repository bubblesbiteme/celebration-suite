(function(){
  'use strict';
  const unsafe=new Set(['window','document','location','name','event','status','history','navigator','screen','frames','parent','top','self','origin','closed','length','opener','performance','crypto','console','localStorage','sessionStorage','alert','confirm','prompt']);
  function expose(){
    document.querySelectorAll('[id]').forEach(function(el){
      const id=el.id;
      if(!id||unsafe.has(id)||Object.prototype.hasOwnProperty.call(window,id)) return;
      try{
        Object.defineProperty(window,id,{configurable:true,enumerable:false,get:function(){return document.getElementById(id);}});
      }catch(_){ }
    });
  }
  function eventId(){
    const q=new URLSearchParams(window.location.search);
    return q.get('event_id')||q.get('booking_id')||q.get('id')||'';
  }
  window.CSRuntime={
    byId:function(id){return document.getElementById(id)},
    exposeLegacyIds:expose,
    eventId:eventId,
    withEvent:function(path,id){
      const value=id||eventId();
      if(!value) return path;
      const u=new URL(path,window.location.origin);
      if(!u.searchParams.has('event_id')&&!u.searchParams.has('booking_id')&&!u.searchParams.has('id')) u.searchParams.set('event_id',value);
      return u.pathname+u.search+u.hash;
    }
  };
  expose();
  if(document.documentElement){
    new MutationObserver(function(){expose();accessibilityBaseline()}).observe(document.documentElement,{childList:true,subtree:true});
  }

  function accessibilityBaseline(){
    try{
      document.documentElement.lang=document.documentElement.lang||'en';
      const main=document.querySelector('main,[role="main"]');
      if(main){
        if(!main.id) main.id='main-content';
        if(!document.querySelector('.cs-skip-link')){
          if(!document.getElementById('csAccessibilityRuntimeStyles')){const st=document.createElement('style');st.id='csAccessibilityRuntimeStyles';st.textContent='.cs-skip-link{position:fixed!important;left:12px!important;top:10px!important;z-index:99999!important;transform:translateY(-180%)!important;background:#fff!important;color:#221b25!important;border:2px solid currentColor!important;border-radius:10px!important;padding:10px 14px!important;font-weight:900!important;box-shadow:0 8px 24px rgba(0,0,0,.18)!important;text-decoration:none!important}.cs-skip-link:focus,.cs-skip-link:focus-visible{transform:translateY(0)!important}';document.head.appendChild(st)};const skip=document.createElement('a');skip.className='cs-skip-link';skip.href='#'+main.id;skip.textContent='Skip to main content';
          document.body.insertBefore(skip,document.body.firstChild);
        }
      }
      document.querySelectorAll('button,[role="button"]').forEach(function(el){
        const named=(el.getAttribute('aria-label')||el.getAttribute('aria-labelledby')||el.textContent||'').trim();
        if(named) return;
        const hint=el.getAttribute('title')||el.getAttribute('data-action')||el.id||'Action';
        el.setAttribute('aria-label',String(hint).replace(/[-_]+/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2').trim());
      });
      document.querySelectorAll('img:not([alt])').forEach(function(img){img.alt=''});
    }catch(_){ }
  }
  function report(kind,message,stack,source){
    try{fetch('/.netlify/functions/client-error-report',{method:'POST',credentials:'same-origin',keepalive:true,headers:{'content-type':'application/json'},body:JSON.stringify({severity:'error',source:source||kind,page_path:location.pathname+location.search,message:String(message||kind).slice(0,2000),stack:String(stack||'').slice(0,12000),context:{kind}})}).catch(function(){})}catch(_){ }
  }
  window.addEventListener('error',function(e){
    const message=String(e.message||'');
    const filename=String(e.filename||'');
    // Browsers intentionally hide details for some cross-origin scripts/extensions and emit only
    // "Script error.". That signal is not actionable and previously flooded Platform Admin.
    if(/^script error\.?$/i.test(message)&&(!filename||/^(chrome-extension|moz-extension|edge-extension):/i.test(filename))) return;
    report('window.error',message,e.error&&e.error.stack,filename||'window.error');
  });
  window.addEventListener('unhandledrejection',function(e){const r=e.reason;report('unhandledrejection',r&&r.message?r.message:String(r||'Unhandled promise rejection'),r&&r.stack,'promise')});
  document.addEventListener('DOMContentLoaded',function(){expose();accessibilityBaseline()},{once:true});
})();
