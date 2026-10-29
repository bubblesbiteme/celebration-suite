import {json,supabase,clean} from './_shared.mjs';
import {readClientSession} from './_session.mjs';
async function context(request,token){
  const s=readClientSession(request);if(!s)throw Object.assign(new Error('Client sign-in required.'),{status:401});
  const event=(await supabase(`tenant_events?client_portal_token=eq.${encodeURIComponent(token)}&tenant_id=eq.${encodeURIComponent(s.tenant_id)}&select=id,tenant_id&limit=1`))?.[0];
  if(!event)throw Object.assign(new Error('Portal not found.'),{status:404});
  const access=(await supabase(`tenant_client_event_access?client_user_id=eq.${encodeURIComponent(s.client_user_id)}&event_id=eq.${encodeURIComponent(event.id)}&select=id&limit=1`))?.[0];
  if(!access)throw Object.assign(new Error('This client account does not have access to this event.'),{status:403});
  const tenant=(await supabase(`tenants?id=eq.${encodeURIComponent(event.tenant_id)}&select=status&limit=1`))?.[0];
  if(tenant?.status!=='active')throw Object.assign(new Error('This planning workspace is temporarily unavailable. Please contact your event planner for assistance.'),{status:402});
  return{s,event};
}
export default async request=>{try{
  const u=new URL(request.url),token=clean(u.searchParams.get('token'),100),type=clean(u.searchParams.get('type')||'message',40);if(!token)throw new Error('Portal token required.');
  const {s,event}=await context(request,token);
  const q=`client_portal_drafts?client_user_id=eq.${encodeURIComponent(s.client_user_id)}&event_id=eq.${encodeURIComponent(event.id)}&draft_type=eq.${encodeURIComponent(type)}`;
  if(request.method==='GET'){
    const row=(await supabase(`${q}&select=draft_data,updated_at&limit=1`))?.[0]||null;return json({draft:row});
  }
  if(request.method==='PUT'){
    const d=await request.json(),draft_data=d?.draft_data&&typeof d.draft_data==='object'?d.draft_data:{};
    const existing=(await supabase(`${q}&select=id&limit=1`))?.[0];
    const body={tenant_id:event.tenant_id,client_user_id:s.client_user_id,event_id:event.id,draft_type:type,draft_data,updated_at:new Date().toISOString()};
    if(existing)await supabase(`client_portal_drafts?id=eq.${encodeURIComponent(existing.id)}`,{method:'PATCH',body,prefer:'return=minimal'});
    else await supabase('client_portal_drafts',{method:'POST',body,prefer:'return=minimal'});
    return json({ok:true,updated_at:body.updated_at});
  }
  if(request.method==='DELETE'){
    await supabase(q,{method:'DELETE',prefer:'return=minimal'});return json({ok:true});
  }
  return json({error:'Method not allowed'},405);
}catch(e){return json({error:e.message},e.status||400)}};
