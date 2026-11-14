import {json,supabase,clean} from './_shared.mjs';
import {readPlatformSession} from './_session.mjs';

const allowed=req=>{
  if(readPlatformSession(req))return true;
  const supplied=req.headers.get('x-platform-admin-key')||'',expected=process.env.PLATFORM_ADMIN_KEY||'';
  return !!(expected&&supplied===expected);
};
const newCode=()=>`PLAN-${crypto.randomUUID().replaceAll('-','').slice(0,12).toUpperCase()}`;
const planValue=v=>v==='annual_unlimited'?'annual_unlimited':'single_event';
const codeNote=(order,orderId)=>`Order ${order.external_order_id||orderId}${order.buyer_email?` · ${order.buyer_email}`:''}`;

export default async request=>{
  try{
    if(!allowed(request))return json({error:'Unauthorized'},401);

    if(request.method==='GET'){
      const rows=await supabase('platform_orders?select=*&order=created_at.desc&limit=1000');
      return json({orders:rows||[]});
    }

    if(request.method==='POST'){
      const d=await request.json();
      const plan=planValue(d.plan_type);
      if(plan==='single_event'&&!d.event_date)throw new Error('Event date is required for a Single Event order.');
      const order={
        buyer_name:clean(d.buyer_name,180)||null,
        buyer_email:clean(d.buyer_email,180).toLowerCase()||null,
        source:clean(d.source,80)||'marketplace',
        external_order_id:clean(d.external_order_id,180)||null,
        plan_type:plan,
        event_date:plan==='single_event'?(d.event_date||null):null,
        amount_cents:Math.max(0,Math.round(Number(d.amount||0)*100))||null,
        notes:clean(d.notes,1000)||null,
        status:'pending'
      };
      const made=await supabase('platform_orders',{method:'POST',body:order});
      const o=made?.[0]||order;
      const codeRow={code:newCode(),plan_type:plan,source:order.source,note:codeNote(order,o.id)};
      const code=await supabase('license_codes',{method:'POST',body:codeRow});
      const c=code?.[0]||codeRow;
      await supabase(`platform_orders?id=eq.${encodeURIComponent(o.id)}`,{method:'PATCH',body:{status:'fulfilled',license_code_id:c.id,fulfilled_at:new Date().toISOString(),updated_at:new Date().toISOString()},prefer:'return=minimal'});
      return json({ok:true,order:{...o,status:'fulfilled',license_code_id:c.id},license_code:c.code,fulfillment:{activation_url:`https://planner.sageandcelebration.com/register.html?code=${encodeURIComponent(c.code)}`,buyer_email:order.buyer_email}});
    }

    if(request.method==='PATCH'){
      const d=await request.json();
      const id=clean(d.id,80);
      if(!id)throw new Error('Order ID is required.');
      const currentRows=await supabase(`platform_orders?id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
      const current=currentRows?.[0];
      if(!current)throw new Error('Fulfillment order not found.');
      const codeRows=current.license_code_id?await supabase(`license_codes?id=eq.${encodeURIComponent(current.license_code_id)}&select=*&limit=1`):[];
      const code=codeRows?.[0]||null;
      const plan=planValue(d.plan_type||current.plan_type);
      if(code?.redeemed_at&&plan!==current.plan_type)throw new Error('This activation code has already been redeemed. The plan can no longer be changed.');
      if(plan==='single_event'&&!d.event_date)throw new Error('Event date is required for a Single Event order.');
      const updated={
        buyer_name:clean(d.buyer_name,180)||null,
        buyer_email:clean(d.buyer_email,180).toLowerCase()||null,
        external_order_id:clean(d.external_order_id,180)||null,
        plan_type:plan,
        event_date:plan==='single_event'?(d.event_date||null):null,
        amount_cents:Math.max(0,Math.round(Number(d.amount||0)*100))||null,
        notes:clean(d.notes,1000)||current.notes||null,
        updated_at:new Date().toISOString()
      };
      await supabase(`platform_orders?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',body:updated,prefer:'return=minimal'});
      if(code&&!code.redeemed_at){
        await supabase(`license_codes?id=eq.${encodeURIComponent(code.id)}`,{method:'PATCH',body:{plan_type:plan,note:codeNote(updated,id)},prefer:'return=minimal'});
      }
      return json({ok:true,order:{...current,...updated},code:code?{...code,plan_type:plan}:null});
    }

    if(request.method==='DELETE'){
      const d=await request.json();
      const id=clean(d.id,80);
      if(!id)throw new Error('Order ID is required.');
      const currentRows=await supabase(`platform_orders?id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
      const current=currentRows?.[0];
      if(!current)throw new Error('Fulfillment order not found.');
      if(current.status==='voided')return json({ok:true,already_voided:true});
      let code=null;
      if(current.license_code_id){
        const codeRows=await supabase(`license_codes?id=eq.${encodeURIComponent(current.license_code_id)}&select=*&limit=1`);
        code=codeRows?.[0]||null;
        if(code?.redeemed_at)throw new Error('This activation code has already been redeemed and cannot be voided.');
        if(code)await supabase(`license_codes?id=eq.${encodeURIComponent(code.id)}`,{method:'DELETE',prefer:'return=minimal'});
      }
      await supabase(`platform_orders?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',body:{status:'voided',license_code_id:null,notes:`${current.notes?`${current.notes}\n`:''}Voided by platform owner`,updated_at:new Date().toISOString()},prefer:'return=minimal'});
      return json({ok:true});
    }

    return json({error:'Method not allowed'},405);
  }catch(e){
    return json({error:e.message},e.status||500);
  }
};
