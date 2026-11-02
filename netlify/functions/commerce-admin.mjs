import {json,supabase,clean} from './_shared.mjs';
import {tenantContext,requireActive,requirePermission} from './_tenant.mjs';
import {commerceSettings,money,enc} from './_commerce.mjs';
const bool=v=>v===true||['true','1','yes','on'].includes(String(v||'').toLowerCase());
export default async request=>{try{
 const ctx=await tenantContext(request);requireActive(ctx);requirePermission(ctx,'manage_inventory');const u=new URL(request.url),action=u.searchParams.get('action');
 if(request.method==='GET'){
  const [settings,packages,addons,bookingOrders,rentalOrders,rentalItems]=await Promise.all([
   commerceSettings(ctx.tenant.id),
   supabase(`tenant_booking_packages?tenant_id=eq.${enc(ctx.tenant.id)}&select=*&order=sort_order.asc,name.asc`),
   supabase(`tenant_booking_addons?tenant_id=eq.${enc(ctx.tenant.id)}&select=*&order=sort_order.asc,name.asc`),
   supabase(`tenant_booking_orders?tenant_id=eq.${enc(ctx.tenant.id)}&select=*&order=created_at.desc&limit=300`),
   supabase(`tenant_rental_orders?tenant_id=eq.${enc(ctx.tenant.id)}&select=*&order=created_at.desc&limit=300`),
   supabase(`tenant_rental_order_items?tenant_id=eq.${enc(ctx.tenant.id)}&select=*&order=created_at.asc&limit=3000`).catch(()=>[])
  ]);
  return json({tenant:{slug:ctx.tenant.slug,business_name:ctx.tenant.business_name},settings,packages,addons,booking_orders:bookingOrders,rental_orders:rentalOrders,rental_items:rentalItems});
 }
 const d=await request.json().catch(()=>({}));
 if(request.method==='POST'&&action==='settings'){
  const row={tenant_id:ctx.tenant.id,instant_book_enabled:bool(d.instant_book_enabled),rental_store_enabled:bool(d.rental_store_enabled),booking_intro:clean(d.booking_intro,5000)||null,rental_intro:clean(d.rental_intro,5000)||null,booking_terms:clean(d.booking_terms,10000)||null,rental_terms:clean(d.rental_terms,10000)||null,booking_hold_hours:Math.max(1,Math.min(24,Number(d.booking_hold_hours)||4)),rental_hold_hours:Math.max(1,Math.min(24,Number(d.rental_hold_hours)||4)),max_general_events_per_day:Math.max(1,Math.min(20,Number(d.max_general_events_per_day)||2)),max_exclusive_events_per_day:Math.max(1,Math.min(10,Number(d.max_exclusive_events_per_day)||1)),recovery_enabled:bool(d.recovery_enabled),recovery_first_minutes:Math.max(15,Math.min(1440,Number(d.recovery_first_minutes)||30)),recovery_second_hours:Math.max(2,Math.min(168,Number(d.recovery_second_hours)||72)),updated_at:new Date().toISOString()};
  await supabase('tenant_commerce_settings',{method:'POST',body:row,prefer:'resolution=merge-duplicates,return=minimal'});return json({ok:true});
 }
 if(request.method==='POST'&&action==='package'){
  const row={tenant_id:ctx.tenant.id,name:clean(d.name,180),event_type:clean(d.event_type,120)||null,description:clean(d.description,5000)||null,price:money(d.price),deposit_type:['full','percent','fixed'].includes(d.deposit_type)?d.deposit_type:'percent',deposit_value:money(d.deposit_value),booking_class:d.booking_class==='exclusive'?'exclusive':'general',duration_hours:Math.max(0,Number(d.duration_hours)||0)||null,active:d.active===undefined?true:bool(d.active),sort_order:Number(d.sort_order)||100,updated_at:new Date().toISOString()};if(!row.name)throw new Error('Package name is required.');if(d.id){await supabase(`tenant_booking_packages?id=eq.${enc(d.id)}&tenant_id=eq.${enc(ctx.tenant.id)}`,{method:'PATCH',body:row,prefer:'return=minimal'});return json({ok:true,id:d.id})}const r=await supabase('tenant_booking_packages',{method:'POST',body:row});return json({ok:true,package:r?.[0]});
 }
 if(request.method==='DELETE'&&action==='package'){if(!d.id)throw new Error('Package ID required.');await supabase(`tenant_booking_packages?id=eq.${enc(d.id)}&tenant_id=eq.${enc(ctx.tenant.id)}`,{method:'DELETE',prefer:'return=minimal'});return json({ok:true})}
 if(request.method==='POST'&&action==='addon'){
  const row={tenant_id:ctx.tenant.id,name:clean(d.name,180),description:clean(d.description,3000)||null,price:money(d.price),active:d.active===undefined?true:bool(d.active),sort_order:Number(d.sort_order)||100,updated_at:new Date().toISOString()};if(!row.name)throw new Error('Add-on name is required.');if(d.id){await supabase(`tenant_booking_addons?id=eq.${enc(d.id)}&tenant_id=eq.${enc(ctx.tenant.id)}`,{method:'PATCH',body:row,prefer:'return=minimal'});return json({ok:true,id:d.id})}const r=await supabase('tenant_booking_addons',{method:'POST',body:row});return json({ok:true,addon:r?.[0]});
 }
 if(request.method==='DELETE'&&action==='addon'){if(!d.id)throw new Error('Add-on ID required.');await supabase(`tenant_booking_addons?id=eq.${enc(d.id)}&tenant_id=eq.${enc(ctx.tenant.id)}`,{method:'DELETE',prefer:'return=minimal'});return json({ok:true})}
 if(request.method==='POST'&&action==='rental-status'){
  const allowed=['requested','paid','reserved','checked_out','returned','canceled'];if(!allowed.includes(d.status))throw new Error('Invalid rental status.');const order=(await supabase(`tenant_rental_orders?id=eq.${enc(d.id||'')}&tenant_id=eq.${enc(ctx.tenant.id)}&select=*&limit=1`))?.[0];if(!order)throw new Error('Rental order not found.');await supabase(`tenant_rental_orders?id=eq.${enc(order.id)}`,{method:'PATCH',body:{status:d.status,updated_at:new Date().toISOString()},prefer:'return=minimal'});if(['checked_out','returned','canceled'].includes(d.status))await supabase(`tenant_rental_reservations?order_id=eq.${enc(order.id)}&tenant_id=eq.${enc(ctx.tenant.id)}`,{method:'PATCH',body:{status:d.status==='canceled'?'canceled':d.status,updated_at:new Date().toISOString()},prefer:'return=minimal'});return json({ok:true});
 }
 return json({error:'Method not allowed'},405);
}catch(e){return json({error:e.message},e.status||500)}};
