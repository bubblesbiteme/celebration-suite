import {json,supabase,clean} from './_shared.mjs';
import {tenantContext,requireActive,requirePermission,assertEventAccess} from './_tenant.mjs';
const enc=encodeURIComponent;
const n=v=>v===''||v==null?null:Number(v);
const rating=v=>{const x=n(v);return x==null?null:Math.max(1,Math.min(5,Math.round(x)))};
const amount=v=>{const x=n(v);return x==null?null:x};
const bool=v=>v===true||v==='true'||v===1||v==='1';
const allowedStatus=new Set(['active','busy','seasonal','inactive','prospect','contacted','quoted','booked','completed','declined']);
const allowedW9=new Set(['missing','requested','received']);
const allowedCoi=new Set(['missing','requested','received','expired']);
const allowedContract=new Set(['none','requested','received','signed']);

function vendorRow(d){
 const status=clean(d.status,40)||'active';
 return {
  business_name:clean(d.business_name,180),
  category:clean(d.category,100)||'Other',
  contact_name:clean(d.contact_name,160)||null,
  email:clean(d.email,180).toLowerCase()||null,
  phone:clean(d.phone,80)||null,
  website:clean(d.website,500)||null,
  instagram:clean(d.instagram,500)||null,
  address:clean(d.address,500)||null,
  city:clean(d.city,160)||null,
  state:clean(d.state,80)||null,
  zip:clean(d.zip,40)||null,
  status:allowedStatus.has(status)?status:'active',
  pricing_summary:clean(d.pricing_summary,4000)||null,
  minimum_spend:amount(d.minimum_spend),
  referral_discount:clean(d.referral_discount,500)||null,
  w9_status:allowedW9.has(d.w9_status)?d.w9_status:'missing',
  coi_status:allowedCoi.has(d.coi_status)?d.coi_status:'missing',
  coi_expires_on:d.coi_expires_on||null,
  contract_status:allowedContract.has(d.contract_status)?d.contract_status:'none',
  document_links:Array.isArray(d.document_links)?d.document_links.map(x=>clean(x,1500)).filter(Boolean).slice(0,100):[],
  rating_communication:rating(d.rating_communication),
  rating_reliability:rating(d.rating_reliability),
  rating_quality:rating(d.rating_quality),
  rating_value:rating(d.rating_value),
  rating_professionalism:rating(d.rating_professionalism),
  referred_clients:Math.max(0,Math.round(Number(d.referred_clients)||0)),
  referred_revenue:Math.max(0,Number(d.referred_revenue)||0),
  referral_bonus_due:Math.max(0,Number(d.referral_bonus_due)||0),
  notes:clean(d.notes,6000)||null,
  preferred:bool(d.preferred),
  public_profile:bool(d.public_profile),
  updated_at:new Date().toISOString()
 };
}

function schemaHint(error){
 const m=String(error?.message||error||'');
 if(/tenant_vendors_status_check|column .*tenant_vendors|schema cache|PGRST204/i.test(m)){
  return Object.assign(new Error('Vendor CRM database upgrade required. Apply Supabase migration 0034_VENDOR_CRM_PERSISTENCE.sql, then retry.'),{status:500});
 }
 return error;
}

export default async request=>{try{
 const ctx=await tenantContext(request);requireActive(ctx);requirePermission(ctx,'manage_vendors');
 const u=new URL(request.url),action=u.searchParams.get('action');
 if(request.method==='GET'){
  const [vendors,ops,events,reviews]=await Promise.all([
   supabase(`tenant_vendors?tenant_id=eq.${enc(ctx.tenant.id)}&select=*&order=business_name.asc&limit=2000`),
   supabase(`tenant_vendor_operations?tenant_id=eq.${enc(ctx.tenant.id)}&select=*&order=created_at.desc&limit=3000`).catch(()=>[]),
   supabase(`tenant_events?tenant_id=eq.${enc(ctx.tenant.id)}&select=id,title,event_type,client_name,client_email,event_date,status&order=event_date.desc.nullslast&limit=1000`),
   supabase(`tenant_vendor_reviews?tenant_id=eq.${enc(ctx.tenant.id)}&select=*&order=created_at.desc&limit=3000`).catch(()=>[])
  ]);
  const mappedV=(vendors||[]).map(v=>({...v,
   preferred:!!v.preferred,public_profile:!!v.public_profile,status:v.status||'active',
   pricing_summary:v.pricing_summary||v.notes||'',document_links:Array.isArray(v.document_links)?v.document_links:[],
   rating_communication:v.rating_communication||null,rating_reliability:v.rating_reliability||null,
   rating_quality:v.rating_quality||null,rating_value:v.rating_value||null,rating_professionalism:v.rating_professionalism||null,
   w9_status:v.w9_status||'missing',coi_status:v.coi_status||'missing',contract_status:v.contract_status||'none'
  }));
  const assignments=(ops||[]).map(o=>({id:o.id,booking_id:o.event_id,vendor_id:o.vendor_id,role:o.role,status:o.status||'proposed',arrival_time:o.scheduled_arrival,load_in_notes:o.access_instructions||o.day_of_notes,amount_due:0,amount_paid:0,payment_due_on:null,notes:o.day_of_notes,contact_name:o.contact_name,contact_email:o.contact_email,contact_phone:o.contact_phone}));
  const bookings=(events||[]).map(e=>({id:e.id,package_name:e.title||e.event_type||'Event',customer_name:e.client_name,customer_email:e.client_email,event_date:e.event_date,scheduled_date:e.event_date,status:e.status}));
  const mappedR=(reviews||[]).map(r=>({...r,booking_id:r.event_id,overall_rating:r.rating,rating_communication:r.communication,rating_reliability:r.reliability,rating_quality:r.quality,rating_value:null,rating_professionalism:null,hire_again:r.would_rehire?'yes':'no',recommendation_status:r.would_rehire?'recommended':'do_not_book',private_notes:r.notes,reviewed_on:(r.created_at||'').slice(0,10)}));
  return json({vendors:mappedV,assignments,bookings,reviews:mappedR});
 }
 const d=await request.json().catch(()=>({}));
 if(action==='create'||action==='update'){
  if(!clean(d.business_name,180))return json({error:'Business name is required.'},400);
  const row=vendorRow(d);
  if(action==='create'){
   const r=await supabase('tenant_vendors',{method:'POST',body:{tenant_id:ctx.tenant.id,event_id:null,...row}}).catch(e=>{throw schemaHint(e)});
   return json({ok:true,vendor:r?.[0]});
  }
  if(!d.id)return json({error:'Vendor ID required.'},400);
  const r=await supabase(`tenant_vendors?id=eq.${enc(d.id)}&tenant_id=eq.${enc(ctx.tenant.id)}`,{method:'PATCH',body:row}).catch(e=>{throw schemaHint(e)});
  if(!r?.length)return json({error:'Vendor not found or could not be updated.'},404);
  return json({ok:true,vendor:r[0]});
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
}catch(e){const err=schemaHint(e);return json({error:err.message},err.status||500)}};
