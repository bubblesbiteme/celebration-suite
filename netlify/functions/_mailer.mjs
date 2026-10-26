import nodemailer from 'nodemailer';
import {supabase} from './_shared.mjs';
import {decrypt} from './_crypto.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
export async function sendTenantEmail(tenant,{to,subject,body,html}){
  const rows=await supabase(`tenant_integrations?tenant_id=eq.${encodeURIComponent(tenant.id)}&kind=eq.email&select=*&limit=1`),i=rows?.[0];
  if(!i)throw new Error('Connect an email provider in Brand & Integrations first.');
  const cfg=JSON.parse(decrypt(i.config_encrypted)||'{}'),fromName=tenant.from_name||tenant.business_name,fromEmail=cfg.from_email;
  if(!fromEmail)throw new Error('Your email integration is missing a From email.');
  const htmlBody=html||`<div style="font-family:Arial,sans-serif;line-height:1.6">${esc(body).replaceAll('\n','<br>')}</div>`;
  if(i.provider==='resend'){
    if(!cfg.api_key)throw new Error('Resend API key is missing.');
    const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${cfg.api_key}`,'content-type':'application/json'},body:JSON.stringify({from:`${fromName} <${fromEmail}>`,to:[to],subject,html:htmlBody,reply_to:tenant.reply_to_email||fromEmail})});
    if(!r.ok)throw new Error(`Email provider rejected the message: ${await r.text()}`);
  }else if(i.provider==='smtp'){
    const transport=nodemailer.createTransport({host:cfg.smtp_host,port:Number(cfg.smtp_port)||587,secure:Number(cfg.smtp_port)===465,auth:cfg.smtp_user?{user:cfg.smtp_user,pass:cfg.smtp_pass}:undefined});
    await transport.sendMail({from:`${fromName} <${fromEmail}>`,to,subject,text:body||'',html:htmlBody,replyTo:tenant.reply_to_email||fromEmail});
  }else throw new Error('Unsupported email provider.');
}
