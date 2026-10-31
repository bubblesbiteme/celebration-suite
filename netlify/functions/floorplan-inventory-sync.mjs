import {json,supabase} from './_shared.mjs';
import {tenantContext,requireActive,requirePermission,assertEventAccess} from './_tenant.mjs';
const enc=encodeURIComponent;
export default async request=>{try{
  const ctx=await tenantContext(request);requireActive(ctx);requirePermission(ctx,'manage_floorplans');
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  const d=await request.json().catch(()=>({})),eventId=d.event_id;
  if(!eventId)throw new Error('Event ID required.');await assertEventAccess(ctx,eventId);
  const event=(await supabase(`tenant_events?id=eq.${enc(eventId)}&tenant_id=eq.${enc(ctx.tenant.id)}&select=id,event_date&limit=1`))?.[0];
  if(!event)throw new Error('Event not found.');
  const [plans,items]=await Promise.all([
    supabase(`tenant_floorplans?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&select=id,objects&order=updated_at.desc&limit=1`),
    supabase(`tenant_inventory_items?tenant_id=eq.${enc(ctx.tenant.id)}&is_active=eq.true&auto_reserve=eq.true&select=id,name,quantity,floor_plan_type,floor_plan_multiplier`)
  ]);
  const objects=Array.isArray(plans?.[0]?.objects)?plans[0].objects:[],counts={};
  for(const o of objects){const t=String(o.catalog_key||o.type||'');if(t)counts[t]=(counts[t]||0)+1}
  const synced=[];
  for(const item of items||[]){const qty=Math.ceil((counts[item.floor_plan_type]||0)*Number(item.floor_plan_multiplier||1));
    const existing=(await supabase(`tenant_inventory_reservations?tenant_id=eq.${enc(ctx.tenant.id)}&event_id=eq.${enc(eventId)}&inventory_item_id=eq.${enc(item.id)}&select=*&limit=1`))?.[0];
    const manual=Math.max(0,Number(existing?.manual_quantity||0));
    if(qty<=0){if(existing&&Number(existing.design_quantity||0)>0){if(manual>0)await supabase(`tenant_inventory_reservations?id=eq.${enc(existing.id)}`,{method:'PATCH',body:{design_quantity:0,quantity:manual,source:'manual',floor_plan_type:item.floor_plan_type,updated_at:new Date().toISOString()},prefer:'return=minimal'});else await supabase(`tenant_inventory_reservations?id=eq.${enc(existing.id)}`,{method:'DELETE',prefer:'return=minimal'});}continue}
    if(qty+manual>Number(item.quantity||0))throw new Error(`${item.name}: floor plan needs ${qty}, but only ${Math.max(0,Number(item.quantity||0)-manual)} are available after manual reservations.`);
    if(existing)await supabase(`tenant_inventory_reservations?id=eq.${enc(existing.id)}`,{method:'PATCH',body:{design_quantity:qty,quantity:manual+qty,source:manual?'manual+floorplan':'floorplan',floor_plan_type:item.floor_plan_type,reservation_status:'reserved',updated_at:new Date().toISOString()},prefer:'return=minimal'});
    else await supabase('tenant_inventory_reservations',{method:'POST',body:{tenant_id:ctx.tenant.id,event_id:eventId,inventory_item_id:item.id,manual_quantity:0,design_quantity:qty,quantity:qty,source:'floorplan',floor_plan_type:item.floor_plan_type,reservation_status:'reserved'}});
    synced.push({inventory_item_id:item.id,name:item.name,quantity:qty,floor_plan_type:item.floor_plan_type});
  }
  return json({ok:true,items:synced});
}catch(e){return json({error:e.message},e.status||500)}};
