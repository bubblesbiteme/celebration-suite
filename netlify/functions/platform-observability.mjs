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
export async function handler(event){
  try{
    await requirePlatform(event);
    if(event.httpMethod==='PATCH'){
      const body=JSON.parse(event.body||'{}');
      if(body.kind!=='support'||!body.id) return json(400,{error:'Unsupported update.'});
      const source=await firstTable(['support_tickets','tenant_support_tickets','support_cases'],'select=id&limit=1');
      if(source.missing) return json(404,{error:'Support ticket table not found.'});
      const patch={}; for(const k of ['status','priority','assigned_to','resolution','admin_notes']) if(body[k]!==undefined) patch[k]=body[k];
      const rows=await supa(`/rest/v1/${source.name}?id=eq.${encodeURIComponent(body.id)}`,{method:'PATCH',body:JSON.stringify(patch)});
      return json(200,{ok:true,row:rows?.[0]||null});
    }
    const [tenants,tenantUsers,licenses,support,audit,integrations,events,errors,users]=await Promise.all([
      firstTable(['tenants'],'select=*&order=created_at.desc&limit=1000'),
      firstTable(['tenant_users'],'select=*&order=created_at.desc&limit=5000'),
      firstTable(['tenant_licenses','licenses'],'select=*&order=created_at.desc&limit=2000'),
      firstTable(['support_tickets','tenant_support_tickets','support_cases'],'select=*&order=created_at.desc&limit=1000'),
      firstTable(['tenant_audit_logs','audit_logs','tenant_activity_log'],'select=*&order=created_at.desc&limit=2000'),
      firstTable(['tenant_integrations','integrations'],'select=*&order=updated_at.desc&limit=2000'),
      firstTable(['tenant_events'],'select=id,tenant_id,title,event_date,status,updated_at&order=updated_at.desc&limit=5000'),
      firstTable(['platform_error_logs','system_logs','error_logs','platform_logs'],'select=*&order=created_at.desc&limit=1000'),
      authUsers()
    ]);
    const authByEmail=Object.fromEntries((users||[]).filter(x=>x.email).map(x=>[x.email.toLowerCase(),x]));
    const enrichedUsers=(tenantUsers.rows||[]).map(u=>{const a=authByEmail[String(u.email||'').toLowerCase()]||{};return {...u,last_login_at:u.last_login_at||a.last_sign_in_at||null,auth_created_at:a.created_at||null,auth_user_id:a.id||null,email_confirmed_at:a.email_confirmed_at||null};});
    return json(200,{
      generated_at:new Date().toISOString(),
      tenants:tenants.rows||[],users:enrichedUsers,licenses:licenses.rows||[],support:support.rows||[],audit:audit.rows||[],integrations:integrations.rows||[],events:events.rows||[],errors:errors.rows||[],
      sources:{support:support.name,audit:audit.name,integrations:integrations.name,licenses:licenses.name,errors:errors.name},
      missing:{support:!!support.missing,audit:!!audit.missing,integrations:!!integrations.missing,licenses:!!licenses.missing,errors:!!errors.missing}
    });
  }catch(e){return json(e.status||500,{error:e.message||'Unable to load platform diagnostics.'})}
}
