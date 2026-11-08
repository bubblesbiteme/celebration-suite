import nodemailer from 'nodemailer';
import {supabase} from './_shared.mjs';
import {decrypt} from './_crypto.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const defaults={primary:'#A9B89A',secondary:'#37243F',accent:'#D9BE8C',logo:'/assets/celebration-suite-mark.svg'};
function tenantEmailHtml(tenant,inner){
 const b=tenant?.branding||{},primary=b.primary||defaults.primary,secondary=b.secondary||defaults.secondary,accent=b.accent||defaults.accent,name=tenant?.business_name||'Celebration Suite';
 const base=(process.env.URL||process.env.DEPLOY_PRIME_URL||process.env.SITE_URL||'').replace(/\/$/,'');const logo=b.logo_url||b.logo||(base?`${base}/assets/celebration-suite-mark.svg`:null);
 const logoHtml=logo?`<img src="${esc(logo)}" alt="${esc(name)}" style="max-height:64px;max-width:220px;object-fit:contain;background:#fff;border-radius:10px;padding:4px">`:`<div style="font-weight:800;font-size:22px;color:${secondary}">Celebration Suite</div>`;
 return `<div style="margin:0;background:#f7f4ef;padding:28px 12px;font-family:Arial,sans-serif;color:#222"><div style="max-width:680px;margin:auto;background:#fff;border:1px solid #e7dfd7;border-radius:18px;overflow:hidden"><div style="height:8px;background:${primary}"></div><div style="padding:22px 26px;background:${secondary};color:#fff">${logoHtml}<div style="margin-top:8px;font-size:14px">${esc(name)}</div></div><div style="padding:26px;line-height:1.6">${inner}</div><div style="height:8px;background:${accent}"></div></div></div>`;
}
export async function sendTenantEmail(tenant,{to,subject,body,html,replyTo}){
  const rows=await supabase(`tenant_integrations?tenant_id=eq.${encodeURIComponent(tenant.id)}&kind=eq.email&select=*&limit=1`),i=rows?.[0];
  if(!i)throw new Error('Connect an email provider in Brand & Integrations first.');
  const cfg=JSON.parse(decrypt(i.config_encrypted)||'{}'),fromName=tenant.from_name||tenant.business_name,fromEmail=cfg.from_email;
  if(!fromEmail)throw new Error('Your email integration is missing a From email.');
  const inner=html||`<div>${esc(body).replaceAll('\n','<br>')}</div>`,htmlBody=tenantEmailHtml(tenant,inner);
  if(i.provider==='resend'){
    if(!cfg.api_key)throw new Error('Resend API key is missing.');
    const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${cfg.api_key}`,'content-type':'application/json'},body:JSON.stringify({from:`${fromName} <${fromEmail}>`,to:[to],subject,html:htmlBody,reply_to:replyTo||tenant.reply_to_email||fromEmail})});
    if(!r.ok)throw new Error(`Email provider rejected the message: ${await r.text()}`);
  }else if(i.provider==='smtp'){
    const transport=nodemailer.createTransport({host:cfg.smtp_host,port:Number(cfg.smtp_port)||587,secure:Number(cfg.smtp_port)===465,auth:cfg.smtp_user?{user:cfg.smtp_user,pass:cfg.smtp_pass}:undefined});
    await transport.sendMail({from:`${fromName} <${fromEmail}>`,to,subject,text:body||'',html:htmlBody,replyTo:replyTo||tenant.reply_to_email||fromEmail});
  }else throw new Error('Unsupported email provider.');
}
