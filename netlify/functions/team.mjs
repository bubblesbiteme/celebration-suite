import {json,supabase,clean,origin} from './_shared.mjs';import {tenantContext,requireActive,requirePermission} from './_tenant.mjs';import {sendTenantEmail} from './_mailer.mjs';
const roles=new Set(['admin','planner','staff']);
export default async request=>{try{const ctx=await tenantContext(request);requireActive(ctx);requirePermission(ctx,'manage_team');const u=new URL(request.url),action=u.searchParams.get('action')||'';
 if(request.method==='GET'){
  const users=await supabase(`tenant_users?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=id,email,full_name,role,status,permissions,hourly_rate,last_login_at,created_at&order=created_at.asc`);
  const invites=await supabase(`tenant_staff_invites?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=*&order=created_at.desc&limit=100`);
  const assignments=await supabase(`tenant_event_assignments?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=*&order=created_at.desc&limit=1000`);
  const events=await supabase(`tenant_events?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=id,title,event_date,status&order=event_date.asc.nullslast`);
  return json({users,invites,assignments,events});
 }
 const d=await request.json();
 if(request.method==='POST'&&action==='invite'){
  const email=clean(d.email,180).toLowerCase(),full_name=clean(d.full_name,160),role=roles.has(d.role)?d.role:'staff';if(!email)throw new Error('Email is required.');
  const existing=await supabase(`tenant_users?email=ilike.${encodeURIComponent(email)}&select=id&limit=1`);if(existing?.length)throw new Error('That email already has an account.');
  const rows=await supabase('tenant_staff_invites',{method:'POST',body:{tenant_id:ctx.tenant.id,email,full_name:full_name||null,role,permissions:d.permissions||{},expires_at:new Date(Date.now()+7*86400000).toISOString()}});const inv=rows?.[0];
  const invite_url=`${origin(request)}/staff-invite.html?token=${encodeURIComponent(inv.invite_token)}`;
  let email_sent=false;try{await sendTenantEmail(ctx.tenant,{to:email,subject:`You're invited to ${ctx.tenant.business_name}`,body:`${full_name||'Hello'},\n\nYou've been invited to join ${ctx.tenant.business_name} as ${role}. Accept your invitation and choose email/password or Google sign-in here:\n${invite_url}\n\nThis invitation expires in 7 days.`});email_sent=true}catch{}
  return json({ok:true,invite:inv,invite_url,email_sent});
 }
 if(request.method==='POST'&&action==='assign'){
  const userId=clean(d.user_id,80),eventId=clean(d.event_id,80);if(!userId||!eventId)throw new Error('Staff member and event are required.');
  const user=(await supabase(`tenant_users?id=eq.${encodeURIComponent(userId)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=id&limit=1`))?.[0];const event=(await supabase(`tenant_events?id=eq.${encodeURIComponent(eventId)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=id&limit=1`))?.[0];if(!user||!event)throw new Error('Staff member or event not found.');
  await supabase('tenant_event_assignments',{method:'POST',body:{tenant_id:ctx.tenant.id,user_id:userId,event_id:eventId,assignment_role:clean(d.assignment_role,80)||'team',notes:clean(d.notes,1000)||null},prefer:'resolution=merge-duplicates,return=minimal'});return json({ok:true});
 }
 if(request.method==='POST'&&action==='unassign'){await supabase(`tenant_event_assignments?tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&user_id=eq.${encodeURIComponent(d.user_id||'')}&event_id=eq.${encodeURIComponent(d.event_id||'')}`,{method:'DELETE',prefer:'return=minimal'});return json({ok:true});}
 if(request.method==='PATCH'){
  const id=clean(d.id,80);if(!id)throw new Error('User ID required.');const user=(await supabase(`tenant_users?id=eq.${encodeURIComponent(id)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}&select=*&limit=1`))?.[0];if(!user)throw new Error('Team member not found.');if(user.role==='owner'&&id!==ctx.user.id)throw new Error('Owner role cannot be changed here.');
  const patch={updated_at:new Date().toISOString()};if(roles.has(d.role)&&user.role!=='owner')patch.role=d.role;if(['active','disabled'].includes(d.status)&&user.role!=='owner')patch.status=d.status;if(d.permissions&&typeof d.permissions==='object')patch.permissions=d.permissions;if(d.full_name)patch.full_name=clean(d.full_name,160);if('hourly_rate'in d)patch.hourly_rate=Math.max(0,Number(d.hourly_rate)||0);
  await supabase(`tenant_users?id=eq.${encodeURIComponent(id)}&tenant_id=eq.${encodeURIComponent(ctx.tenant.id)}`,{method:'PATCH',body:patch,prefer:'return=minimal'});return json({ok:true});
 }
 return json({error:'Method not allowed'},405);
}catch(e){return json({error:e.message},e.status||500)}};
