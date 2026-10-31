import {json,supabase,clean} from './_shared.mjs';
import {tenantContext,requireActive,requirePermission,assertEventAccess} from './_tenant.mjs';

const enc=encodeURIComponent;
export default async request=>{try{
 const ctx=await tenantContext(request);requireActive(ctx);requirePermission(ctx,'manage_guests');
 const u=new URL(request.url),action=u.searchParams.get('action')||'';
 const d=await request.json().catch(()=>({}));
 if(action!=='bulkUpdate')return json({error:'Unsupported legacy guest action.'},400);
 const ids=(Array.isArray(d.ids)?d.ids:[]).filter(Boolean).slice(0,3000);
 if(!ids.length)throw new Error('Select at least one guest.');
 const rows=await supabase(`tenant_guests?tenant_id=eq.${enc(ctx.tenant.id)}&id=in.(${ids.map(enc).join(',')})&select=id,event_id`);
 if(!rows?.length)throw new Error('Guests not found.');
 const eventIds=[...new Set(rows.map(x=>x.event_id).filter(Boolean))];
 for(const eventId of eventIds)await assertEventAccess(ctx,eventId);
 const patch={updated_at:new Date().toISOString()};
 if(d.response&&['pending','attending','declined','waitlist'].includes(d.response))patch.rsvp_status=d.response;
 if(d.table_name!==undefined)patch.table_name=clean(d.table_name,120)||null;
 if(d.meal_choice!==undefined)patch.meal_choice=clean(d.meal_choice,160)||null;
 if(d.vip!==undefined)patch.vip=!!d.vip;
 if(d.checked_in!==undefined)patch.checked_in_at=d.checked_in?new Date().toISOString():null;
 for(const id of ids)await supabase(`tenant_guests?id=eq.${enc(id)}&tenant_id=eq.${enc(ctx.tenant.id)}`,{method:'PATCH',body:patch,prefer:'return=minimal'});
 return json({ok:true,count:ids.length});
}catch(e){return json({error:e.message},e.status||500)}};
