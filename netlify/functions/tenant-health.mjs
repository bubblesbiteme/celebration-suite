import {json,supabase} from './_shared.mjs';
import {tenantContext,requireActive} from './_tenant.mjs';
const age=(v)=>v?Date.now()-Date.parse(v):Infinity;
const day=86400000;
export default async request=>{try{const ctx=await tenantContext(request);requireActive(ctx);if(request.method!=='GET')return json({error:'Method not allowed'},405);
 const tid=encodeURIComponent(ctx.tenant.id);
 const [ints,keys,hooks,deliveries,errors,events,users]=await Promise.all([
  supabase(`tenant_integrations?tenant_id=eq.${tid}&select=id,kind,status,updated_at,created_at,last_checked_at,last_success_at,last_error,needs_reconnect&order=updated_at.desc`).catch(()=>[]),
  supabase(`tenant_api_keys?tenant_id=eq.${tid}&select=id,name,active,last_used_at,created_at`).catch(()=>[]),
  supabase(`tenant_webhooks?tenant_id=eq.${tid}&select=id,name,endpoint_url,active,updated_at,created_at`).catch(()=>[]),
  supabase(`tenant_webhook_deliveries?tenant_id=eq.${tid}&select=id,event_type,success,response_status,error,attempted_at&order=attempted_at.desc&limit=100`).catch(()=>[]),
  supabase(`platform_error_logs?tenant_id=eq.${tid}&resolved_at=is.null&select=id,message,level,path,created_at&order=created_at.desc&limit=50`).catch(()=>[]),
  supabase(`tenant_events?tenant_id=eq.${tid}&select=id,title,status,event_date,updated_at&order=updated_at.desc&limit=500`).catch(()=>[]),
  supabase(`tenant_users?tenant_id=eq.${tid}&select=id,email,role,status,last_login_at,created_at&limit=200`).catch(()=>[])
 ]);
 const map={};for(const x of ints||[])map[String(x.kind||'').toLowerCase()]=x;
 const expected=[['google_calendar','Google Calendar'],['quickbooks','QuickBooks'],['stripe','Stripe'],['email','Email'],['sms','SMS / Telnyx']];
 const integrations=expected.map(([kind,label])=>{const x=map[kind]||((kind==='email')?map.resend:null)||((kind==='sms')?map.telnyx:null);return {kind,label,connected:!!x&&!x?.needs_reconnect,status:x?.status||(x?'configured':'not_configured'),updated_at:x?.updated_at||x?.created_at||null,last_checked_at:x?.last_checked_at||null,last_success_at:x?.last_success_at||null,last_error:x?.last_error||null,needs_reconnect:!!x?.needs_reconnect}});
 const failed=(deliveries||[]).filter(x=>(x.success===false)||(Number(x.response_status||0)>=400)||x.error).filter(x=>age(x.attempted_at)<7*day);
 const recentErrors=(errors||[]).filter(x=>age(x.created_at)<14*day);
 const warnings=[];for(const x of integrations)if(x.needs_reconnect)warnings.push(`${x.label} needs to be reconnected`);if(failed.length)warnings.push(`${failed.length} webhook failure${failed.length===1?'':'s'} in the last 7 days`);if(recentErrors.length)warnings.push(`${recentErrors.length} unresolved app error${recentErrors.length===1?'':'s'}`);if(!(hooks||[]).some(x=>x.active)&&hooks?.length)warnings.push('All configured webhooks are disabled');
 const score=Math.max(0,100-Math.min(25,failed.length*5)-Math.min(25,recentErrors.length*5));
 return json({tenant:{id:ctx.tenant.id,business_name:ctx.tenant.business_name,status:ctx.tenant.status},license:ctx.license||null,score,warnings,integrations,api_keys:{total:(keys||[]).length,active:(keys||[]).filter(x=>x.active).length},webhooks:{total:(hooks||[]).length,active:(hooks||[]).filter(x=>x.active).length,failures_7d:failed.length,recent_deliveries:(deliveries||[]).slice(0,20)},errors:recentErrors,events:{total:(events||[]).length,active:(events||[]).filter(x=>!['archived','cancelled','closed'].includes(String(x.status||'').toLowerCase())).length},users:{total:(users||[]).length,active:(users||[]).filter(x=>x.status!=='disabled').length}});
}catch(e){return json({error:e.message},e.status||500)}};
