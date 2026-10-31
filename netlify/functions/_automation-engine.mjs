import {supabase} from './_shared.mjs';import {sendTenantEmail} from './_mailer.mjs';
const day=v=>new Date(v).toISOString().slice(0,10),today=()=>new Date().toISOString().slice(0,10),money=v=>`$${Number(v||0).toFixed(2)}`;
async function ownerEmail(tenantId){const rows=await supabase(`tenant_users?tenant_id=eq.${encodeURIComponent(tenantId)}&role=eq.owner&status=eq.active&select=email&limit=1`);return rows?.[0]?.email||null}
async function already(tenantId,key){const rows=await supabase(`tenant_automation_runs?tenant_id=eq.${encodeURIComponent(tenantId)}&dedupe_key=eq.${encodeURIComponent(key)}&select=id&limit=1`);return Boolean(rows?.length)}
async function log(tenantId,rule,entityType,entityId,key,status,detail){try{await supabase('tenant_automation_runs',{method:'POST',body:{tenant_id:tenantId,rule_id:rule?.id||null,entity_type:entityType||null,entity_id:entityId||null,dedupe_key:key,status,detail:detail||null},prefer:'return=minimal'})}catch{}}
async function send(tenant,rule,to,subject,body,entityType,entityId,key){if(await already(tenant.id,key))return;try{if(!to){await log(tenant.id,rule,entityType,entityId,key,'skipped','No recipient email.');return}await sendTenantEmail(tenant,{to,subject,body});await log(tenant.id,rule,entityType,entityId,key,'sent',`Sent to ${to}`)}catch(e){await log(tenant.id,rule,entityType,entityId,key,'failed',String(e.message||e).slice(0,1000))}}
export async function runTenantAutomations(tenant,rules){const owner=await ownerEmail(tenant.id),now=new Date(),todayKey=today();let actions=0;
 for(const rule of rules.filter(r=>r.enabled)){
  const cfg=rule.config||{};
  if(rule.rule_type==='stale_lead'){
   const days=Math.max(1,Number(cfg.days)||3),cutoff=new Date(Date.now()-days*86400000).toISOString();const leads=await supabase(`tenant_leads?tenant_id=eq.${encodeURIComponent(tenant.id)}&stage=in.(new_inquiry,contacted,consultation,proposal_sent,negotiating)&updated_at=lt.${encodeURIComponent(cutoff)}&select=*&limit=200`);
   for(const lead of leads||[]){const key=`stale-lead:${lead.id}:${todayKey}`;await send(tenant,rule,owner,`Follow up: ${lead.full_name}`,`${lead.full_name} has been inactive in your lead pipeline for at least ${days} day${days===1?'':'s'}.\n\nStage: ${lead.stage}\nEvent: ${lead.event_type||'Not specified'}\nNext follow-up: ${lead.next_follow_up||'Not scheduled'}`, 'lead',lead.id,key);actions++}
  }
  if(rule.rule_type==='agreement_signed'){
   const contracts=await supabase(`tenant_contracts?tenant_id=eq.${encodeURIComponent(tenant.id)}&status=eq.signed&signed_at=not.is.null&select=*&limit=200`);for(const c of contracts||[]){const key=`agreement-signed:${c.id}`;await send(tenant,rule,owner,`Agreement signed: ${c.title}`,`${c.client_name||'A client'} signed ${c.title}.

Open the event workspace to begin kickoff tasks.`, 'contract',c.id,key);actions++}
  }
  if(rule.rule_type==='invoice_due'){
   const days=Math.max(0,Number(cfg.days_before)||7),future=new Date(Date.now()+days*86400000).toISOString().slice(0,10);const invoices=await supabase(`tenant_invoices?tenant_id=eq.${encodeURIComponent(tenant.id)}&status=in.(sent,partial)&due_date=gte.${todayKey}&due_date=lte.${future}&select=*&limit=300`);for(const inv of invoices||[]){const key=`invoice-due:${inv.id}:${inv.due_date}`;await send(tenant,rule,inv.client_email,`Upcoming payment due: ${inv.invoice_number}`,`Hello ${inv.client_name||'there'},

Invoice ${inv.invoice_number} for ${money(inv.amount)} is due ${inv.due_date}.

Thank you,
${tenant.business_name}`,'invoice',inv.id,key);actions++}
  }
  if(rule.rule_type==='questionnaire_followup'){
   const days=Math.max(1,Number(cfg.days)||3),cut=new Date(Date.now()-days*86400000).toISOString();const qs=await supabase(`tenant_questionnaires?tenant_id=eq.${encodeURIComponent(tenant.id)}&status=in.(sent,in_progress)&sent_at=lt.${encodeURIComponent(cut)}&select=*&limit=300`);for(const q of qs||[]){const ev=(await supabase(`tenant_events?id=eq.${encodeURIComponent(q.event_id)}&tenant_id=eq.${encodeURIComponent(tenant.id)}&select=client_name,client_email,title&limit=1`))?.[0];const key=`questionnaire-followup:${q.id}:${todayKey}`;await send(tenant,rule,ev?.client_email,`Questionnaire reminder: ${q.title}`,`Hello ${ev?.client_name||'there'},

Your ${q.title} questionnaire for ${ev?.title||'your event'} is still awaiting completion. Please open your client portal when you have a moment.`, 'questionnaire',q.id,key);actions++}
  }
  if(rule.rule_type==='overdue_task'){
   const events=await supabase(`tenant_events?tenant_id=eq.${encodeURIComponent(tenant.id)}&status=eq.active&select=*&limit=500`);for(const ev of events||[]){for(const task of ev.workspace_data?.checklist||[]){if(task.done||task.status==='done'||!task.due_date||task.due_date>=todayKey)continue;const key=`overdue-task:${ev.id}:${task.id||task.title}:${todayKey}`;await send(tenant,rule,owner,`Overdue task: ${task.title||'Event task'}`,`${ev.title}

${task.title||'Event task'} was due ${task.due_date}.`, 'event',ev.id,key);actions++}}
  }
  if(rule.rule_type==='vendor_document_due'){
   const days=Math.max(1,Number(cfg.days_before)||30),future=new Date(Date.now()+days*86400000).toISOString().slice(0,10);const docs=await supabase(`tenant_documents?tenant_id=eq.${encodeURIComponent(tenant.id)}&vendor_id=not.is.null&expiration_date=gte.${todayKey}&expiration_date=lte.${future}&status=neq.archived&select=*&limit=300`);for(const doc of docs||[]){const key=`vendor-doc:${doc.id}:${doc.expiration_date}`;await send(tenant,rule,owner,`Vendor document expiring: ${doc.title}`,`${doc.title} expires ${doc.expiration_date}. Review the Vendor/Document Vault before the event.`, 'document',doc.id,key);actions++}
  }
  if(rule.rule_type==='overdue_invoice'){
   const invoices=await supabase(`tenant_invoices?tenant_id=eq.${encodeURIComponent(tenant.id)}&status=in.(sent,partial,overdue)&due_date=lt.${todayKey}&select=*&limit=300`);
   for(const inv of invoices||[]){const key=`invoice-reminder:${inv.id}:${todayKey}`;await send(tenant,rule,inv.client_email,`Payment reminder: ${inv.invoice_number}`,`Hello ${inv.client_name||'there'},\n\nThis is a reminder that invoice ${inv.invoice_number} for ${money(inv.amount)} was due ${inv.due_date}. Please contact ${tenant.business_name} if you have questions or have already arranged payment.\n\nThank you,\n${tenant.business_name}`,'invoice',inv.id,key);actions++}
  }
  if(rule.rule_type==='event_countdown'){
   const daysList=Array.isArray(cfg.days)?cfg.days.map(Number):[30,14,7,1];const events=await supabase(`tenant_events?tenant_id=eq.${encodeURIComponent(tenant.id)}&status=eq.active&event_date=not.is.null&select=*&limit=500`);
   for(const ev of events||[]){const diff=Math.round((new Date(ev.event_date+'T12:00:00')-new Date(new Date().toISOString().slice(0,10)+'T12:00:00'))/86400000);if(!daysList.includes(diff))continue;const recipients=cfg.recipient==='client'?[ev.client_email]:cfg.recipient==='both'?[owner,ev.client_email]:[owner];for(const to of [...new Set(recipients.filter(Boolean))]){const key=`countdown:${ev.id}:${diff}:${to}`;await send(tenant,rule,to,`${ev.title}: ${diff} day${diff===1?'':'s'} to go`,`Your event “${ev.title}” is ${diff} day${diff===1?'':'s'} away.\n\nDate: ${ev.event_date}\nVenue: ${ev.venue||'TBD'}\n\nOpen the planning workspace to review final details.`, 'event',ev.id,key);actions++}}
  }
  if(rule.rule_type==='client_task_reminder'){
   const events=await supabase(`tenant_events?tenant_id=eq.${encodeURIComponent(tenant.id)}&status=eq.active&select=*&limit=500`);for(const ev of events||[]){const tasks=(ev.workspace_data?.checklist||[]).filter(x=>!x.done);for(const task of tasks){const raw=task.due_date||task.due||task.detail||'';const m=String(raw).match(/\d{4}-\d{2}-\d{2}/);if(!m)continue;const due=m[0],windowDays=Math.max(0,Number(cfg.days_before)||1),diff=Math.round((new Date(due+'T12:00:00')-new Date(todayKey+'T12:00:00'))/86400000);if(diff<0||diff>windowDays)continue;const key=`task-reminder:${ev.id}:${task.id||task.title}:${due}`;await send(tenant,rule,ev.client_email,`Upcoming task: ${task.title||'Event task'}`,`Hello ${ev.client_name||'there'},\n\nA planning task for ${ev.title} is due ${due}:\n\n${task.title||'Event task'}\n\nPlease open your client portal or contact ${tenant.business_name} if you need help.`, 'event',ev.id,key);actions++}}
  }
  if(rule.rule_type==='post_event_closeout'){
   const after=Math.max(0,Number(cfg.days_after)||1),cut=new Date(Date.now()-after*86400000).toISOString().slice(0,10);const events=await supabase(`tenant_events?tenant_id=eq.${encodeURIComponent(tenant.id)}&status=eq.active&event_date=lte.${cut}&select=*&limit=200`);
   for(const ev of events||[]){const key=`closeout:${ev.id}`;if(await already(tenant.id,key))continue;try{const guests=await supabase(`tenant_guests?tenant_id=eq.${encodeURIComponent(tenant.id)}&event_id=eq.${encodeURIComponent(ev.id)}&select=id,checked_in_at`),regs=await supabase(`tenant_registrations?tenant_id=eq.${encodeURIComponent(tenant.id)}&event_id=eq.${encodeURIComponent(ev.id)}&select=id,checked_in_at,amount,payment_status`),vendors=await supabase(`tenant_vendors?tenant_id=eq.${encodeURIComponent(tenant.id)}&event_id=eq.${encodeURIComponent(ev.id)}&select=id,contracted_amount,paid_amount`);const summary={guest_count:(guests||[]).length,guest_checked_in:(guests||[]).filter(x=>x.checked_in_at).length,registration_count:(regs||[]).length,registration_checked_in:(regs||[]).filter(x=>x.checked_in_at).length,vendor_count:(vendors||[]).length,vendor_contract_total:(vendors||[]).reduce((s,x)=>s+Number(x.contracted_amount||0),0)};await supabase('tenant_event_closeouts',{method:'POST',body:{tenant_id:tenant.id,event_id:ev.id,status:'completed',completed_at:new Date().toISOString(),summary},prefer:'resolution=merge-duplicates,return=minimal'});await supabase(`tenant_events?id=eq.${encodeURIComponent(ev.id)}&tenant_id=eq.${encodeURIComponent(tenant.id)}`,{method:'PATCH',body:{status:'completed',updated_at:new Date().toISOString()},prefer:'return=minimal'});await log(tenant.id,rule,'event',ev.id,key,'completed','Event marked completed and closeout created.');if(owner)await sendTenantEmail(tenant,{to:owner,subject:`Event closeout completed: ${ev.title}`,body:`${ev.title} has been automatically closed out.\n\nGuests: ${summary.guest_count}\nChecked in: ${summary.guest_checked_in}\nRegistrations: ${summary.registration_count}\nVendors: ${summary.vendor_count}\n\nYou can review or reopen the closeout from your planner dashboard.`}).catch(()=>{});actions++}catch(e){await log(tenant.id,rule,'event',ev.id,key,'failed',String(e.message||e).slice(0,1000))}}
  }
 }
 return{actions};
}
