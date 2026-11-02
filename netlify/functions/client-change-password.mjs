import {json,supabase} from './_shared.mjs';
import {readClientSession,hashPassword} from './_session.mjs';

export default async request=>{try{
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  const s=readClientSession(request);if(!s)return json({error:'Please sign in again.'},401);
  const d=await request.json().catch(()=>({})),password=String(d.password||''),confirm=String(d.confirm||'');
  if(password.length<10)return json({error:'Use at least 10 characters.'},400);
  if(password.length>100)return json({error:'Password is too long.'},400);
  if(password!==confirm)return json({error:'The passwords do not match.'},400);
  const secured=hashPassword(password),now=new Date().toISOString();
  await supabase(`tenant_client_users?id=eq.${encodeURIComponent(s.client_user_id)}&tenant_id=eq.${encodeURIComponent(s.tenant_id)}`,{method:'PATCH',body:{password_hash:secured.hash,password_salt:secured.salt,auth_provider:'password',updated_at:now},prefer:'return=minimal'});
  return json({ok:true});
}catch(e){return json({error:e.message||'Unable to update password.'},e.status||500)}};
