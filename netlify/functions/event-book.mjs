import {json,supabase} from './_shared.mjs';import {tenantContext,requireActive,requirePermission,assertEventAccess} from './_tenant.mjs';
export default async request=>{try{const ctx=await tenantContext(request);requireActive(ctx);requirePermission(ctx,'view_events');const u=new URL(request.url),eventId=u.searchParams.get('event_id');if(!eventId)throw new Error('Event ID required.');await assertEventAccess(ctx,eventId);const enc=encodeURIComponent,tid=enc(ctx.tenant.id),eid=enc(eventId);const event=(await supabase(`tenant_events?id=eq.${eid}&tenant_id=eq.${tid}&select=*&limit=1`))?.[0];if(!event)throw new Error('Event not found.');const [guests,vendors,reservations,inventory,documents,approvals,changeOrders,questionnaires,invoices,inspiration,designBoard]=await Promise.all([
 supabase(`tenant_guests?tenant_id=eq.${tid}&event_id=eq.${eid}&select=*&order=full_name.asc&limit=2000`),
 supabase(`tenant_vendors?tenant_id=eq.${tid}&event_id=eq.${eid}&select=*&order=category.asc,business_name.asc&limit=1000`),
 supabase(`tenant_inventory_reservations?tenant_id=eq.${tid}&event_id=eq.${eid}&select=*&limit=2000`),
 supabase(`tenant_inventory_items?tenant_id=eq.${tid}&select=*&order=name.asc&limit=3000`),
 supabase(`tenant_documents?tenant_id=eq.${tid}&event_id=eq.${eid}&select=*&order=created_at.desc&limit=1000`),
 supabase(`tenant_approvals?tenant_id=eq.${tid}&event_id=eq.${eid}&select=*&order=created_at.desc&limit=1000`),
 supabase(`tenant_change_orders?tenant_id=eq.${tid}&event_id=eq.${eid}&select=*&order=created_at.desc&limit=1000`),
 supabase(`tenant_questionnaires?tenant_id=eq.${tid}&event_id=eq.${eid}&select=*&order=created_at.desc&limit=1000`),
 supabase(`tenant_invoices?tenant_id=eq.${tid}&event_id=eq.${eid}&select=*&order=created_at.desc&limit=1000`),
 supabase(`tenant_inspiration_items?tenant_id=eq.${tid}&event_id=eq.${eid}&select=*&order=z_index.asc,created_at.asc&limit=1000`),
 supabase(`tenant_inspiration_boards?tenant_id=eq.${tid}&event_id=eq.${eid}&select=*&limit=1`)
 ]);return json({tenant:{id:ctx.tenant.id,business_name:ctx.tenant.business_name,branding:ctx.tenant.branding},event,guests,vendors,reservations,inventory,documents,approvals,change_orders:changeOrders,questionnaires,invoices,inspiration,design_board:designBoard?.[0]||null});}catch(e){return json({error:e.message},e.status||500)}};
