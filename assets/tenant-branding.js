(()=>{
  const DEFAULTS={
    business_name:'Celebration Suite',
    logo_url:'/assets/celebration-suite-mark.svg',
    primary:'#A9B89A',
    secondary:'#37243F',
    accent:'#D9BE8C'
  };
  const cleanHex=(v,f)=>/^#[0-9a-fA-F]{6}$/.test(String(v||''))?String(v):f;
  function normalize(input={}){
    const tenant=input.tenant||input;
    const b=tenant?.branding||input.branding||{};
    return {
      business_name:tenant?.business_name||input.business_name||DEFAULTS.business_name,
      logo_url:b.logo_url||b.logo||input.logo_url||DEFAULTS.logo_url,
      has_custom_logo:!!(b.logo_url||b.logo||input.logo_url),
      primary:cleanHex(b.primary||b.primary_color||input.primary,DEFAULTS.primary),
      secondary:cleanHex(b.secondary||b.secondary_color||input.secondary,DEFAULTS.secondary),
      accent:cleanHex(b.accent||b.accent_color||input.accent,DEFAULTS.accent)
    };
  }
  function apply(input={},opts={}){
    const brand=normalize(input),root=document.documentElement;
    root.style.setProperty('--brand-primary',brand.primary);
    root.style.setProperty('--brand-secondary',brand.secondary);
    root.style.setProperty('--brand-accent',brand.accent);
    // Original Sage portal aliases. Keep layout intact while letting tenant colors drive it.
    root.style.setProperty('--sage',brand.primary);
    root.style.setProperty('--ink',brand.secondary);
    root.style.setProperty('--cream',brand.accent);
    root.style.setProperty('--pink',brand.primary);
    root.style.setProperty('--lime',brand.accent);
    root.style.setProperty('--blue',brand.secondary);
    root.dataset.tenantBranded='1';
    document.querySelectorAll('[data-tenant-business-name]').forEach(el=>el.textContent=brand.business_name);
    document.querySelectorAll('[data-tenant-logo]').forEach(img=>{img.src=brand.logo_url;img.alt=`${brand.business_name} logo`;img.hidden=false});
    document.querySelectorAll('[data-tenant-logo-fallback]').forEach(el=>{el.hidden=true});
    document.querySelectorAll('img[src="/assets/logo.png"],img[alt="Sage & Celebration"]').forEach(img=>{img.src=brand.logo_url;img.alt=`${brand.business_name} logo`});
    document.querySelectorAll('.brand h1,.brand-title,.topin h1').forEach(el=>{if(/Sage & Celebration|Celebration Suite/i.test(el.textContent||''))el.textContent=brand.business_name});
    let dyn=document.getElementById('tenantBrandDynamic');if(!dyn){dyn=document.createElement('style');dyn.id='tenantBrandDynamic';document.head.appendChild(dyn)}dyn.textContent=`.top,.topbar,.header{background:${brand.secondary}!important}.btn.primary,.btn.pink,button.primary{background:${brand.primary}!important}.btn.accent{background:${brand.accent}!important}.active,.active-link{--tenant-active:${brand.primary}}`; 
    if(opts.replaceShell!==false){
      document.querySelectorAll('.brand:not(.product-brand) .brand-title').forEach(el=>el.textContent=brand.business_name);
      document.querySelectorAll('.brand:not(.product-brand) .brand-mark img:not(.product-logo)').forEach(img=>{img.src=brand.logo_url;img.alt=`${brand.business_name} logo`});
    }
    window.dispatchEvent(new CustomEvent('celebration:brand-applied',{detail:brand}));
    return brand;
  }
  async function loadPlanner(){try{let d;if(window.WLP?.api)d=await WLP.api('tenant-settings');else{const r=await fetch('/.netlify/functions/tenant-settings',{credentials:'same-origin'});if(!r.ok)return null;d=await r.json()}return apply(d.tenant||d)}catch{return null}}
  window.CSBrand={DEFAULTS,normalize,apply,loadPlanner};
  const skip=new Set(['/index.html','/pricing.html','/register.html','/login.html','/activate.html','/platform-admin.html','/platform-login.html','/privacy.html','/terms.html','/eula.html','/proposal-public.html','/questionnaire-public.html','/approval-public.html','/change-order-public.html','/registration-public.html','/ticket.html','/rsvp-public.html','/pay-invoice.html','/portal.html','/client-login.html','/portal-login.html','/my-events.html']);
  const auto=()=>{if(!skip.has(location.pathname))loadPlanner()};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',auto);else auto();
})();
