import {json,supabase,clean} from './_shared.mjs';
import {tenantContext,requireActive,requirePermission,assertEventAccess} from './_tenant.mjs';
const enc=encodeURIComponent; const n=v=>v===''||v==null?null:Number(v);
export default async request=>{try{const ctx=await tenantContext(request);requireActive(ctx);requirePermission(ctx,'manage_vendors');const u=new URL(request.url),action=u.searchParams.get('action');
 if(request.method==='GET'){
  const [vendors,ops,events,reviews]=await Promise.all([
   supabase(`tenant_vendors?tenant_id=eq.${enc(ctx.tenant.id)}&select=*&order=business_name.asc&limit=2000`),
   supabase(`tenant_vendor_operations?tenant_id=eq.${enc(ctx.tenant.id)}&select=*&order=created_at.desc&limit=3000`).catch(()=>[]),
   supabase(`tenant_events?tenant_id=eq.${enc(ctx.tenant.id)}&select=id,title,event_type,client_name,client_email,event_date,status&order=event_date.desc.nullslast&limit=1000`),
   supabase(`tenant_vendor_reviews?tenant_id=eq.${enc(ctx.tenant.id)}&select=*&order=created_at.desc&limit=3000`).catch(()=>[])
  ]);
  const mappedV=(vendors||[]).map(v=>({...v,preferred:!!v.preferred,public_profile:!!v.public_profile,status:v.status||'active',pricing_summary:v.notes||'',rating_communication:v.rating_communication||null,rating_reliability:v.rating_reliability||null,rating_quality:v.rating_quality||null,rating_value:v.rating_value||null,rating_professionalism:v.rating_professionalism||null,w9_status:v.w9_status||'missing',coi_status:v.coi_status||'missing',contract_status:v.contract_status||'none'}));
  const assignments=(ops||[]).map(o=>({id:o.id,booking_id:o.event_id,vendor_id:o.vendor_id,role:o.role,status:o.status||'proposed',arrival_time:o.scheduled_arrival,load_in_notes:o.access_instructions||o.day_of_notes,amount_due:0,amount_paid:0,payment_due_on:null,notes:o.day_of_notes,contact_name:o.contact_name,contact_email:o.contact_email,contact_phone:o.contact_phone}));
  const bookings=(events||[]).map(e=>({id:e.id,package_name:e.title||e.event_type||'Event',customer_name:e.client_name,customer_email:e.client_email,event_date:e.event_date,scheduled_date:e.event_date,status:e.status}));
  const mappedR=(reviews||[]).map(r=>({...r,booking_id:r.event_id,overall_rating:r.rating,rating_communication:r.communication,rating_reliability:r.reliability,rating_quality:r.quality,rating_value:null,rating_professionalism:null,hire_again:r.would_rehire?'yes':'no',recommendation_status:r.would_rehire?'recommended':'do_not_book',private_notes:r.notes,reviewed_on:(r.created_at||'').slice(0,10)}));
  return json({vendors:mappedV,assignments,bookings,reviews:mappedR});
 }
 const d=await request.json().catch(()=>({}));
 if(action==='create'||action==='update'){
  const row={business_name:clean(d.business_name,180),category:clean(d.category,100)||'Other',contact_name:clean(d.contact_name,160)||null,email:clean(d.email,180).toLowerCase()||null,phone:clean(d.phone,80)||null,website:clean(d.website,500)||null,status:clean(d.status,40)||'active',notes:clean(d.notes,6000)||clean(d.pricing_summary,3000)||null,updated_at:new Date().toISOString()};
  if(action==='create'){const r=await supabase('tenant_vendors',{method:'POST',body:{tenant_id:ctx.tenant.id,event_id:null,...row}});return json({ok:true,vendor:r?.[0]});}
  await supabase(`tenant_vendors?id=eq.${enc(d.id)}&tenant_id=eq.${enc(ctx.tenant.id)}`,{method:'PATCH',body:row,prefer:'return=minimal'});return json({ok:true});
 }
 if(action==='delete'){await supabase(`tenant_vendors?id=eq.${enc(d.id)}&tenant_id=eq.${enc(ctx.tenant.id)}`,{method:'DELETE'});return json({ok:true});}
 if(action==='createReview'||action==='updateReview'){
  const row={vendor_id:d.vendor_id,event_id:d.booking_id||null,rating:Math.max(1,Math.min(5,Number(d.overall_rating)||5)),communication:n(d.rating_communication),reliability:n(d.rating_reliability),quality:n(d.rating_quality),would_rehire:d.hire_again!=='no',notes:clean(d.private_notes,6000)||clean(d.went_well,4000)||null,updated_at:new Date().toISOString()};
  if(action==='createReview'){const r=await supabase('tenant_vendor_reviews',{method:'POST',body:{tenant_id:ctx.tenant.id,...row}});return json({ok:true,review:r?.[0]});}
  await supabase(`tenant_vendor_reviews?id=eq.${enc(d.id)}&tenant_id=eq.${enc(ctx.tenant.id)}`,{method:'PATCH',body:row,prefer:'return=minimal'});return json({ok:true});
 }
 if(action==='deleteReview'){await supabase(`tenant_vendor_reviews?id=eq.${enc(d.id)}&tenant_id=eq.${enc(ctx.tenant.id)}`,{method:'DELETE'});return json({ok:true});}
 if(action==='assign'){
  await assertEventAccess(ctx,d.booking_id);const v=(await supabase(`tenant_vendors?id=eq.${enc(d.vendor_id)}&tenant_id=eq.${enc(ctx.tenant.id)}&select=*&limit=1`))?.[0];if(!v)throw new Error('Vendor not found.');
  const r=await supabase('tenant_vendor_operations',{method:'POST',body:{tenant_id:ctx.tenant.id,event_id:d.booking_id,vendor_id:d.vendor_id,vendor_name:v.business_name,role:clean(d.role,120)||v.category,contact_name:v.contact_name,contact_email:v.email,contact_phone:v.phone,scheduled_arrival:d.arrival_time||null,access_instructions:clean(d.load_in_notes,2000)||null,day_of_notes:clean(d.assignment_notes,3000)||null,status:d.status||'scheduled'}});return json({ok:true,assignment:r?.[0]});
 }
 if(action==='updateAssignment'){const cur=(await supabase(`tenant_vendor_operations?id=eq.${enc(d.id)}&tenant_id=eq.${enc(ctx.tenant.id)}&select=*&limit=1`))?.[0];if(!cur)throw new Error('Assignment not found.');await assertEventAccess(ctx,cur.event_id);await supabase(`tenant_vendor_operations?id=eq.${enc(d.id)}`,{method:'PATCH',body:{role:clean(d.role,120)||cur.role,status:d.status||cur.status,scheduled_arrival:d.arrival_time||null,access_instructions:clean(d.load_in_notes,2000)||null,day_of_notes:clean(d.assignment_notes,3000)||null,updated_at:new Date().toISOString()},prefer:'return=minimal'});return json({ok:true});}
 if(action==='removeAssignment'){await supabase(`tenant_vendor_operations?id=eq.${enc(d.id)}&tenant_id=eq.${enc(ctx.tenant.id)}`,{method:'DELETE'});return json({ok:true});}
 return json({error:'Unknown action'},400);
}catch(e){return json({error:e.message},e.status||500)}};
