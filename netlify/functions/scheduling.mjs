import {json,supabase,clean} from './_shared.mjs';
import {tenantContext,requireActive,requirePermission} from './_tenant.mjs';
const mins=v=>Math.max(0,Math.min(240,Number(v)||0));
export default async request=>{try{const ctx=await tenantContext(request);requireActive(ctx);requirePermission(ctx,'manage_events');const u=new URL(request.url),kind=u.searchParams.get('kind')||'all',id=u.searchParams.get('id');
 if(request.method==='GET'){
  const [types,availability,blocks,appointments]=await Promise.all([
   supabase(`tenant_appointment_types?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=*&order=sort_order.asc,name.asc`),
   supabase(`tenant_scheduling_availability?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=*&order=weekday.asc,start_time.asc`),
   supabase(`tenant_scheduling_blocks?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=*&order=starts_at.asc&limit=500`),
   supabase(`tenant_appointments?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=*&order=starts_at.asc&limit=1000`)
  ]);return json({types,availability,blocks,appointments});
 }
 const d=await request.json().catch(()=>({}));
 if(request.method==='POST'&&kind==='type'){
  const rows=await supabase('tenant_appointment_types',{method:'POST',body:{tenant_id:ctx.tenant.id,name:clean(d.name,160)||'Appointment',duration_minutes:Math.max(15,Math.min(480,Number(d.duration_minutes)||30)),meeting_mode:['video','phone','in_person','custom'].includes(d.meeting_mode)?d.meeting_mode:'video',location:clean(d.location,300)||null,buffer_before_minutes:mins(d.buffer_before_minutes),buffer_after_minutes:mins(d.buffer_after_minutes),client_bookable:d.client_bookable!==false,active:d.active!==false,sort_order:Number(d.sort_order)||0}});return json({ok:true,item:rows?.[0]});
 }
 if(request.method==='POST'&&kind==='availability'){
  const weekday=Number(d.weekday);if(weekday<0||weekday>6)throw new Error('Invalid weekday.');const rows=await supabase('tenant_scheduling_availability',{method:'POST',body:{tenant_id:ctx.tenant.id,weekday,start_time:d.start_time,end_time:d.end_time,active:d.active!==false}});return json({ok:true,item:rows?.[0]});
 }
 if(request.method==='POST'&&kind==='block'){
  const rows=await supabase('tenant_scheduling_blocks',{method:'POST',body:{tenant_id:ctx.tenant.id,title:clean(d.title,180)||'Unavailable',starts_at:d.starts_at,ends_at:d.ends_at,source:clean(d.source,60)||'manual'}});return json({ok:true,item:rows?.[0]});
 }
 if(request.method==='PATCH'&&kind==='type'){
  if(!d.id)throw new Error('Appointment type ID required.');const patch={updated_at:new Date().toISOString()};for(const k of ['name','meeting_mode','location'])if(k in d)patch[k]=clean(d[k],300);for(const k of ['duration_minutes','buffer_before_minutes','buffer_after_minutes','sort_order'])if(k in d)patch[k]=Number(d[k])||0;for(const k of ['client_bookable','active'])if(k in d)patch[k]=Boolean(d[k]);await supabase(`tenant_appointment_types?id=eq.${encodeURIComponent(d.id)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}`,{method:'PATCH',body:patch,prefer:'return=minimal'});return json({ok:true});
 }
 if(request.method==='PATCH'&&kind==='availability'){
  if(!d.id)throw new Error('Availability ID required.');const patch={};for(const k of ['start_time','end_time'])if(k in d)patch[k]=d[k];if('weekday'in d)patch.weekday=Number(d.weekday);if('active'in d)patch.active=Boolean(d.active);await supabase(`tenant_scheduling_availability?id=eq.${encodeURIComponent(d.id)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}`,{method:'PATCH',body:patch,prefer:'return=minimal'});return json({ok:true});
 }
 if(request.method==='DELETE'){
  const table=kind==='type'?'tenant_appointment_types':kind==='availability'?'tenant_scheduling_availability':kind==='block'?'tenant_scheduling_blocks':null;if(!table)throw new Error('Invalid scheduling record type.');if(!id)throw new Error('ID required.');await supabase(`${table}?id=eq.${encodeURIComponent(id)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}`,{method:'DELETE',prefer:'return=minimal'});return json({ok:true});
 }
 return json({error:'Method not allowed'},405);
}catch(e){return json({error:e.message},e.status||500)}};
