import {json,supabase,clean} from './_shared.mjs';
import {tenantContext,requireActive,requirePermission} from './_tenant.mjs';
import {sendTenantEmail} from './_mailer.mjs';
import {decrypt} from './_crypto.mjs';
const enc=encodeURIComponent;
async function sms(ctx,to,body){const i=(await supabase(`tenant_integrations?tenant_id=eq.${enc(ctx.tenant.id)}&kind=eq.sms&select=*&limit=1`))?.[0];if(!i)throw new Error('Connect SMS first.');const cfg=JSON.parse(decrypt(i.config_encrypted)||'{}');const r=await fetch('https://api.telnyx.com/v2/messages',{method:'POST',headers:{authorization:`Bearer ${cfg.api_key}`,'content-type':'application/json'},body:JSON.stringify({from:cfg.from_number,to,text:body})});if(!r.ok)throw new Error('SMS provider rejected the message.');return (await r.json().catch(()=>({})))?.data?.id||null;}
export default async request=>{try{const ctx=await tenantContext(request);requireActive(ctx);requirePermission(ctx,'manage_events');
 if(request.method==='GET'){
  const [events,leads,logs]=await Promise.all([
   supabase(`tenant_events?tenant_id=eq.${enc(ctx.tenant.id)}&select=id,title,client_name,client_email,client_phone,event_date,status&order=created_at.desc&limit=500`),
   supabase(`tenant_leads?tenant_id=eq.${enc(ctx.tenant.id)}&select=id,full_name,email,phone,event_type,event_date,stage,source,created_at&order=created_at.desc&limit=500`).catch(()=>[]),
   supabase(`tenant_messages?tenant_id=eq.${enc(ctx.tenant.id)}&select=*&order=created_at.desc&limit=2000`).catch(()=>[])
  ]);
  const bookings=(events||[]).map(e=>({id:e.id,reference:e.id,package_name:e.title,customer_name:e.client_name,customer_email:e.client_email,customer_phone:e.client_phone,event_date:e.event_date,status:e.status}));
  const mapped=(logs||[]).map(m=>({id:m.id,booking_id:m.event_id,lead_id:m.lead_id,team_member_id:null,direction:m.direction,channel:m.channel,contact_type:m.event_id?'client':m.lead_id?'lead':'custom',contact_name:m.sender||null,contact_email:m.channel==='email'?(m.direction==='inbound'?m.sender:m.recipient):null,contact_phone:m.channel==='sms'?(m.direction==='inbound'?m.sender:m.recipient):null,subject:m.subject,body:m.body,status:m.status,provider:m.provider,provider_message_id:m.provider_message_id,match_status:m.match_status||'matched',created_at:m.created_at,source:'log'}));
  return json({bookings,leads,partners:[],logs:mapped,messages:[],notifications:[],emails:[]});
 }
 const d=await request.json().catch(()=>({}));
 if(d.action==='match_inbound'){const patch={match_status:d.kind==='ignore'?'ignored':'matched'};if(d.kind==='booking')patch.event_id=d.target_id||null;if(d.kind==='lead')patch.lead_id=d.target_id||null;await supabase(`tenant_messages?id=eq.${enc(d.id)}&tenant_id=eq.${enc(ctx.tenant.id)}`,{method:'PATCH',body:patch,prefer:'return=minimal'});return json({ok:true});}
 if(d.action!=='send')return json({error:'Unknown action'},400);
 const channel=['email','sms','portal','note'].includes(d.channel)?d.channel:'email';let eventId=d.booking_id||null,leadId=d.lead_id||null,name=clean(d.contact_name,180),email=clean(d.email,180).toLowerCase(),phone=clean(d.phone,80);
 if(eventId){const e=(await supabase(`tenant_events?id=eq.${enc(eventId)}&tenant_id=eq.${enc(ctx.tenant.id)}&select=*&limit=1`))?.[0];if(e){name=name||e.client_name||'';email=email||String(e.client_email||'').toLowerCase();phone=phone||e.client_phone||'';}}
 if(leadId){const l=(await supabase(`tenant_leads?id=eq.${enc(leadId)}&tenant_id=eq.${enc(ctx.tenant.id)}&select=*&limit=1`))?.[0];if(l){name=name||l.full_name||'';email=email||String(l.email||'').toLowerCase();phone=phone||l.phone||'';}}
 const subject=clean(d.subject,240)||'A message from Celebration Suite',body=clean(d.body,12000);if(!body)throw new Error('Message is required.');let providerId=null,status='sent';
 if(channel==='email'){if(!email)throw new Error('Recipient email is required.');await sendTenantEmail(ctx.tenant,{to:email,subject,body});}
 else if(channel==='sms'){if(!phone)throw new Error('Recipient phone is required.');providerId=await sms(ctx,phone,`${subject}: ${body}`);}
 await supabase('tenant_messages',{method:'POST',body:{tenant_id:ctx.tenant.id,event_id:eventId,lead_id:leadId,channel:channel==='portal'?'note':channel,direction:channel==='note'?'internal':'outbound',recipient:email||phone||name||null,subject,body,status,provider:channel==='sms'?'telnyx':channel==='email'?'email':channel,provider_message_id:providerId,sent_at:new Date().toISOString(),match_status:'matched'}});return json({ok:true});
}catch(e){return json({error:e.message},e.status||500)}};
