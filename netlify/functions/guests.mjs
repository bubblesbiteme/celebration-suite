import {json,supabase,clean,origin} from './_shared.mjs';
import {tenantContext,requireActive,requirePermission,assertEventAccess} from './_tenant.mjs';
import {sendTenantEmail} from './_mailer.mjs';
const allowedStatus=new Set(['pending','attending','declined','waitlist']);
const code=()=>crypto.randomUUID().replaceAll('-','').slice(0,12);
export default async request=>{try{
 const ctx=await tenantContext(request);requireActive(ctx);requirePermission(ctx,'manage_guests');
 const u=new URL(request.url),id=u.searchParams.get('id'),eventId=u.searchParams.get('event_id'),action=u.searchParams.get('action');
 if(request.method==='GET'){
  if(!eventId)throw new Error('Event ID required.');await assertEventAccess(ctx,eventId);
  const event=(await supabase(`tenant_events?id=eq.${encodeURIComponent(eventId)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=id,title,event_date,venue,client_portal_token,invitation_settings&limit=1`))?.[0];
  const guests=await supabase(`tenant_guests?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&event_id=eq.${encodeURIComponent(eventId)}&select=*&order=full_name.asc&limit=5000`);
  return json({event,guests});
 }
 const d=await request.json().catch(()=>({}));
 if(action==='settings'&&request.method==='PATCH'){
  if(!d.event_id)throw new Error('Event ID required.');await assertEventAccess(ctx,d.event_id);
  const settings={...(d.settings||{})};
  for(const k of ['title','welcome_message','event_start_time','event_location','rsvp_deadline','style','primary_color','secondary_color','accent_color'])if(k in settings)settings[k]=clean(settings[k],k==='welcome_message'?3000:300);
  settings.meal_options=Array.isArray(settings.meal_options)?settings.meal_options.map(x=>clean(x,120)).filter(Boolean).slice(0,20):[];
  settings.allow_plus_one=!!settings.allow_plus_one;settings.ask_dietary=!!settings.ask_dietary;settings.ask_song=!!settings.ask_song;settings.rsvp_open=settings.rsvp_open!==false;
  await supabase(`tenant_events?id=eq.${encodeURIComponent(d.event_id)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}`,{method:'PATCH',body:{invitation_settings:settings,updated_at:new Date().toISOString()},prefer:'return=minimal'});return json({ok:true});
 }
 if(action==='bulk-import'&&request.method==='POST'){
  if(!d.event_id||!Array.isArray(d.rows))throw new Error('Event and rows are required.');await assertEventAccess(ctx,d.event_id);
  const rows=d.rows.slice(0,3000).map(r=>({tenant_id:ctx.tenant.id,event_id:d.event_id,full_name:clean(r.full_name||r.name,180),email:clean(r.email,180).toLowerCase()||null,phone:clean(r.phone,80)||null,party_size:Math.max(1,Number(r.party_size)||1),rsvp_status:allowedStatus.has(r.rsvp_status)?r.rsvp_status:'pending',meal_choice:clean(r.meal_choice,120)||null,dietary:clean(r.dietary,500)||null,table_name:clean(r.table_name,120)||null,household:clean(r.household,160)||null,vip:String(r.vip).toLowerCase()==='true'||String(r.vip)==='1',notes:clean(r.notes,1500)||null,invitation_code:code()})).filter(r=>r.full_name);
  if(rows.length)await supabase('tenant_guests',{method:'POST',body:rows,prefer:'return=minimal'});return json({ok:true,imported:rows.length});
 }
 if(action==='send-invite'&&request.method==='POST'){
  if(!d.id)throw new Error('Guest ID required.');const guest=(await supabase(`tenant_guests?id=eq.${encodeURIComponent(d.id)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=*&limit=1`))?.[0];if(!guest)throw new Error('Guest not found.');await assertEventAccess(ctx,guest.event_id);if(!guest.email)throw new Error('Guest has no email address.');
  const event=(await supabase(`tenant_events?id=eq.${encodeURIComponent(guest.event_id)}&select=id,title,event_date,venue,invitation_settings&limit=1`))?.[0],settings=event?.invitation_settings||{},inviteCode=guest.invitation_code||code();if(!guest.invitation_code)await supabase(`tenant_guests?id=eq.${encodeURIComponent(guest.id)}`,{method:'PATCH',body:{invitation_code:inviteCode},prefer:'return=minimal'});
  const link=`${origin(request)}/rsvp-public.html?event=${encodeURIComponent(event.id)}&code=${encodeURIComponent(inviteCode)}`;
  const body=`You're invited to ${event.title}.\n\n${settings.welcome_message||''}\n\nDate: ${event.event_date||'TBD'}${settings.event_start_time?` at ${settings.event_start_time}`:''}\nLocation: ${settings.event_location||event.venue||'TBD'}\n\nRSVP: ${link}\n\nInvitation code: ${inviteCode}`;
  await sendTenantEmail(ctx.tenant,{to:guest.email,subject:settings.title||`You're invited: ${event.title}`,body});await supabase(`tenant_guests?id=eq.${encodeURIComponent(guest.id)}`,{method:'PATCH',body:{invitation_sent_at:new Date().toISOString()},prefer:'return=minimal'});return json({ok:true,link});
 }
 if(action==='send-all'&&request.method==='POST'){
  if(!d.event_id)throw new Error('Event ID required.');await assertEventAccess(ctx,d.event_id);const guests=await supabase(`tenant_guests?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&event_id=eq.${encodeURIComponent(d.event_id)}&email=not.is.null&invitation_sent_at=is.null&select=id`);let sent=0,failed=0;for(const g of guests||[]){try{const fake=new Request(`${request.url.split('?')[0]}?action=send-invite`,{method:'POST',headers:request.headers,body:JSON.stringify({id:g.id})});const r=await (await import('./guests.mjs')).default(fake);if(r.ok)sent++;else failed++;}catch{failed++;}}return json({ok:true,sent,failed});
 }
 if(action==='bulk-status'&&request.method==='PATCH'){
  const ids=Array.isArray(d.ids)?d.ids.filter(Boolean).slice(0,3000):[];if(!ids.length)throw new Error('Choose guests first.');if(!allowedStatus.has(d.rsvp_status))throw new Error('Invalid RSVP status.');await supabase(`tenant_guests?id=in.(${ids.join(',')})&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}`,{method:'PATCH',body:{rsvp_status:d.rsvp_status,updated_at:new Date().toISOString()},prefer:'return=minimal'});return json({ok:true});
 }
 if(request.method==='POST'){
  if(!d.event_id)throw new Error('Event ID required.');await assertEventAccess(ctx,d.event_id);const rows=await supabase('tenant_guests',{method:'POST',body:{tenant_id:ctx.tenant.id,event_id:d.event_id,full_name:clean(d.full_name,180),email:clean(d.email,180).toLowerCase()||null,phone:clean(d.phone,80)||null,party_size:Math.max(1,Number(d.party_size)||1),rsvp_status:allowedStatus.has(d.rsvp_status)?d.rsvp_status:'pending',meal_choice:clean(d.meal_choice,120)||null,dietary:clean(d.dietary,500)||null,table_name:clean(d.table_name,120)||null,household:clean(d.household,160)||null,vip:!!d.vip,plus_one_name:clean(d.plus_one_name,180)||null,song_request:clean(d.song_request,300)||null,tags:Array.isArray(d.tags)?d.tags.map(x=>clean(x,80)).filter(Boolean).slice(0,20):[],notes:clean(d.notes,1500)||null,invitation_code:code()}});return json({ok:true,guest:rows?.[0]});
 }
 const targetId=d.id||id;if(!targetId)throw new Error('Guest ID required.');const guest=(await supabase(`tenant_guests?id=eq.${encodeURIComponent(targetId)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=*&limit=1`))?.[0];if(!guest)throw new Error('Guest not found.');await assertEventAccess(ctx,guest.event_id);
 if(request.method==='PATCH'){const patch={updated_at:new Date().toISOString()};if(action==='checkin'){patch.checked_in_at=d.checked_in===false?null:new Date().toISOString();patch.attendance_status=d.checked_in===false?'expected':'checked_in';}else{for(const k of ['full_name','email','phone','rsvp_status','meal_choice','dietary','table_name','household','plus_one_name','song_request','notes','attendance_status'])if(k in d)patch[k]=typeof d[k]==='string'?clean(d[k],k==='notes'?1500:500):d[k];if('party_size'in d)patch.party_size=Math.max(1,Number(d.party_size)||1);if('vip'in d)patch.vip=!!d.vip;if('tags'in d)patch.tags=Array.isArray(d.tags)?d.tags.map(x=>clean(x,80)).filter(Boolean).slice(0,20):[];}await supabase(`tenant_guests?id=eq.${encodeURIComponent(targetId)}`,{method:'PATCH',body:patch,prefer:'return=minimal'});return json({ok:true});}
 if(request.method==='DELETE'){await supabase(`tenant_guests?id=eq.${encodeURIComponent(targetId)}`,{method:'DELETE',prefer:'return=minimal'});return json({ok:true});}
 return json({error:'Method not allowed'},405);
}catch(e){return json({error:e.message},e.status||500)}};
