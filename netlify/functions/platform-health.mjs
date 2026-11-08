import {getSupabaseConfig} from './_shared.mjs';
const json=(status,body)=>({statusCode:status,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify(body)});
const env=k=>process.env[k]||'';
function siteUrl(event){return env('SITE_URL')||`${event.headers?.['x-forwarded-proto']||'https'}://${event.headers?.host||''}`}
async function requirePlatform(event){const r=await fetch(siteUrl(event).replace(/\/$/,'')+'/.netlify/functions/platform-auth-session',{headers:{cookie:event.headers.cookie||''}});if(!r.ok)throw Object.assign(new Error('Unauthorized'),{status:401});return r.json().catch(()=>({ok:true}))}
async function supa(path,opts={}){const {url,key}=getSupabaseConfig();const r=await fetch(url.replace(/\/$/,'')+path,{...opts,headers:{apikey:key,...(String(key).startsWith('sb_')?{}:{authorization:`Bearer ${key}`}),'content-type':'application/json',prefer:opts.prefer||'return=representation',...(opts.headers||{})}});const text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}if(!r.ok){const e=new Error(data?.message||data?.error_description||data?.error||`Supabase request failed (${r.status})`);e.status=r.status;throw e}return data}
async function table(name,query='select=*'){try{return await supa(`/rest/v1/${name}?${query}`)}catch{return []}}
const group=(rows,key='tenant_id')=>{const out={};for(const r of rows||[]){const k=r?.[key];if(!k)continue;(out[k]||(out[k]=[])).push(r)}return out};
const lower=v=>String(v||'').toLowerCase();
export async function handler(event){try{await requirePlatform(event);if(event.httpMethod!=='GET')return json(405,{error:'Method not allowed'});
 const [tenants,users,licenses,events,clients,clientUsers,clientAccess,integrations,webhookDeliveries,errors,support,items,reservations,documents,floorplans,boards,boardItems]=await Promise.all([
  table('tenants','select=id,business_name,status,created_at,updated_at&limit=2000'),
  table('tenant_users','select=id,tenant_id,email,role,status,last_login_at,created_at&limit=10000'),
  table('licenses','select=id,tenant_id,plan_type,status,expires_at,current_period_end,created_at&limit=5000'),
  table('tenant_events','select=id,tenant_id,title,event_date,status,updated_at&limit=10000'),
  table('tenant_clients','select=id,tenant_id,email,created_at&limit=10000'),
  table('tenant_client_users','select=id,tenant_id,email,status,last_login_at,created_at&limit=10000'),
  table('tenant_client_event_access','select=id,tenant_id,client_user_id,event_id,created_at&limit=20000'),
  table('tenant_integrations','select=id,tenant_id,kind,status,updated_at,created_at&limit=10000'),
  table('tenant_webhook_deliveries','select=id,tenant_id,status_code,error,attempted_at,event_type&order=attempted_at.desc&limit=5000'),
  table('platform_error_logs','select=id,tenant_id,message,level,created_at,resolved_at&order=created_at.desc&limit=5000'),
  table('tenant_support_tickets','select=id,tenant_id,status,priority,created_at,updated_at&limit=5000'),
  table('tenant_inventory_items','select=id,tenant_id,name,quantity,is_active&limit=20000'),
  table('tenant_inventory_reservations','select=id,tenant_id,event_id,inventory_item_id,quantity,manual_quantity,design_quantity,reservation_status&limit=50000'),
  table('tenant_documents','select=id,tenant_id,event_id,title,created_at&limit=20000'),
  table('tenant_floorplans','select=id,tenant_id,event_id,name,updated_at&limit=10000'),
  table('tenant_inspiration_boards','select=id,tenant_id,event_id,updated_at&limit=10000'),
  table('tenant_inspiration_items','select=id,tenant_id,event_id,inventory_item_id,updated_at&limit=30000')
 ]);
 const g={users:group(users),licenses:group(licenses),events:group(events),clients:group(clients),clientUsers:group(clientUsers),access:group(clientAccess),integrations:group(integrations),hooks:group(webhookDeliveries),errors:group(errors),support:group(support),items:group(items),reservations:group(reservations),documents:group(documents),floorplans:group(floorplans),boards:group(boards),boardItems:group(boardItems)};
 const allEvents=new Set(events.map(x=>x.id)),allClientUsers=new Set(clientUsers.map(x=>x.id)),allItems=new Set(items.map(x=>x.id));
 const now=Date.now(),day=86400000;
 const rows=tenants.map(t=>{const id=t.id,tu=g.users[id]||[],tl=g.licenses[id]||[],te=g.events[id]||[],ti=g.integrations[id]||[],th=g.hooks[id]||[],terr=g.errors[id]||[],ts=g.support[id]||[],tr=g.reservations[id]||[],td=g.documents[id]||[],tf=g.floorplans[id]||[],tb=g.boards[id]||[],tbi=g.boardItems[id]||[],ta=g.access[id]||[];
   const usable=tl.find(l=>['active','grace','past_due'].includes(lower(l.status))&&(!l.expires_at||Date.parse(l.expires_at)>now))||tl.find(l=>['active','grace','past_due'].includes(lower(l.status)))||tl[0]||null;
   const intMap={};for(const x of ti)intMap[lower(x.kind||x.provider||x.type)]=x;
   const failedHooks=th.filter(x=>Number(x.status_code||0)>=400||x.error).filter(x=>!x.attempted_at||Date.parse(x.attempted_at)>now-7*day);
   const recentErrors=terr.filter(x=>!x.resolved_at&&(!x.created_at||Date.parse(x.created_at)>now-14*day));
   const openSupport=ts.filter(x=>!['resolved','closed'].includes(lower(x.status)));
   const staleUsers=tu.filter(x=>lower(x.status)!=='disabled'&&x.last_login_at&&Date.parse(x.last_login_at)<now-90*day);
   const orphanAccess=ta.filter(x=>(x.event_id&&!allEvents.has(x.event_id))||(x.client_user_id&&!allClientUsers.has(x.client_user_id)));
   const orphanReservations=tr.filter(x=>(x.event_id&&!allEvents.has(x.event_id))||(x.inventory_item_id&&!allItems.has(x.inventory_item_id)));
   const overReservations=tr.filter(x=>{if(!x.inventory_item_id)return false;const item=items.find(i=>i.id===x.inventory_item_id);if(!item)return false;const qty=Number((x.quantity ?? (Number(x.manual_quantity||0)+Number(x.design_quantity||0))) || 0);return qty>Number(item.quantity||0)});
   const orphanDocuments=td.filter(x=>x.event_id&&!allEvents.has(x.event_id));
   const orphanFloorplans=tf.filter(x=>x.event_id&&!allEvents.has(x.event_id));
   const orphanBoards=tb.filter(x=>x.event_id&&!allEvents.has(x.event_id));
   const orphanBoardItems=tbi.filter(x=>x.event_id&&!allEvents.has(x.event_id));
   const warnings=[];
   if(!usable||!['active','grace','past_due'].includes(lower(usable.status)))warnings.push('No usable license');
   if(failedHooks.length)warnings.push(`${failedHooks.length} webhook failure${failedHooks.length===1?'':'s'} (7d)`);
   if(recentErrors.length)warnings.push(`${recentErrors.length} unresolved runtime error${recentErrors.length===1?'':'s'} (14d)`);
   if(openSupport.length)warnings.push(`${openSupport.length} open support ticket${openSupport.length===1?'':'s'}`);
   const integrityCount=orphanAccess.length+orphanReservations.length+overReservations.length+orphanDocuments.length+orphanFloorplans.length+orphanBoards.length+orphanBoardItems.length;
   if(integrityCount)warnings.push(`${integrityCount} data-integrity warning${integrityCount===1?'':'s'}`);
   const configured=['google_calendar','quickbooks','stripe','resend','telnyx'].filter(k=>intMap[k]);
   const score=Math.max(0,100-(usable?0:35)-Math.min(20,recentErrors.length*5)-Math.min(15,failedHooks.length*3)-Math.min(15,openSupport.length*3)-Math.min(15,integrityCount*3));
   return {tenant_id:id,business_name:t.business_name||'Tenant',status:t.status||'',score,warnings,counts:{users:tu.length,events:te.length,open_support:openSupport.length,unresolved_errors:recentErrors.length,webhook_failures_7d:failedHooks.length,integrity_warnings:integrityCount,stale_users_90d:staleUsers.length},license:usable?{id:usable.id,plan:usable.plan_type||'',status:usable.status,expires_at:usable.expires_at||usable.current_period_end||null}:null,integrations:{configured,missing:['google_calendar','quickbooks','stripe','resend','telnyx'].filter(k=>!intMap[k])},integrity:{orphan_client_access:orphanAccess.length,orphan_reservations:orphanReservations.length,over_quantity_reservations:overReservations.length,orphan_documents:orphanDocuments.length,orphan_floorplans:orphanFloorplans.length,orphan_design_boards:orphanBoards.length,orphan_design_items:orphanBoardItems.length}};
 });
 return json(200,{generated_at:new Date().toISOString(),summary:{tenants:rows.length,healthy:rows.filter(x=>x.score>=90&&!x.warnings.length).length,attention:rows.filter(x=>x.score<90||x.warnings.length).length},tenants:rows.sort((a,b)=>a.score-b.score||a.business_name.localeCompare(b.business_name))});
 }catch(e){return json(e.status||500,{error:e.message||'Unable to calculate platform health.'})}}
