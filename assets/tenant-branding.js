(()=>{
  const DEFAULTS={
    business_name:'Celebration Suite',
    logo_url:'/assets/celebration-suite-mark.svg',
    primary:'#A9B89A',
    secondary:'#37243F',
    accent:'#D9BE8C',
    heading_text:'#1D191F',
    body_text:'#4F4852',
    button_text:'#FFFFFF'
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
      accent:cleanHex(b.accent||b.accent_color||input.accent,DEFAULTS.accent),
      heading_text:cleanHex(b.heading_text||b.heading_text_color||input.heading_text,DEFAULTS.heading_text),
      body_text:cleanHex(b.body_text||b.body_text_color||input.body_text,DEFAULTS.body_text),
      button_text:cleanHex(b.button_text||b.button_text_color||input.button_text,DEFAULTS.button_text)
    };
  }
  function apply(input={},opts={}){
    const brand=normalize(input),root=document.documentElement;
    root.style.setProperty('--brand-primary',brand.primary);
    root.style.setProperty('--brand-secondary',brand.secondary);
    root.style.setProperty('--brand-accent',brand.accent);
    root.style.setProperty('--brand-heading-text',brand.heading_text);
    root.style.setProperty('--brand-body-text',brand.body_text);
    root.style.setProperty('--brand-button-text',brand.button_text);
    // Compatibility aliases retained for legacy page CSS; tenant-facing markup uses neutral brand hooks.
    root.style.setProperty('--sage',brand.primary);
    root.style.setProperty('--ink','#1D191F');
    root.style.setProperty('--cream',`color-mix(in srgb, ${brand.accent} 12%, #fffaf4)`);
    root.style.setProperty('--pink',brand.primary);
    root.style.setProperty('--lime',brand.accent);
    root.style.setProperty('--blue',brand.secondary);
    root.dataset.tenantBranded='1';
    document.querySelectorAll('[data-tenant-business-name]').forEach(el=>el.textContent=brand.business_name);
    document.querySelectorAll('[data-tenant-logo]').forEach(img=>{img.src=brand.logo_url;img.alt=`${brand.business_name} logo`;img.hidden=false});
    document.querySelectorAll('[data-tenant-logo-fallback]').forEach(el=>{el.hidden=true});
    let dyn=document.getElementById('tenantBrandDynamic');if(!dyn){dyn=document.createElement('style');dyn.id='tenantBrandDynamic';document.head.appendChild(dyn)}dyn.textContent=`html[data-tenant-branded="1"]{--tenant-primary:${brand.primary};--tenant-secondary:${brand.secondary};--tenant-accent:${brand.accent};--tenant-heading-text:${brand.heading_text};--tenant-body-text:${brand.body_text};--tenant-button-text:${brand.button_text}}html[data-tenant-branded="1"] .btn.primary,html[data-tenant-branded="1"] .btn.pink,html[data-tenant-branded="1"] button.primary{--tenant-button:${brand.primary}}html[data-tenant-branded="1"] .active,html[data-tenant-branded="1"] .active-link{--tenant-active:${brand.primary}}`; 
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

;(()=>{if(!document.querySelector("script[data-cs-release-notices]")){const s=document.createElement("script");s.src="/assets/release-notices.js";s.dataset.csReleaseNotices="1";document.head.appendChild(s)}})();
