import {createHash} from 'node:crypto';
import {json,supabase} from './_shared.mjs';
import {hashPassword} from './_session.mjs';
const hash=t=>createHash('sha256').update(String(t||'')).digest('hex');
export default async request=>{try{
  if(request.method!=='POST')return json({error:'Method not allowed'},405);const d=await request.json(),token=String(d.token||''),password=String(d.password||'');if(token.length<20||password.length<10)throw new Error('A valid reset link and password of at least 10 characters are required.');
  const r=(await supabase(`password_reset_tokens?token_hash=eq.${hash(token)}&used_at=is.null&select=*&limit=1`))?.[0];if(!r||Date.parse(r.expires_at)<=Date.now())throw new Error('This password reset link is invalid or has expired.');const p=hashPassword(password),basePatch={password_hash:p.hash,password_salt:p.salt,auth_provider:'password'};
  if(r.account_type==='tenant')await supabase(`tenant_users?id=eq.${encodeURIComponent(r.user_id)}`,{method:'PATCH',body:{...basePatch,updated_at:new Date().toISOString()},prefer:'return=minimal'});
  else if(r.account_type==='platform')await supabase(`platform_admins?id=eq.${encodeURIComponent(r.user_id)}`,{method:'PATCH',body:{...basePatch,last_login_at:null},prefer:'return=minimal'});
  else if(r.account_type==='client')await supabase(`tenant_client_users?id=eq.${encodeURIComponent(r.user_id)}`,{method:'PATCH',body:{...basePatch,updated_at:new Date().toISOString()},prefer:'return=minimal'});
  else throw new Error('Unsupported account type.');
  await supabase(`password_reset_tokens?id=eq.${encodeURIComponent(r.id)}`,{method:'PATCH',body:{used_at:new Date().toISOString()},prefer:'return=minimal'});
  return json({ok:true,account_type:r.account_type,context:r.context||{}});
}catch(e){return json({error:e.message},400)}};
