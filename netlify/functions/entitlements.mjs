import {json} from './_shared.mjs';
import {tenantContext} from './_tenant.mjs';

export function entitlementFor(ctx){
  const plan=ctx.license?.plan_type||'none';
  const single=plan==='single_event';
  return {
    plan_type:plan,
    active:!!ctx.active,
    event_limit:single?1:null,
    modules:{
      crm:true,proposals:true,contracts:true,financials:true,calendar:true,communications:true,
      vendors:true,inventory:true,inspiration:true,floorplans:true,guests:true,rsvp:true,ticketing:true,
      questionnaires:true,approvals:true,event_day:true,client_portal:true,commerce:true,integrations:true,
      analytics:true,backup_restore:true,team:true
    },
    restrictions:single?['single_event_only']:[],
    expires_at:ctx.license?.expires_at||null,
    grace_until:ctx.license?.grace_until||null,
    trial_ends_at:ctx.license?.trial_ends_at||null,
    status:ctx.license?.status||'inactive'
  };
}
export default async request=>{try{const ctx=await tenantContext(request);return json({entitlements:entitlementFor(ctx),tenant:{id:ctx.tenant.id,status:ctx.tenant.status}})}catch(e){return json({error:e.message},e.status||500)}};
