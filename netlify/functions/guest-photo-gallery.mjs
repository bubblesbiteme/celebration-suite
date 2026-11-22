import {json,supabase,clean,origin} from './_shared.mjs';
import {tenantContext,requireActive,requirePermission,assertEventAccess} from './_tenant.mjs';
async function ensureGallery(ctx,eventId){let g=(await supabase(`tenant_event_photo_galleries?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&event_id=eq.${encodeURIComponent(eventId)}&select=*&limit=1`))?.[0];if(!g){const e=(await supabase(`tenant_events?id=eq.${encodeURIComponent(eventId)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=title&limit=1`))?.[0];const rows=await supabase('tenant_event_photo_galleries',{method:'POST',body:{tenant_id:ctx.tenant.id,event_id:eventId,title:`${e?.title||'Event'} Guest Photos`}});g=rows?.[0]}return g}
export default async request=>{try{const ctx=await tenantContext(request);requireActive(ctx);requirePermission(ctx,'manage_events');const u=new URL(request.url),eventId=clean(u.searchParams.get('event_id'),100);
 if(request.method==='GET'&&!eventId){
  const [events,galleries,photos]=await Promise.all([
   supabase(`tenant_events?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=id,title,event_date,client_name,client_email,status&order=event_date.asc.nullslast,created_at.desc&limit=1000`),
   supabase(`tenant_event_photo_galleries?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=*&order=created_at.desc&limit=1000`).catch(()=>[]),
   supabase(`tenant_event_guest_photos?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=id,event_id,status,created_at&order=created_at.desc&limit=10000`).catch(()=>[])
  ]);
  const gm=new Map((galleries||[]).map(x=>[String(x.event_id),x]));
  const counts={};for(const p of photos||[]){const k=String(p.event_id);counts[k]??={total:0,pending:0,approved:0,hidden:0};counts[k].total++;if(counts[k][p.status]!=null)counts[k][p.status]++;}
  const albums=(events||[]).map(e=>{const g=gm.get(String(e.id))||null,c=counts[String(e.id)]||{total:0,pending:0,approved:0,hidden:0};return {event:e,gallery:g,counts:c,public_url:g?`${origin(request)}/guest-photo-upload.html?token=${encodeURIComponent(g.public_token)}`:null}});
  return json({albums});
 }
 if(!eventId)throw new Error('Event ID required.');await assertEventAccess(ctx,eventId);let g=await ensureGallery(ctx,eventId);
 if(request.method==='GET'){const photos=await supabase(`tenant_event_guest_photos?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&event_id=eq.${encodeURIComponent(eventId)}&select=*&order=created_at.desc&limit=5000`).catch(()=>[]);return json({gallery:g,photos,public_url:`${origin(request)}/guest-photo-upload.html?token=${encodeURIComponent(g.public_token)}`});}
 const d=await request.json().catch(()=>({}));
 if(request.method==='PATCH'&&d.action==='settings'){const patch={updated_at:new Date().toISOString()};if('enabled'in d)patch.enabled=!!d.enabled;if('title'in d)patch.title=clean(d.title,200)||null;if('welcome_message'in d)patch.welcome_message=clean(d.welcome_message,1200)||null;if('allow_guest_captions'in d)patch.allow_guest_captions=!!d.allow_guest_captions;if('moderation_required'in d)patch.moderation_required=!!d.moderation_required;if('client_can_download'in d)patch.client_can_download=!!d.client_can_download;if('client_can_print'in d)patch.client_can_print=!!d.client_can_print;const rows=await supabase(`tenant_event_photo_galleries?id=eq.${encodeURIComponent(g.id)}`,{method:'PATCH',body:patch});g=rows?.[0]||{...g,...patch};return json({ok:true,gallery:g,public_url:`${origin(request)}/guest-photo-upload.html?token=${encodeURIComponent(g.public_token)}`});}
 if(request.method==='PATCH'&&d.action==='photo-status'){const id=clean(d.id,100),status=['pending','approved','hidden'].includes(d.status)?d.status:null;if(!id||!status)throw new Error('Photo and status are required.');await supabase(`tenant_event_guest_photos?id=eq.${encodeURIComponent(id)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&event_id=eq.${encodeURIComponent(eventId)}`,{method:'PATCH',body:{status,updated_at:new Date().toISOString()},prefer:'return=minimal'});return json({ok:true});}
 return json({error:'Method not allowed'},405);
}catch(e){return json({error:e.message},e.status||400)}};
