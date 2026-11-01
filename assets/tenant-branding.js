(function(){
  function safeColor(v,fallback){return /^#[0-9a-f]{6}$/i.test(String(v||''))?String(v):fallback}
  function initials(name){return String(name||'Planner').trim().split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'P'}
  function apply(tenant,opts){
    tenant=tenant||{};opts=opts||{};const b=tenant.branding||{};const root=document.documentElement;
    root.style.setProperty('--brand-primary',safeColor(b.primary,'#A9B89A'));
    root.style.setProperty('--brand-secondary',safeColor(b.secondary,'#37243F'));
    root.style.setProperty('--brand-accent',safeColor(b.accent,'#D9BE8C'));
    root.style.setProperty('--portal',safeColor(b.primary,'#A9B89A'));
    root.style.setProperty('--sage',safeColor(b.primary,'#A9B89A'));
    root.style.setProperty('--sage-dark',safeColor(b.secondary,'#37243F'));
    root.style.setProperty('--gold',safeColor(b.accent,'#D9BE8C'));
    const name=tenant.business_name||opts.fallbackName||'Your Planner';
    document.querySelectorAll('[data-tenant-business-name]').forEach(el=>el.textContent=name);
    document.querySelectorAll('[data-tenant-logo]').forEach(img=>{
      const url=String(b.logo_url||'').trim();
      if(url){img.src=url;img.alt=name;img.hidden=false;const fb=img.parentElement?.querySelector('[data-tenant-initials]');if(fb)fb.hidden=true;}
      else{img.removeAttribute('src');img.hidden=true;const fb=img.parentElement?.querySelector('[data-tenant-initials]');if(fb){fb.textContent=initials(name);fb.hidden=false;}}
    });
    document.querySelectorAll('[data-tenant-initials]').forEach(el=>{if(!String(b.logo_url||'').trim()){el.textContent=initials(name);el.hidden=false}});
    document.documentElement.dataset.tenantBrandApplied='1';
    return {name,branding:b};
  }
  window.CSTenantBrand={apply,initials};
})();
