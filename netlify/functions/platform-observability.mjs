const json=(status,body)=>({statusCode:status,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify(body)});
const env=(k)=>process.env[k]||'';
function siteUrl(event){return env('SITE_URL')||`${event.headers?.['x-forwarded-proto']||'https'}://${event.headers?.host||''}`}
async function requirePlatform(event){
  const r=await fetch(siteUrl(event).replace(/\/$/,'')+'/.netlify/functions/platform-auth-session',{headers:{cookie:event.headers.cookie||''}});
  if(!r.ok) throw Object.assign(new Error('Unauthorized'),{status:401});
  return r.json().catch(()=>({ok:true}));
}
async function supa(path,opts={}){
  const url=env('SUPABASE_URL'); const key=env('SUPABASE_SERVICE_ROLE_KEY');
  if(!url||!key) throw new Error('Supabase server configuration is missing.');
  const r=await fetch(url.replace(/\/$/,'')+path,{...opts,headers:{apikey:key,authorization:`Bearer ${key}`,'content-type':'application/json',prefer:opts.prefer||'return=representation',...(opts.headers||{})}});
  const text=await r.text(); let data=null; try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok){const e=new Error(data?.message||data?.error_description||data?.error||`Supabase request failed (${r.status})`);e.status=r.status;throw e}
  return data;
}
async function table(name,query='select=*'){
  try{return {name,rows:await supa(`/rest/v1/${name}?${query}`)}}catch(e){return {name,rows:[],missing:true,error:e.message}}
}
async function firstTable(names,query='select=*'){
  for(const name of names){const r=await table(name,query);if(!r.missing)return r}
  return {name:names[0],rows:[],missing:true};
}
async function authUsers(){
  try{const d=await supa('/auth/v1/admin/users?per_page=1000');return d?.users||d||[]}catch{return []}
}
function byId(rows){return Object.fromEntries((rows||[]).map(x=>[x.id,x]))}

async function logAdminAction({tenant_id=null,target_type,target_id=null,action_type,summary,metadata={}}){
  try{await supa('/rest/v1/platform_admin_actions',{method:'POST',body:JSON.stringify({tenant_id,target_type,target_id:String(target_id||'')||null,action_type,summary,metadata})})}catch{}
}
async function tenantUser(id){return (await supa(`/rest/v1/tenant_users?id=eq.${encodeURIComponent(id)}&select=*&limit=1`))?.[0]||null}
async function authGenerateRecovery(email,redirectTo){
  const body={type:'recovery',email,options:{redirectTo}};
  return supa('/auth/v1/admin/generate_link',{method:'POST',body:JSON.stringify(body)});
}
export async function handler(event){
  try{
    await requirePlatform(event);
    if(event.httpMethod==='PATCH'||event.httpMethod==='POST'){
      const body=JSON.parse(event.body||'{}');
      if(body.kind==='support'&&body.id){
        const source=await firstTable(['support_tickets','tenant_support_tickets','support_cases'],'select=id,tenant_id&limit=1');
        if(source.missing) return json(404,{error:'Support ticket table not found.'});
        const patch={}; for(const k of ['status','priority','assigned_to','resolution','admin_notes']) if(body[k]!==undefined) patch[k]=body[k];
        const rows=await supa(`/rest/v1/${source.name}?id=eq.${encodeURIComponent(body.id)}`,{method:'PATCH',body:JSON.stringify(patch)});
        const row=rows?.[0]||null;await logAdminAction({tenant_id:row?.tenant_id||body.tenant_id,target_type:'support',target_id:body.id,action_type:'support_update',summary:`Updated support ticket ${body.id}`,metadata:patch});
        return json(200,{ok:true,row});
      }
      if(body.kind==='user'&&body.id){
        const user=await tenantUser(body.id);if(!user)return json(404,{error:'User not found.'});
        if(body.action==='set_status'){const status=body.status==='disabled'?'disabled':'active';await supa(`/rest/v1/tenant_users?id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',body:JSON.stringify({status,updated_at:new Date().toISOString()})});await logAdminAction({tenant_id:user.tenant_id,target_type:'user',target_id:user.id,action_type:'user_status',summary:`Set ${user.email} to ${status}`,metadata:{status}});return json(200,{ok:true,status});}
        if(body.action==='password_reset'){const recovery=await authGenerateRecovery(user.email,siteUrl(event).replace(/\/$/,'')+'/reset-password.html');await logAdminAction({tenant_id:user.tenant_id,target_type:'user',target_id:user.id,action_type:'password_reset_link',summary:`Generated password reset link for ${user.email}`});return json(200,{ok:true,action_link:recovery?.action_link||recovery?.properties?.action_link||null});}
      }
      if(body.kind==='tenant'&&body.id&&body.action==='export'){const tid=encodeURIComponent(body.id);const names=['tenants','tenant_users','tenant_events','tenant_clients','tenant_client_users','tenant_client_event_access','tenant_integrations','tenant_inventory_items','tenant_inventory_reservations','tenant_documents','tenant_floorplans','tenant_inspiration_boards','tenant_inspiration_items','tenant_guests','tenant_invoices','tenant_payments','tenant_vendors'];const snapshot={generated_at:new Date().toISOString(),tenant_id:body.id,data:{}};for(const name of names){try{const q=name==='tenants'?`id=eq.${tid}&select=*`:`tenant_id=eq.${tid}&select=*&limit=10000`;snapshot.data[name]=await supa(`/rest/v1/${name}?${q}`)}catch{snapshot.data[name]=[]}}await logAdminAction({tenant_id:body.id,target_type:'tenant',target_id:body.id,action_type:'tenant_export',summary:'Generated tenant support snapshot'});return json(200,{ok:true,snapshot});}
      if(body.kind==='tenant'&&body.id){const status=['active','suspended','pending_license','closed'].includes(body.status)?body.status:'active';const rows=await supa(`/rest/v1/tenants?id=eq.${encodeURIComponent(body.id)}`,{method:'PATCH',body:JSON.stringify({status,updated_at:new Date().toISOString()})});await logAdminAction({tenant_id:body.id,target_type:'tenant',target_id:body.id,action_type:'tenant_status',summary:`Set tenant status to ${status}`,metadata:{status}});return json(200,{ok:true,row:rows?.[0]||null});}
      if(body.kind==='license'&&body.id&&body.action==='extend'){const days=Math.max(1,Math.min(3650,Number(body.days)||30));const license=(await supa(`/rest/v1/licenses?id=eq.${encodeURIComponent(body.id)}&select=*&limit=1`))?.[0];if(!license)return json(404,{error:'License not found.'});const base=Math.max(Date.now(),Date.parse(license.expires_at)||Date.now()),expires_at=new Date(base+days*86400000).toISOString();await supa(`/rest/v1/licenses?id=eq.${encodeURIComponent(body.id)}`,{method:'PATCH',body:JSON.stringify({expires_at,status:'active',updated_at:new Date().toISOString()})});await supa(`/rest/v1/tenants?id=eq.${encodeURIComponent(license.tenant_id)}`,{method:'PATCH',body:JSON.stringify({status:'active',updated_at:new Date().toISOString()})});await logAdminAction({tenant_id:license.tenant_id,target_type:'license',target_id:body.id,action_type:'license_extend',summary:`Extended license by ${days} days`,metadata:{days,expires_at}});return json(200,{ok:true,expires_at});}
      if(body.kind==='integration'&&body.id&&body.action==='disconnect'){const row=(await supa(`/rest/v1/tenant_integrations?id=eq.${encodeURIComponent(body.id)}&select=id,tenant_id,kind&limit=1`))?.[0];if(!row)return json(404,{error:'Integration not found.'});await supa(`/rest/v1/tenant_integrations?id=eq.${encodeURIComponent(body.id)}`,{method:'DELETE'});await logAdminAction({tenant_id:row.tenant_id,target_type:'integration',target_id:row.id,action_type:'integration_disconnect',summary:`Disconnected ${row.kind} integration`});return json(200,{ok:true});}
      if(body.kind==='error'&&body.id&&body.action==='resolve'){const rows=await supa(`/rest/v1/platform_error_logs?id=eq.${encodeURIComponent(body.id)}`,{method:'PATCH',body:JSON.stringify({resolved_at:new Date().toISOString(),resolved_by:'platform_admin',resolution:String(body.resolution||'Resolved in platform admin').slice(0,2000)})});const row=rows?.[0]||null;await logAdminAction({tenant_id:row?.tenant_id||null,target_type:'runtime_error',target_id:body.id,action_type:'error_resolve',summary:'Marked runtime error resolved',metadata:{resolution:body.resolution||''}});return json(200,{ok:true,row});}
      return json(400,{error:'Unsupported update.'});
    }
    const [tenants,tenantUsers,licenses,support,audit,integrations,events,errors,users,adminActions]=await Promise.all([
      firstTable(['tenants'],'select=*&order=created_at.desc&limit=1000'),
      firstTable(['tenant_users'],'select=*&order=created_at.desc&limit=5000'),
      firstTable(['tenant_licenses','licenses'],'select=*&order=created_at.desc&limit=2000'),
      firstTable(['support_tickets','tenant_support_tickets','support_cases'],'select=*&order=created_at.desc&limit=1000'),
      firstTable(['tenant_audit_logs','audit_logs','tenant_activity_log'],'select=*&order=created_at.desc&limit=2000'),
      firstTable(['tenant_integrations','integrations'],'select=*&order=updated_at.desc&limit=2000'),
      firstTable(['tenant_events'],'select=id,tenant_id,title,event_date,status,updated_at&order=updated_at.desc&limit=5000'),
      firstTable(['platform_error_logs','system_logs','error_logs','platform_logs'],'select=*&order=created_at.desc&limit=1000'),
      authUsers(),
      firstTable(['platform_admin_actions'],'select=*&order=created_at.desc&limit=1000')
    ]);
    const authByEmail=Object.fromEntries((users||[]).filter(x=>x.email).map(x=>[x.email.toLowerCase(),x]));
    const enrichedUsers=(tenantUsers.rows||[]).map(u=>{const a=authByEmail[String(u.email||'').toLowerCase()]||{};return {...u,last_login_at:u.last_login_at||a.last_sign_in_at||null,auth_created_at:a.created_at||null,auth_user_id:a.id||null,email_confirmed_at:a.email_confirmed_at||null};});
    return json(200,{
      generated_at:new Date().toISOString(),
      tenants:tenants.rows||[],users:enrichedUsers,licenses:licenses.rows||[],support:support.rows||[],audit:audit.rows||[],integrations:integrations.rows||[],events:events.rows||[],errors:errors.rows||[],admin_actions:adminActions.rows||[],
      sources:{support:support.name,audit:audit.name,integrations:integrations.name,licenses:licenses.name,errors:errors.name},
      missing:{support:!!support.missing,audit:!!audit.missing,integrations:!!integrations.missing,licenses:!!licenses.missing,errors:!!errors.missing}
    });
  }catch(e){return json(e.status||500,{error:e.message||'Unable to load platform diagnostics.'})}
}
