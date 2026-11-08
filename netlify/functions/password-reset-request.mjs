import {createHash,randomBytes} from 'node:crypto';
import {json,supabase,clean} from './_shared.mjs';
import {sendPlatformEmail,brandedEmail,platformEmailConfigured} from './_platform_mailer.mjs';
const generic=()=>json({ok:true,message:'If a matching account exists, a password reset email has been sent.'});
const hash=t=>createHash('sha256').update(t).digest('hex');
export default async request=>{try{
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  if(!platformEmailConfigured())return json({error:'Password reset email is not configured yet. Contact support.'},503);
  const d=await request.json(),email=clean(d.email,180).toLowerCase(),type=['tenant','platform','client'].includes(d.account_type)?d.account_type:'tenant',portal=clean(d.portal_token,120);
  if(!email)return generic(); let user=null,tenantId=null,context={};
  if(type==='tenant')user=(await supabase(`tenant_users?email=ilike.${encodeURIComponent(email)}&status=eq.active&select=id,tenant_id,email,full_name&limit=1`))?.[0],tenantId=user?.tenant_id||null;
  if(type==='platform')user=(await supabase(`platform_admins?email=ilike.${encodeURIComponent(email)}&status=eq.active&select=id,email,full_name&limit=1`))?.[0];
  if(type==='client'&&portal){const ev=(await supabase(`tenant_events?client_portal_token=eq.${encodeURIComponent(portal)}&select=id,tenant_id,client_email,title&limit=1`))?.[0];if(ev&&String(ev.client_email||'').toLowerCase()===email){user=(await supabase(`tenant_client_users?tenant_id=eq.${encodeURIComponent(ev.tenant_id)}&email=ilike.${encodeURIComponent(email)}&status=eq.active&select=id,tenant_id,email,full_name&limit=1`))?.[0];tenantId=ev.tenant_id;context={portal_token:portal,event_id:ev.id,event_title:ev.title||''}}}
  if(!user)return generic();
  const raw=randomBytes(32).toString('hex'),tokenHash=hash(raw),expires=new Date(Date.now()+24*60*60*1000).toISOString();
  await supabase('password_reset_tokens',{method:'POST',body:{account_type:type,user_id:user.id,tenant_id:tenantId,email:user.email,token_hash:tokenHash,context,expires_at:expires,request_ip:(request.headers.get('x-nf-client-connection-ip')||'').slice(0,100)},prefer:'return=minimal'});
  const base=new URL(request.url).origin,params=new URLSearchParams({token:raw,type});if(context.portal_token)params.set('portal',context.portal_token);const resetUrl=`${base}/reset-password.html?${params}`;
  const html=brandedEmail({heading:'Reset your password',body:`<p>We received a request to reset the password for <strong>${user.email}</strong>.</p><p>This secure link expires in 24 hours. If you did not request a reset, you can ignore this email.</p>`,buttonLabel:'Reset Password',buttonUrl:resetUrl,footer:'Celebration Suite security · by Sage &amp; Celebration'});
  await sendPlatformEmail({to:user.email,subject:'Reset your Celebration Suite password',html,text:`Reset your Celebration Suite password: ${resetUrl}\n\nThis link expires in 24 hours.`});
  return generic();
}catch(e){return json({error:e.message},500)}};
