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
    new MutationObserver(expose).observe(document.documentElement,{childList:true,subtree:true});
  }
  function report(kind,message,stack,source){
    try{fetch('/.netlify/functions/client-error-report',{method:'POST',credentials:'same-origin',keepalive:true,headers:{'content-type':'application/json'},body:JSON.stringify({severity:'error',source:source||kind,page_path:location.pathname+location.search,message:String(message||kind).slice(0,2000),stack:String(stack||'').slice(0,12000),context:{kind}})}).catch(function(){})}catch(_){ }
  }
  window.addEventListener('error',function(e){report('window.error',e.message,e.error&&e.error.stack,e.filename)});
  window.addEventListener('unhandledrejection',function(e){const r=e.reason;report('unhandledrejection',r&&r.message?r.message:String(r||'Unhandled promise rejection'),r&&r.stack,'promise')});
  function report(kind,message,stack,source){
    try{fetch('/.netlify/functions/client-error-report',{method:'POST',credentials:'same-origin',keepalive:true,headers:{'content-type':'application/json'},body:JSON.stringify({severity:'error',source:source||kind,page_path:location.pathname+location.search,message:String(message||kind).slice(0,2000),stack:String(stack||'').slice(0,12000),context:{kind}})}).catch(function(){})}catch(_){ }
  }
  window.addEventListener('error',function(e){report('window.error',e.message,e.error&&e.error.stack,e.filename)});
  window.addEventListener('unhandledrejection',function(e){const r=e.reason;report('unhandledrejection',r&&r.message?r.message:String(r||'Unhandled promise rejection'),r&&r.stack,'promise')});
  document.addEventListener('DOMContentLoaded',expose,{once:true});
})();
