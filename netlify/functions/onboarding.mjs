import {json,supabase,clean} from './_shared.mjs';import {tenantContext,requireActive} from './_tenant.mjs';
export default async request=>{try{const ctx=await tenantContext(request);if(request.method==='GET'){
 const rows=await supabase(`tenant_onboarding?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=*&limit=1`);const row=rows?.[0]||{};
 const ints=await supabase(`tenant_integrations?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=kind`);
 const events=await supabase(`tenant_events?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=id&limit=1`);
 const b=ctx.tenant.branding||{};return json({onboarding:{tenant_id:ctx.tenant.id,business_complete:Boolean(ctx.tenant.business_name&&ctx.tenant.reply_to_email),brand_complete:Boolean(b.logo_url||b.primary),email_complete:(ints||[]).some(x=>x.kind==='email'),payment_complete:(ints||[]).some(x=>x.kind==='stripe'),first_event_complete:Boolean(events?.length),dismissed_at:row.dismissed_at||null},license:ctx.license});}
 if(request.method!=='POST')return json({error:'Method not allowed'},405);const d=await request.json();if(d.action==='dismiss'){await supabase('tenant_onboarding',{method:'POST',body:{tenant_id:ctx.tenant.id,dismissed_at:new Date().toISOString(),updated_at:new Date().toISOString()},prefer:'resolution=merge-duplicates,return=minimal'});return json({ok:true});}return json({error:'Unknown action'},400);
}catch(e){return json({error:e.message},e.status||500)}};
