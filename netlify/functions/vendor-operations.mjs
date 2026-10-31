import {json,supabase,clean} from './_shared.mjs';
import {tenantContext,requireActive,requirePermission,assertEventAccess} from './_tenant.mjs';
const enc=encodeURIComponent;
export default async request=>{try{
 const ctx=await tenantContext(request);requireActive(ctx);requirePermission(ctx,'manage_vendors');
 const u=new URL(request.url),eventId=u.searchParams.get('event_id');if(!eventId)throw new Error('Event ID required.');await assertEventAccess(ctx,eventId);
 const tid=enc(ctx.tenant.id),eid=enc(eventId);
 if(request.method==='GET'){
  const [vendors,ops,docs,contacts]=await Promise.all([
   supabase(`tenant_vendors?tenant_id=eq.${tid}&event_id=eq.${eid}&select=*&order=category.asc,business_name.asc&limit=1000`),
   supabase(`tenant_vendor_operations?tenant_id=eq.${tid}&event_id=eq.${eid}&select=*&order=scheduled_arrival.asc.nullslast,created_at.asc&limit=1000`),
   supabase(`tenant_documents?tenant_id=eq.${tid}&event_id=eq.${eid}&select=*&order=expiration_date.asc.nullslast,created_at.desc&limit=2000`).catch(()=>[]),
   supabase(`tenant_event_emergency_contacts?tenant_id=eq.${tid}&event_id=eq.${eid}&select=*&order=sort_order.asc,created_at.asc&limit=200`).catch(()=>[])
  ]);return json({vendors,operations:ops,documents:docs,contacts});
 }
 const d=await request.json().catch(()=>({}));
 if(request.method==='POST'){
  if(d.kind==='contact'){const r=await supabase('tenant_event_emergency_contacts',{method:'POST',body:{tenant_id:ctx.tenant.id,event_id:eventId,label:clean(d.label,120)||'Emergency contact',name:clean(d.name,180)||null,phone:clean(d.phone,80)||null,notes:clean(d.notes,1000)||null,sort_order:Number(d.sort_order)||0}});return json({ok:true,contact:r?.[0]});}
  const vendorId=d.vendor_id||null;let v=null;if(vendorId)v=(await supabase(`tenant_vendors?id=eq.${enc(vendorId)}&tenant_id=eq.${tid}&select=*&limit=1`))?.[0];
  const r=await supabase('tenant_vendor_operations',{method:'POST',body:{tenant_id:ctx.tenant.id,event_id:eventId,vendor_id:vendorId,vendor_name:clean(d.vendor_name||v?.business_name,180)||null,role:clean(d.role||v?.category,120)||null,contact_name:clean(d.contact_name||v?.contact_name,180)||null,contact_phone:clean(d.contact_phone||v?.phone,80)||null,contact_email:clean(d.contact_email||v?.email,180)||null,scheduled_arrival:d.scheduled_arrival||null,load_in_start:d.load_in_start||null,load_in_end:d.load_in_end||null,assigned_area:clean(d.assigned_area,180)||null,responsibilities:clean(d.responsibilities,3000)||null,access_instructions:clean(d.access_instructions,3000)||null,day_of_notes:clean(d.day_of_notes,3000)||null,status:'scheduled'}});return json({ok:true,operation:r?.[0]});
 }
 if(request.method==='PATCH'){
  if(d.kind==='contact'){const id=d.id;if(!id)throw new Error('Contact ID required.');const patch={updated_at:new Date().toISOString()};for(const k of ['label','name','phone','notes'])if(k in d)patch[k]=clean(d[k],k==='notes'?1000:180)||null;if('sort_order'in d)patch.sort_order=Number(d.sort_order)||0;await supabase(`tenant_event_emergency_contacts?id=eq.${enc(id)}&tenant_id=eq.${tid}&event_id=eq.${eid}`,{method:'PATCH',body:patch,prefer:'return=minimal'});return json({ok:true});}
  const id=d.id;if(!id)throw new Error('Operation ID required.');const patch={updated_at:new Date().toISOString()};
  for(const k of ['vendor_name','role','contact_name','contact_phone','contact_email','assigned_area','responsibilities','access_instructions','day_of_notes','status'])if(k in d)patch[k]=clean(d[k],k.includes('notes')||k==='responsibilities'||k==='access_instructions'?3000:180)||null;
  for(const k of ['scheduled_arrival','load_in_start','load_in_end'])if(k in d)patch[k]=d[k]||null;
  if(d.action==='checkin'){patch.checked_in_at=new Date().toISOString();patch.checked_out_at=null;patch.status='checked_in';}
  if(d.action==='checkout'){patch.checked_out_at=new Date().toISOString();patch.status='checked_out';}
  if(d.action==='reset'){patch.checked_in_at=null;patch.checked_out_at=null;patch.status='scheduled';}
  await supabase(`tenant_vendor_operations?id=eq.${enc(id)}&tenant_id=eq.${tid}&event_id=eq.${eid}`,{method:'PATCH',body:patch,prefer:'return=minimal'});return json({ok:true});
 }
 if(request.method==='DELETE'){const id=u.searchParams.get('id');if(!id)throw new Error('Record ID required.');const kind=u.searchParams.get('kind');const table=kind==='contact'?'tenant_event_emergency_contacts':'tenant_vendor_operations';await supabase(`${table}?id=eq.${enc(id)}&tenant_id=eq.${tid}&event_id=eq.${eid}`,{method:'DELETE',prefer:'return=minimal'});return json({ok:true});}
 return json({error:'Method not allowed'},405);
}catch(e){return json({error:e.message},e.status||500)}};
