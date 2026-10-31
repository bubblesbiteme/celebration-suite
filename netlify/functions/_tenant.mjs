import {supabase} from './_shared.mjs';
import {readSession} from './_session.mjs';
const roleDefaults={owner:['*'],admin:['*'],planner:['view_events','manage_events','manage_clients','manage_leads','manage_vendors','manage_inventory','manage_guests','manage_approvals','manage_floorplans','event_day','time_tracking'],staff:['view_events','manage_guests','event_day','time_tracking']};
export async function tenantContext(request){
 const session=readSession(request);if(!session)throw Object.assign(new Error('Unauthorized'),{status:401});
 const users=await supabase(`tenant_users?id=eq.${encodeURIComponent(session.user_id)}&tenant_id=eq.${encodeURIComponent(session.tenant_id)}&select=*&limit=1`),user=users?.[0];
 if(!user||user.status!=='active')throw Object.assign(new Error('Account access is disabled.'),{status:401});
 const tenants=await supabase(`tenants?id=eq.${encodeURIComponent(session.tenant_id)}&select=*&limit=1`);const tenant=tenants?.[0];if(!tenant)throw Object.assign(new Error('Account not found.'),{status:401});
 const licenses=await supabase(`licenses?tenant_id=eq.${encodeURIComponent(tenant.id)}&status=in.(active,past_due,grace)&select=*&order=created_at.desc&limit=20`);
 const now=Date.now();
 const usable=(licenses||[]).filter(l=>{const expires=l?.expires_at?Date.parse(l.expires_at):0,graceEnd=l?.grace_until?Date.parse(l.grace_until):0;return (['active','grace'].includes(l.status)&&(!expires||expires>now))||(l.status==='past_due'&&graceEnd>now)});
 usable.sort((a,b)=>Math.max(Date.parse(b.grace_until||0)||0,Date.parse(b.expires_at||0)||0)-Math.max(Date.parse(a.grace_until||0)||0,Date.parse(a.expires_at||0)||0));
 const license=usable[0]||licenses?.[0]||null;
 const expires=license?.expires_at?Date.parse(license.expires_at):0,graceEnd=license?.grace_until?Date.parse(license.grace_until):0;
 const licenseUsable=Boolean(license&&((['active','grace'].includes(license.status)&&(!expires||expires>now))||(license.status==='past_due'&&graceEnd>now)));
 const tenantUsable=!['billing_suspended','suspended','closed'].includes(tenant.status);
 return{session:{...session,role:user.role},user,tenant,license,active:licenseUsable&&tenantUsable}
}
export function requireActive(ctx){if(!ctx.active)throw Object.assign(new Error('Subscription or license inactive. Update billing to restore access.'),{status:402})}
export function eventLimit(ctx){return ctx.license?.plan_type==='single_event'?1:null}
export function hasPermission(ctx,permission){if(['owner','admin'].includes(ctx.user?.role))return true;const custom=ctx.user?.permissions||{};if(custom[permission]===true)return true;if(custom[permission]===false)return false;return (roleDefaults[ctx.user?.role]||[]).includes(permission)}
export function requirePermission(ctx,permission){if(!hasPermission(ctx,permission))throw Object.assign(new Error('You do not have permission to perform this action.'),{status:403})}
export async function assignedEventIds(ctx){if(['owner','admin'].includes(ctx.user?.role))return null;const rows=await supabase(`tenant_event_assignments?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&user_id=eq.${encodeURIComponent(ctx.user.id)}&select=event_id`);return new Set((rows||[]).map(x=>x.event_id))}
export async function assertEventAccess(ctx,eventId){if(!eventId)return;const ids=await assignedEventIds(ctx);if(ids&&!ids.has(eventId))throw Object.assign(new Error('You are not assigned to this event.'),{status:403})}
