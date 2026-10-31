import {json,supabase,clean} from './_shared.mjs';
import {tenantContext,requireActive,requirePermission,assertEventAccess} from './_tenant.mjs';
const enc=encodeURIComponent;
export default async request=>{try{
 const ctx=await tenantContext(request);requireActive(ctx);requirePermission(ctx,'manage_events');
 const u=new URL(request.url),eventId=u.searchParams.get('booking_id')||u.searchParams.get('event_id');
 if(!eventId)throw new Error('Event ID required.');await assertEventAccess(ctx,eventId);
 if(request.method==='GET'){
  const [appointments,types]=await Promise.all([
   supabase(`tenant_appointments?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=*&order=starts_at.asc&limit=500`),
   supabase(`tenant_appointment_types?tenant_id=eq.${enc(ctx.tenant.id)}&active=eq.true&select=*&order=sort_order.asc&limit=200`).catch(()=>[])
  ]);
  return json({appointments:appointments||[],types:types||[]});
 }
 const d=await request.json().catch(()=>({}));const action=d.action||'';
 if(action==='appointment-status'){
  if(!d.id)throw new Error('Appointment ID required.');
  const row=(await supabase(`tenant_appointments?id=eq.${enc(d.id)}&tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=*&limit=1`))?.[0];
  if(!row)throw new Error('Appointment not found.');
  const patch={updated_at:new Date().toISOString()};
  if(d.status)patch.status=clean(d.status,40);
  if('internal_notes' in d)patch.notes=clean(d.internal_notes,2000)||null;
  if('meeting_url' in d)patch.meeting_url=clean(d.meeting_url,1000)||null;
  if('location' in d)patch.location=clean(d.location,500)||null;
  await supabase(`tenant_appointments?id=eq.${enc(d.id)}&tenant_id=eq.${enc(ctx.tenant.id)}`,{method:'PATCH',body:patch,prefer:'return=minimal'});
  return json({ok:true});
 }
 return json({error:'Unsupported scheduling action.'},400);
}catch(e){return json({error:e.message},e.status||500)}};
