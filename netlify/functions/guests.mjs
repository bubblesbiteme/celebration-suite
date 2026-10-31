import {json,supabase,clean,origin} from './_shared.mjs';
import {tenantContext,requireActive,requirePermission,assertEventAccess} from './_tenant.mjs';
import {sendTenantEmail} from './_mailer.mjs';
const allowedStatus=new Set(['pending','attending','declined','waitlist']);
const code=()=>crypto.randomUUID().replaceAll('-','').slice(0,12);
const n=(v,min=0,max=99)=>Math.max(min,Math.min(max,Number(v)||0));
const cleanList=v=>Array.isArray(v)?v.map(x=>clean(x,160)).filter(Boolean).slice(0,30):[];
const guestPayload=d=>({
 full_name:clean(d.full_name,180),email:clean(d.email,180).toLowerCase()||null,phone:clean(d.phone,80)||null,
 party_size:n(d.party_size||1,1,30),attending_count:n(d.attending_count,0,30),child_count:n(d.child_count,0,30),
 rsvp_status:allowedStatus.has(d.rsvp_status)?d.rsvp_status:'pending',meal_choice:clean(d.meal_choice,160)||null,
 meal_choices:cleanList(d.meal_choices),dietary:clean(d.dietary,1000)||null,table_name:clean(d.table_name,120)||null,
 seat_label:clean(d.seat_label,120)||null,household:clean(d.household,180)||null,vip:!!d.vip,
 plus_one_name:clean(d.plus_one_name,180)||null,song_request:clean(d.song_request,300)||null,
 accessibility_needs:clean(d.accessibility_needs,1000)||null,hotel_name:clean(d.hotel_name,180)||null,
 transportation_notes:clean(d.transportation_notes,1000)||null,guest_tags:clean(d.guest_tags,500)||null,
 check_in_notes:clean(d.check_in_notes,1000)||null,tags:Array.isArray(d.tags)?d.tags.map(x=>clean(x,80)).filter(Boolean).slice(0,30):[],
 notes:clean(d.notes,2000)||null
});
export default async request=>{try{
 const ctx=await tenantContext(request);requireActive(ctx);requirePermission(ctx,'manage_guests');
 const u=new URL(request.url),id=u.searchParams.get('id'),eventId=u.searchParams.get('event_id'),action=u.searchParams.get('action');
 if(request.method==='GET'){
  if(!eventId)throw new Error('Event ID required.');await assertEventAccess(ctx,eventId);
  const event=(await supabase(`tenant_events?id=eq.${encodeURIComponent(eventId)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=*&limit=1`))?.[0];
  const [guests,ticketAttendees]=await Promise.all([supabase(`tenant_guests?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&event_id=eq.${encodeURIComponent(eventId)}&select=*&order=full_name.asc&limit=5000`),supabase(`tenant_ticket_attendees?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&event_id=eq.${encodeURIComponent(eventId)}&select=*&order=created_at.asc&limit=5000`).catch(()=>[])]);
  return json({event,guests,ticket_attendees:ticketAttendees,site:origin(request)});
 }
 const d=await request.json().catch(()=>({}));
 if(action==='settings'&&request.method==='PATCH'){
  if(!d.event_id)throw new Error('Event ID required.');await assertEventAccess(ctx,d.event_id);const current=(await supabase(`tenant_events?id=eq.${encodeURIComponent(d.event_id)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=invitation_settings&limit=1`))?.[0];
  const settings={...(current?.invitation_settings||{}),...(d.settings||{})};
  for(const k of ['title','welcome_message','event_start_time','event_location','rsvp_deadline','style','primary_color','secondary_color','accent_color'])if(k in settings)settings[k]=clean(settings[k],k==='welcome_message'?3000:300);
  settings.meal_options=cleanList(settings.meal_options);settings.allow_plus_one=!!settings.allow_plus_one;settings.ask_dietary=!!settings.ask_dietary;settings.ask_song=!!settings.ask_song;settings.collect_meal=!!settings.collect_meal;settings.rsvp_open=settings.rsvp_open!==false;
  await supabase(`tenant_events?id=eq.${encodeURIComponent(d.event_id)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}`,{method:'PATCH',body:{invitation_settings:settings,updated_at:new Date().toISOString()},prefer:'return=minimal'});return json({ok:true,settings});
 }
 if(action==='bulk-import'&&request.method==='POST'){
  if(!d.event_id||!Array.isArray(d.rows))throw new Error('Event and rows are required.');await assertEventAccess(ctx,d.event_id);
  const rows=d.rows.slice(0,3000).map(r=>({tenant_id:ctx.tenant.id,event_id:d.event_id,...guestPayload({...r,full_name:r.full_name||[r.first_name,r.last_name].filter(Boolean).join(' ')}),invitation_code:code()})).filter(r=>r.full_name);
  if(rows.length)await supabase('tenant_guests',{method:'POST',body:rows,prefer:'return=minimal'});return json({ok:true,imported:rows.length});
 }
 if(action==='send-invite'&&request.method==='POST'){
  if(!d.id)throw new Error('Guest ID required.');const guest=(await supabase(`tenant_guests?id=eq.${encodeURIComponent(d.id)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=*&limit=1`))?.[0];if(!guest)throw new Error('Guest not found.');await assertEventAccess(ctx,guest.event_id);if(!guest.email)throw new Error('Guest has no email address.');
  const event=(await supabase(`tenant_events?id=eq.${encodeURIComponent(guest.event_id)}&select=id,title,event_date,venue,invitation_settings&limit=1`))?.[0],settings=event?.invitation_settings||{},inviteCode=guest.invitation_code||code();if(!guest.invitation_code)await supabase(`tenant_guests?id=eq.${encodeURIComponent(guest.id)}`,{method:'PATCH',body:{invitation_code:inviteCode},prefer:'return=minimal'});
  const link=`${origin(request)}/rsvp-public.html?event=${encodeURIComponent(event.id)}&code=${encodeURIComponent(inviteCode)}`;
  const body=`You're invited to ${event.title}.\n\n${settings.welcome_message||''}\n\nDate: ${event.event_date||'TBD'}${settings.event_start_time?` at ${settings.event_start_time}`:''}\nLocation: ${settings.event_location||event.venue||'TBD'}\n\nRSVP: ${link}`;
  await sendTenantEmail(ctx.tenant,{to:guest.email,subject:settings.title||`You're invited: ${event.title}`,body});await supabase(`tenant_guests?id=eq.${encodeURIComponent(guest.id)}`,{method:'PATCH',body:{invitation_sent_at:new Date().toISOString()},prefer:'return=minimal'});return json({ok:true,link});
 }
 if(action==='send-all'&&request.method==='POST'){
  if(!d.event_id)throw new Error('Event ID required.');await assertEventAccess(ctx,d.event_id);const guests=await supabase(`tenant_guests?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&event_id=eq.${encodeURIComponent(d.event_id)}&email=not.is.null&invitation_sent_at=is.null&select=id`);let sent=0,failed=0;for(const g of guests||[]){try{const fake=new Request(`${request.url.split('?')[0]}?action=send-invite`,{method:'POST',headers:request.headers,body:JSON.stringify({id:g.id})});const r=await (await import('./guests.mjs')).default(fake);if(r.ok)sent++;else failed++;}catch{failed++;}}return json({ok:true,sent,failed});
 }
 if(action==='bulk-status'&&request.method==='PATCH'){
  const ids=Array.isArray(d.ids)?d.ids.filter(Boolean).slice(0,3000):[];if(!ids.length)throw new Error('Choose guests first.');const patch={updated_at:new Date().toISOString()};if(d.rsvp_status&&allowedStatus.has(d.rsvp_status))patch.rsvp_status=d.rsvp_status;if('table_name'in d)patch.table_name=clean(d.table_name,120)||null;if('meal_choice'in d)patch.meal_choice=clean(d.meal_choice,160)||null;if('vip'in d)patch.vip=!!d.vip;if('checked_in'in d){patch.checked_in_at=d.checked_in?new Date().toISOString():null;patch.checked_in_count=d.checked_in?1:0;patch.attendance_status=d.checked_in?'checked_in':'expected';}
  await supabase(`tenant_guests?id=in.(${ids.join(',')})&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}`,{method:'PATCH',body:patch,prefer:'return=minimal'});return json({ok:true});
 }
 if(request.method==='POST'){
  if(!d.event_id)throw new Error('Event ID required.');await assertEventAccess(ctx,d.event_id);const payload=guestPayload(d);if(!payload.full_name)throw new Error('Guest name is required.');const rows=await supabase('tenant_guests',{method:'POST',body:{tenant_id:ctx.tenant.id,event_id:d.event_id,...payload,invitation_code:code()}});return json({ok:true,guest:rows?.[0]});
 }
 const targetId=d.id||id;if(!targetId)throw new Error('Guest ID required.');const guest=(await supabase(`tenant_guests?id=eq.${encodeURIComponent(targetId)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=*&limit=1`))?.[0];if(!guest)throw new Error('Guest not found.');await assertEventAccess(ctx,guest.event_id);
 if(request.method==='PATCH'){
  if(action==='checkin'){const count=n(d.checked_in_count||guest.attending_count||1,0,30);await supabase(`tenant_guests?id=eq.${encodeURIComponent(targetId)}`,{method:'PATCH',body:{checked_in_at:d.checked_in===false?null:new Date().toISOString(),checked_in_count:d.checked_in===false?0:count,attendance_status:d.checked_in===false?'expected':'checked_in',updated_at:new Date().toISOString()},prefer:'return=minimal'});return json({ok:true});}
  const patch={...guestPayload({...guest,...d}),updated_at:new Date().toISOString()};delete patch.full_name;if('full_name'in d)patch.full_name=clean(d.full_name,180);await supabase(`tenant_guests?id=eq.${encodeURIComponent(targetId)}`,{method:'PATCH',body:patch,prefer:'return=minimal'});return json({ok:true});
 }
 if(request.method==='DELETE'){await supabase(`tenant_guests?id=eq.${encodeURIComponent(targetId)}`,{method:'DELETE',prefer:'return=minimal'});return json({ok:true});}
 return json({error:'Method not allowed'},405);
}catch(e){return json({error:e.message},e.status||500)}};
