import {json,supabase,clean} from './_shared.mjs';
import {tenantContext,requireActive,requirePermission,assertEventAccess} from './_tenant.mjs';
const enc=encodeURIComponent;
const now=()=>new Date().toISOString();
const one=async path=>(await supabase(path))?.[0]||null;
const clamp=(s,n=5000)=>String(s??'').slice(0,n);
const uid=p=>`${p}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

function answerPairs(q){
  const answers=q.answers||q.draft_answers||{};
  return (q.questions||[]).map(x=>({question:clamp(x.label,500),answer:Array.isArray(answers[x.id])?answers[x.id].map(v=>clamp(v,1000)):clamp(answers[x.id]||'',3000)})).filter(x=>Array.isArray(x.answer)?x.answer.length:String(x.answer).trim());
}
function deterministicAnalysis(event,q){
  const pairs=answerPairs(q),text=JSON.stringify(pairs).toLowerCase(),flags=[],suggestions=[];
  const holiday=/holiday|christmas|halloween|decor/i.test(event.event_type||'');
  if(!holiday&&!/guest|attendee|people|count/.test(text))flags.push('Guest count is not clearly captured.');
  if(!/budget|price|spend|cost/.test(text))flags.push('Budget information is not clearly captured.');
  if(!/venue|location|address/.test(text))suggestions.push('Confirm venue/location details.');
  if(!/color|style|theme|design/.test(text))suggestions.push('Confirm design direction, colors or theme.');
  if(!/timeline|start|ceremony|reception|time|arrival/.test(text))suggestions.push('Confirm event timing and major schedule milestones.');
  return{flags,suggestions,summary:`${flags.length} review flag${flags.length===1?'':'s'} and ${suggestions.length} planning suggestion${suggestions.length===1?'':'s'}.`,generated_at:now(),source:'rules'};
}
function extractOutputText(payload){
  if(payload?.output_text)return payload.output_text;
  const out=[];for(const item of payload?.output||[])for(const c of item?.content||[])if(c?.type==='output_text'&&c.text)out.push(c.text);return out.join('\n').trim();
}
function parseJsonText(text){
  const raw=String(text||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  try{return JSON.parse(raw)}catch{}
  const a=raw.indexOf('{'),b=raw.lastIndexOf('}');if(a>=0&&b>a)return JSON.parse(raw.slice(a,b+1));
  throw new Error('AI returned an invalid planning draft.');
}
function validDate(v){if(!v)return null;const s=String(v).slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(s)?s:null}
function normalizePlan(raw,event,q){
  const checklist=Array.isArray(raw?.checklist)?raw.checklist.slice(0,80).map((x,i)=>({
    id:clean(x?.id,80)||`draft-task-${i+1}`,title:clean(x?.title,240)||`Planning task ${i+1}`,description:clean(x?.description,3000)||'',due_date:validDate(x?.due_date),priority:['low','normal','high','urgent'].includes(x?.priority)?x.priority:'normal',status:['ideas','needs_client','waiting_vendor','scheduled'].includes(x?.status)?x.status:'ideas',client_visible:x?.client_visible!==false,client_can_complete:!!x?.client_can_complete
  })).filter(x=>x.title):[];
  const timeline=Array.isArray(raw?.timeline)?raw.timeline.slice(0,80).map((x,i)=>({
    id:clean(x?.id,80)||`draft-milestone-${i+1}`,title:clean(x?.title,240)||`Milestone ${i+1}`,milestone_date:validDate(x?.milestone_date),start_time:clean(x?.start_time,20)||null,end_time:clean(x?.end_time,20)||null,notes:clean(x?.notes,3000)||'',category:clean(x?.category,80)||'planning',status:['upcoming','in_progress'].includes(x?.status)?x.status:'upcoming'
  })).filter(x=>x.title):[];
  return{summary:clean(raw?.summary,3000)||'Planning draft generated from questionnaire responses.',assumptions:Array.isArray(raw?.assumptions)?raw.assumptions.map(x=>clean(x,600)).filter(Boolean).slice(0,30):[],checklist,timeline,generated_at:now(),event_date:event.event_date||null,questionnaire_id:q.id,source:raw?.source||'openai'};
}
function fallbackPlan(event,q){
  const base=deterministicAnalysis(event,q),eventDate=event.event_date?new Date(`${event.event_date}T12:00:00Z`):null;
  const offset=(days)=>eventDate?new Date(eventDate.getTime()-days*86400000).toISOString().slice(0,10):null;
  const tasks=(base.suggestions||[]).map((title,i)=>({id:`fallback-${i}`,title,description:'Generated from questionnaire review. Edit before publishing.',due_date:offset(Math.max(7,30-i*7)),priority:'normal',status:'ideas',client_visible:true,client_can_complete:false}));
  if(!tasks.length)tasks.push({id:'fallback-review',title:'Review questionnaire answers and confirm outstanding decisions',description:'Validate client answers, missing details, and dependencies.',due_date:offset(30),priority:'normal',status:'ideas',client_visible:false,client_can_complete:false});
  const timeline=eventDate?[{id:'fallback-final',title:'Final planning confirmation',milestone_date:offset(14),start_time:null,end_time:null,notes:'Confirm final details, vendors, timing, and responsibilities.',category:'planning',status:'upcoming'},{id:'fallback-event',title:event.title||'Event day',milestone_date:event.event_date,start_time:null,end_time:null,notes:'Event date.',category:'event',status:'upcoming'}]:[];
  return normalizePlan({summary:'Fallback planning draft generated because AI was unavailable.',assumptions:base.flags,checklist:tasks,timeline,source:'fallback'},event,q);
}
async function aiPlan(event,q){
  const apiKey=process.env.OPENAI_API_KEY;if(!apiKey)return fallbackPlan(event,q);
  const model=process.env.OPENAI_QUESTIONNAIRE_MODEL||process.env.OPENAI_MODEL||'gpt-6-luna';
  const pairs=answerPairs(q);
  const instructions=`You are Celebration Suite's questionnaire planning assistant for professional event planners. Convert the supplied client questionnaire answers into a practical DRAFT planning checklist and milestone timeline. Use only supplied facts. Do not invent vendor bookings, payments, contacts, approvals, or exact times. If a date is unknown, use null. If an event date is known, choose sensible due dates before it. Include only tasks/milestones that are reasonably supported by the answers or are standard follow-up work clearly needed to complete planning. Flag assumptions instead of presenting them as facts. Return JSON only with this shape: {"summary":"string","assumptions":["string"],"checklist":[{"title":"string","description":"string","due_date":"YYYY-MM-DD or null","priority":"low|normal|high|urgent","status":"ideas|needs_client|waiting_vendor|scheduled","client_visible":true,"client_can_complete":false}],"timeline":[{"title":"string","milestone_date":"YYYY-MM-DD or null","start_time":"HH:MM or null","end_time":"HH:MM or null","notes":"string","category":"planning|vendor|client|payment|design|event","status":"upcoming|in_progress"}]}. Do not wrap the JSON in markdown.`;
  const input={event:{title:event.title,event_type:event.event_type,event_date:event.event_date,venue:event.venue,status:event.status},questionnaire:{title:q.title,answers:pairs}};
  const res=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{authorization:`Bearer ${apiKey}`,'content-type':'application/json'},body:JSON.stringify({model,instructions,input:`EVENT + QUESTIONNAIRE DATA (JSON):\n${clamp(JSON.stringify(input),60000)}`,max_output_tokens:5000})});
  const payload=await res.json().catch(()=>({}));if(!res.ok)throw new Error(payload?.error?.message||`OpenAI request failed (${res.status}).`);
  return normalizePlan(parseJsonText(extractOutputText(payload)),event,q);
}
function cleanDraftPlan(d,event,q){return normalizePlan({summary:d.summary||'',assumptions:d.assumptions||[],checklist:d.checklist||[],timeline:d.timeline||[],source:'planner_reviewed'},event,q)}

export default async request=>{try{
  const ctx=await tenantContext(request);requireActive(ctx);requirePermission(ctx,'manage_events');
  const u=new URL(request.url),rawAction=u.searchParams.get('action')||'',action=rawAction==='create-plan'?'generate-plan':rawAction;
  if(action==='status'&&request.method==='GET')return json({ok:true,configured:!!process.env.OPENAI_API_KEY,model:process.env.OPENAI_QUESTIONNAIRE_MODEL||process.env.OPENAI_MODEL||'gpt-6-luna'});
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  const d=await request.json().catch(()=>({}));if(!d.questionnaire_id)throw new Error('Questionnaire is required.');
  const q=await one(`tenant_questionnaires?id=eq.${enc(d.questionnaire_id)}&tenant_id=eq.${enc(ctx.tenant.id)}&select=*&limit=1`);if(!q)throw new Error('Questionnaire not found.');
  await assertEventAccess(ctx,q.event_id);const event=await one(`tenant_events?id=eq.${enc(q.event_id)}&tenant_id=eq.${enc(ctx.tenant.id)}&select=*&limit=1`);if(!event)throw new Error('Event not found.');
  if(action==='analyze'){
    const result=deterministicAnalysis(event,q);await supabase(`tenant_questionnaires?id=eq.${enc(q.id)}`,{method:'PATCH',body:{analysis:{...(q.analysis||{}),...result},updated_at:now()},prefer:'return=minimal'});return json({ok:true,analysis:result});
  }
  if(action==='generate-plan'){
    if(!['submitted','reviewed'].includes(q.status))return json({error:'The client must submit the questionnaire before a planning draft can be generated.'},400);
    let plan;try{plan=await aiPlan(event,q)}catch(err){plan=fallbackPlan(event,q);plan.ai_error=clean(err.message,600);}
    const analysis={...(q.analysis||{}),plan_draft:plan,plan_generated_at:now()};await supabase(`tenant_questionnaires?id=eq.${enc(q.id)}`,{method:'PATCH',body:{analysis,updated_at:now()},prefer:'return=minimal'});return json({ok:true,plan,ai_configured:!!process.env.OPENAI_API_KEY});
  }
  if(action==='publish-plan'){
    const plan=cleanDraftPlan(d.plan||q.analysis?.plan_draft||{},event,q),w=event.workspace_data&&typeof event.workspace_data==='object'?event.workspace_data:{};
    w.checklist=Array.isArray(w.checklist)?w.checklist:[];w.timeline=Array.isArray(w.timeline)?w.timeline:[];
    const existingTasks=new Set(w.checklist.map(x=>`${String(x.title||'').toLowerCase()}|${x.due_date||''}`));const existingTimeline=new Set(w.timeline.map(x=>`${String(x.title||'').toLowerCase()}|${x.milestone_date||''}`));
    let taskCreated=0,timelineCreated=0;
    for(const x of plan.checklist){const key=`${x.title.toLowerCase()}|${x.due_date||''}`;if(existingTasks.has(key))continue;w.checklist.push({id:uid('task'),title:x.title,status:x.status,assigned_to:null,priority:x.priority,due_date:x.due_date,description:x.description||null,client_can_complete:x.client_can_complete,client_visible:x.client_visible,sort_order:(w.checklist.length+1)*100,source:'questionnaire_ai',questionnaire_id:q.id,created_at:now(),updated_at:now()});existingTasks.add(key);taskCreated++;}
    for(const x of plan.timeline){const key=`${x.title.toLowerCase()}|${x.milestone_date||''}`;if(existingTimeline.has(key))continue;w.timeline.push({id:uid('timeline'),title:x.title,milestone_date:x.milestone_date,start_time:x.start_time,end_time:x.end_time,notes:x.notes||null,category:x.category,status:x.status,sort_order:(w.timeline.length+1)*100,source:'questionnaire_ai',questionnaire_id:q.id});existingTimeline.add(key);timelineCreated++;}
    await supabase(`tenant_events?id=eq.${enc(event.id)}&tenant_id=eq.${enc(ctx.tenant.id)}`,{method:'PATCH',body:{workspace_data:w,updated_at:now()},prefer:'return=minimal'});
    const analysis={...(q.analysis||{}),plan_draft:plan,plan_published_at:now(),published_counts:{checklist:taskCreated,timeline:timelineCreated}};await supabase(`tenant_questionnaires?id=eq.${enc(q.id)}`,{method:'PATCH',body:{analysis,plan_created_at:now(),updated_at:now()},prefer:'return=minimal'});
    return json({ok:true,checklist_created:taskCreated,timeline_created:timelineCreated});
  }
  return json({error:'Method not allowed'},405);
}catch(e){return json({error:e.message||'Questionnaire planning failed.'},e.status||500)}};