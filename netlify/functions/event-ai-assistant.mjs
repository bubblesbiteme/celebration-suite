import {json,supabase,clean} from './_shared.mjs';
import {tenantContext,requireActive,requirePermission,assertEventAccess} from './_tenant.mjs';

const enc=encodeURIComponent;
const one=async path=>(await supabase(path))?.[0]||null;
const trim=(v,n=4000)=>String(v??'').slice(0,n);
const validReview=new Set(['unreviewed','approved','discarded']);
const n=v=>Number(v)||0;

function outputText(payload){
  if(payload?.output_text)return payload.output_text;
  const parts=[];
  for(const item of payload?.output||[])for(const content of item?.content||[])if(content?.type==='output_text'&&content?.text)parts.push(content.text);
  return parts.join('\n').trim();
}
function redact(value){
  if(value==null)return value;
  if(Array.isArray(value))return value.map(redact);
  if(typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[/email|phone|address|contact/i.test(k)?'[REDACTED]':redact(v),k]).map(([v,k])=>[k,v]));
  if(typeof value==='string')return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[REDACTED EMAIL]').replace(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/g,'[REDACTED PHONE]');
  return value;
}
async function audit(ctx,eventId,action,details={},conversationId=null){
  await supabase('tenant_event_ai_audit_log',{method:'POST',body:{tenant_id:ctx.tenant.id,event_id:eventId,conversation_id:conversationId,action,actor_user_id:ctx.user.id,details},prefer:'return=minimal'}).catch(()=>{});
}
async function contextFor(ctx,eventId,settings){
  const e=await one(`tenant_events?id=eq.${enc(eventId)}&tenant_id=eq.${enc(ctx.tenant.id)}&select=*&limit=1`);
  if(!e)throw Object.assign(new Error('Event not found.'),{status:404});
  const w=e.workspace_data&&typeof e.workspace_data==='object'?e.workspace_data:{};
  const [vendors,questionnaires,invoices,payments,documents,messages,expenses,incidents,staff,approvals,changes,inventory]=await Promise.all([
    supabase(`tenant_vendors?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=*&limit=300`).catch(()=>[]),
    supabase(`tenant_questionnaires?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=*&limit=200`).catch(()=>[]),
    settings.allow_financial_data?supabase(`tenant_invoices?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=*&limit=300`).catch(()=>[]):[],
    settings.allow_financial_data?supabase(`tenant_payments?tenant_id=eq.${enc(ctx.tenant.id)}&select=*&limit=500`).catch(()=>[]):[],
    supabase(`tenant_documents?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=title,category,visibility,status,notes,created_at&limit=300`).catch(()=>[]),
    settings.allow_client_data?supabase(`tenant_messages?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=direction,channel,sender,recipient,body,created_at&order=created_at.desc&limit=120`).catch(()=>[]):[],
    settings.allow_financial_data?supabase(`tenant_event_expenses?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=*&limit=300`).catch(()=>[]):[],
    supabase(`tenant_event_incidents?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=*&limit=120`).catch(()=>[]),
    supabase(`tenant_event_assignments?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=assignment_role,call_time,shift_end,is_lead,notes&limit=150`).catch(()=>[]),
    supabase(`tenant_approvals?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=*&limit=200`).catch(()=>[]),
    supabase(`tenant_change_orders?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=*&limit=200`).catch(()=>[]),
    supabase(`tenant_inventory_reservations?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=*&limit=500`).catch(()=>[])
  ]);
  const invoiceIds=new Set(invoices.map(x=>x.id));
  const context={event:{id:e.id,title:e.title,event_type:e.event_type,event_date:e.event_date,venue:e.venue,guest_count:e.guest_count,status:e.status,client_name:e.client_name,client_email:e.client_email,service_fee:e.service_fee,client_decor_budget:e.client_decor_budget,contract_total:e.contract_total},tasks:w.checklist||[],timeline:w.timeline||[],notes:settings.allow_internal_notes===false?[]:(w.notes||[]),budget:settings.allow_financial_data?(w.budget||{}):{},vendors,questionnaires:settings.allow_client_data?questionnaires.map(q=>({...q,draft_answers:undefined})):questionnaires.map(q=>({id:q.id,title:q.title,status:q.status,due_date:q.due_date})),invoices,payments:payments.filter(p=>invoiceIds.has(p.invoice_id)),expenses,documents,messages,incidents,staff,approvals,change_orders:changes,inventory_reservations:inventory};
  return settings.redact_contact_details===false?context:redact(context);
}
function instructions(mode){return `You are the Celebration Suite Event Assistant supporting a professional event planner. Use only the event data supplied in this request. Never claim an external action was completed. Never send messages, modify records, approve expenses, or make commitments. Clearly label assumptions and missing information. Protect client privacy. Give practical, concise planning output. Any client or vendor communication must be a reviewable draft only. Current mode: ${mode}.`;}

export default async request=>{try{
  const ctx=await tenantContext(request);requireActive(ctx);requirePermission(ctx,'manage_events');
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  const body=await request.json().catch(()=>({})),eventId=body.booking_id||body.event_id;
  if(!eventId)return json({error:'event_id is required'},400);
  await assertEventAccess(ctx,eventId);
  if(body.action==='settings'){
    const retention=Math.min(3650,Math.max(7,Number(body.retention_days)||90));
    const row={tenant_id:ctx.tenant.id,event_id:eventId,is_enabled:body.is_enabled!==false,allow_client_data:body.allow_client_data!==false,allow_financial_data:body.allow_financial_data!==false,allow_internal_notes:body.allow_internal_notes!==false,redact_contact_details:body.redact_contact_details!==false,retention_days:retention,require_approval:true,updated_at:new Date().toISOString()};
    await supabase('tenant_event_ai_settings?on_conflict=tenant_id,event_id',{method:'POST',body:row,prefer:'resolution=merge-duplicates,return=representation'});
    await audit(ctx,eventId,'settings_updated',{allow_client_data:row.allow_client_data,allow_financial_data:row.allow_financial_data,allow_internal_notes:row.allow_internal_notes,redact_contact_details:row.redact_contact_details,retention_days:retention,is_enabled:row.is_enabled});
    return json({ok:true,settings:row});
  }
  if(body.action==='review'){
    if(!body.conversation_id)throw new Error('conversation_id is required.');
    const status=validReview.has(body.review_status)?body.review_status:'unreviewed';
    const current=await one(`tenant_event_ai_conversations?id=eq.${enc(body.conversation_id)}&tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=id&limit=1`);if(!current)throw new Error('AI response not found.');
    await supabase(`tenant_event_ai_conversations?id=eq.${enc(current.id)}`,{method:'PATCH',body:{review_status:status,reviewed_at:status==='unreviewed'?null:new Date().toISOString(),reviewed_by_user_id:status==='unreviewed'?null:ctx.user.id},prefer:'return=minimal'});
    await audit(ctx,eventId,'response_reviewed',{review_status:status},current.id);return json({ok:true});
  }
  if(body.action==='delete'){
    const current=await one(`tenant_event_ai_conversations?id=eq.${enc(body.conversation_id||'')}&tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=id&limit=1`);if(!current)throw new Error('AI response not found.');
    await audit(ctx,eventId,'response_deleted',{},current.id);await supabase(`tenant_event_ai_conversations?id=eq.${enc(current.id)}`,{method:'DELETE',prefer:'return=minimal'});return json({ok:true});
  }
  if(body.action==='purge'||body.action==='purge_all'){
    let settings=await one(`tenant_event_ai_settings?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=*&limit=1`);const days=Math.min(3650,Math.max(7,Number(settings?.retention_days)||90));
    const extra=body.action==='purge'?`&created_at=lt.${enc(new Date(Date.now()-days*86400000).toISOString())}`:'';
    const old=await supabase(`tenant_event_ai_conversations?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}${extra}&select=id`).catch(()=>[]);
    await supabase(`tenant_event_ai_conversations?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}${extra}`,{method:'DELETE',prefer:'return=minimal'});
    await audit(ctx,eventId,body.action==='purge'?'history_purged':'history_purged_all',{retention_days:days,deleted_count:old.length});return json({ok:true,deleted_count:old.length});
  }
  const apiKey=process.env.OPENAI_API_KEY;if(!apiKey)return json({error:'OPENAI_API_KEY is not configured for the AI Event Assistant.'},503);
  const model=process.env.OPENAI_MODEL||'gpt-5-mini';
  let settings=await one(`tenant_event_ai_settings?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=*&limit=1`);
  if(!settings){settings={tenant_id:ctx.tenant.id,event_id:eventId,is_enabled:true,allow_client_data:true,allow_financial_data:true,allow_internal_notes:true,redact_contact_details:true,retention_days:90,require_approval:true};await supabase('tenant_event_ai_settings',{method:'POST',body:settings,prefer:'return=minimal'}).catch(()=>{});}
  if(settings.is_enabled===false)return json({error:'AI is disabled for this event.'},403);
  const prompt=clean(body.prompt,8000);if(!prompt)return json({error:'Enter a question or instruction.'},400);
  const mode=['general','summary','risks','timeline','tasks','email','vendor','budget','event_day'].includes(body.mode)?body.mode:'general';
  const eventContext=await contextFor(ctx,eventId,settings),contextFlags={client_data:settings.allow_client_data!==false,financial_data:settings.allow_financial_data!==false,internal_notes:settings.allow_internal_notes!==false,contact_details_redacted:settings.redact_contact_details!==false};
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{authorization:`Bearer ${apiKey}`,'content-type':'application/json'},body:JSON.stringify({model,instructions:instructions(mode),input:`PLANNER REQUEST:\n${prompt}\n\nEVENT DATA (JSON):\n${trim(JSON.stringify(eventContext),60000)}`,max_output_tokens:1800})});
  const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload?.error?.message||`AI request failed (${response.status}).`);const answer=outputText(payload);if(!answer)throw new Error('The AI response was empty.');const usage=payload.usage||{};
  const saved=await supabase('tenant_event_ai_conversations',{method:'POST',body:{tenant_id:ctx.tenant.id,event_id:eventId,mode,prompt,response:answer,model,input_tokens:usage.input_tokens||null,output_tokens:usage.output_tokens||null,created_by_user_id:ctx.user.id,review_status:'unreviewed',context_flags:contextFlags},prefer:'return=representation'});const conversation=saved?.[0]||null;
  await audit(ctx,eventId,'response_generated',{mode,model,input_tokens:usage.input_tokens||null,output_tokens:usage.output_tokens||null,context_flags:contextFlags},conversation?.id||null);
  return json({ok:true,answer,conversation,model});
}catch(e){return json({error:e.message||'AI assistant failed.'},e.status||500)}};
