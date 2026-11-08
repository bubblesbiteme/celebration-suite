import {supabase,clean} from './_shared.mjs';

const enc=v=>encodeURIComponent(String(v??''));
const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const now=()=>new Date().toISOString();
const slugify=v=>String(v||'sage-and-celebration').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'sage-and-celebration';
const goodStatus=s=>!['lost','canceled','cancelled','refunded'].includes(String(s||'').toLowerCase());
const itemStatus=s=>['idea','shortlisted','approved','rejected'].includes(String(s||'').toLowerCase())?String(s).toLowerCase():'idea';

async function one(path){return (await supabase(path))?.[0]||null}
async function ensureTenant(admin){
  let tenant=await one(`tenants?slug=eq.${enc('sage-and-celebration')}&select=*&limit=1`);
  if(!tenant){
    const made=await supabase('tenants',{method:'POST',body:{business_name:clean(admin?.display_name,180)||'Sage & Celebration',slug:'sage-and-celebration',status:'active',reply_to_email:admin?.email||null,from_name:clean(admin?.display_name,180)||'Sage & Celebration'}});
    tenant=made?.[0];
  } else if(tenant.status!=='active'){
    const rows=await supabase(`tenants?id=eq.${enc(tenant.id)}`,{method:'PATCH',body:{status:'active',updated_at:now()},prefer:'return=representation'});tenant=rows?.[0]||tenant;
  }
  if(!tenant)throw new Error('Could not create the migrated tenant workspace.');
  return tenant;
}
async function ensureLicense(tenantId){
  const rows=await supabase(`licenses?tenant_id=eq.${enc(tenantId)}&status=in.(active,grace,past_due)&select=*&order=created_at.desc&limit=10`).catch(()=>[]);
  const t=Date.now(),usable=(rows||[]).find(x=>{const exp=Date.parse(x.expires_at||0)||0,gr=Date.parse(x.grace_until||0)||0;return (['active','grace'].includes(x.status)&&(!exp||exp>t))||(x.status==='past_due'&&gr>t)});
  if(usable)return usable;
  const made=await supabase('licenses',{method:'POST',body:{tenant_id:tenantId,plan_type:'annual_unlimited',status:'active',started_at:now(),expires_at:new Date(Date.now()+366*86400000).toISOString(),source:'legacy_migration',source_reference:'sage-and-celebration-live'}});
  return made?.[0]||null;
}
async function ensurePlanner(admin,tenant){
  let u=await one(`tenant_users?email=ilike.${enc(admin.email)}&select=*&limit=1`);
  const body={tenant_id:tenant.id,email:String(admin.email).toLowerCase(),full_name:clean(admin.display_name,160)||admin.email,role:'owner',status:'active',auth_provider:'google',last_login_at:admin.last_login_at||null,updated_at:now()};
  if(u){const rows=await supabase(`tenant_users?id=eq.${enc(u.id)}`,{method:'PATCH',body,prefer:'return=representation'});u=rows?.[0]||u}
  else{const made=await supabase('tenant_users',{method:'POST',body:{id:admin.id,...body,created_at:admin.created_at||now()}});u=made?.[0]}
  return u;
}
async function ensureClientUsers(tenant){
  const legacy=await supabase('client_accounts?select=*&limit=1000').catch(()=>[]);
  const byEmail=new Map();
  for(const ca of legacy||[]){const email=String(ca.email||'').trim().toLowerCase();if(!email)continue;let u=await one(`tenant_client_users?tenant_id=eq.${enc(tenant.id)}&email=ilike.${enc(email)}&select=*&limit=1`);const body={tenant_id:tenant.id,email,full_name:clean(ca.full_name,180)||email,password_hash:ca.password_hash||null,password_salt:ca.password_salt||null,auth_provider:'password',status:ca.status==='active'?'active':'disabled',last_login_at:ca.last_login_at||null,updated_at:ca.updated_at||now()};if(u){const rows=await supabase(`tenant_client_users?id=eq.${enc(u.id)}`,{method:'PATCH',body,prefer:'return=representation'});u=rows?.[0]||u}else{const made=await supabase('tenant_client_users',{method:'POST',body:{id:ca.id,...body,created_at:ca.created_at||now()}});u=made?.[0]}if(u)byEmail.set(email,u)}
  return byEmail;
}
async function ensureEvent(tenant,b){
  let e=await one(`tenant_events?id=eq.${enc(b.id)}&tenant_id=eq.${enc(tenant.id)}&select=*&limit=1`);
  const pd=b.portal_data&&typeof b.portal_data==='object'?b.portal_data:{};
  const venue=b.venue||pd?.eventMeta?.venue||b.address||null;
  const body={tenant_id:tenant.id,title:clean(b.package_name,200)||clean(b.customer_name,200)||'Event',event_type:clean(b.booking_kind,100)||'Event',event_date:b.event_date||b.scheduled_date||b.preferred_date||null,venue:clean(venue,240)||null,client_name:clean(b.customer_name,180)||null,client_email:String(b.customer_email||'').trim().toLowerCase()||null,status:(b.event_date&&String(b.event_date)<new Date().toISOString().slice(0,10))?'completed':'active',workspace_data:pd,updated_at:b.updated_at||now()};
  if(e){const rows=await supabase(`tenant_events?id=eq.${enc(e.id)}&tenant_id=eq.${enc(tenant.id)}`,{method:'PATCH',body,prefer:'return=representation'});e=rows?.[0]||e}else{const made=await supabase('tenant_events',{method:'POST',body:{id:b.id,...body,created_at:b.created_at||now()}});e=made?.[0]}
  return e;
}
async function ensureClientAccess(tenant,event,byEmail,b){
  const email=String(b.customer_email||'').trim().toLowerCase();if(!email)return;
  let u=byEmail.get(email);
  if(!u){const made=await supabase('tenant_client_users',{method:'POST',body:{tenant_id:tenant.id,email,full_name:clean(b.customer_name,180)||email,auth_provider:'password',status:'active'}});u=made?.[0];if(u)byEmail.set(email,u)}
  if(!u)return;
  const exists=await one(`tenant_client_event_access?client_user_id=eq.${enc(u.id)}&event_id=eq.${enc(event.id)}&select=id&limit=1`);
  if(!exists)await supabase('tenant_client_event_access',{method:'POST',body:{tenant_id:tenant.id,client_user_id:u.id,event_id:event.id},prefer:'return=minimal'});
}
async function migrateDesign(tenant,b){
  const items=await supabase(`event_design_items?booking_id=eq.${enc(b.id)}&select=*&order=created_at.asc&limit=1000`).catch(()=>[]);if(!(items||[]).length)return 0;
  let board=await one(`tenant_inspiration_boards?tenant_id=eq.${enc(tenant.id)}&event_id=eq.${enc(b.id)}&select=*&limit=1`);if(!board){const made=await supabase('tenant_inspiration_boards',{method:'POST',body:{tenant_id:tenant.id,event_id:b.id,title:'Inspiration Board',background:'paper',canvas_height:820,client_can_arrange:true}});board=made?.[0]}
  const layout=b.portal_data?.inspiration_board_layout?.items||{};
  let count=0;
  for(const di of items||[]){if(!di.image_url)continue;const p=layout?.[String(di.id)]||{};const body={tenant_id:tenant.id,event_id:b.id,image_url:di.image_url,title:di.title||'',notes:di.notes||null,x:n(p.x,8),y:n(p.y,8),width:n(p.w??p.width,26),height:n(p.h??p.height,26),rotation:n(p.r??p.rotation,0),z_index:Math.round(n(p.z??p.z_index,1)),category:clean(di.category,100)||'overall',status:itemStatus(di.status),is_client_visible:di.is_client_visible!==false,requested_quantity:Math.max(1,Math.round(n(di.requested_quantity,1))),locked:false,client_note:di.client_feedback||null,approved_at:itemStatus(di.status)==='approved'?(di.client_reviewed_at||di.updated_at||null):null,added_by_type:String(di.created_by||'').toLowerCase().includes('client')?'client':'planner',lock_version:1,updated_at:di.updated_at||now()};let cur=await one(`tenant_inspiration_items?id=eq.${enc(di.id)}&select=id&limit=1`);if(cur)await supabase(`tenant_inspiration_items?id=eq.${enc(di.id)}`,{method:'PATCH',body,prefer:'return=minimal'});else await supabase('tenant_inspiration_items',{method:'POST',body:{id:di.id,...body,created_at:di.created_at||now()},prefer:'return=minimal'});count++}
  return count;
}
async function migrateFloorplans(tenant,b){
  const fp=b.portal_data?.floor_plan_layout;if(!fp||typeof fp!=='object')return 0;const versions=fp.versions&&typeof fp.versions==='object'?fp.versions:{};let count=0;
  for(const [name,layout] of Object.entries(versions)){const room=layout?.room||{},rw=n(room.width,40),rh=n(room.height,30),objects=Array.isArray(layout?.items)?layout.items:Array.isArray(layout?.objects)?layout.objects:[];let cur=await one(`tenant_floorplans?tenant_id=eq.${enc(tenant.id)}&event_id=eq.${enc(b.id)}&name=eq.${enc(name)}&select=*&limit=1`);const body={tenant_id:tenant.id,event_id:b.id,name:clean(name,160)||'Layout',layout_type:slugify(name),width:1200,height:800,objects,background_url:layout?.background?.storage_path||layout?.background?.url||null,background_opacity:n(layout?.background?.opacity,.55)>1?n(layout?.background?.opacity,55)/100:n(layout?.background?.opacity,.55),room_width_ft:rw,room_height_ft:rh,room_width_in:rw*12,room_height_in:rh*12,calibration:layout?.calibration||{},measurements:Array.isArray(layout?.measurements)?layout.measurements:[],is_shared:true,shared_editable:true,metadata:{legacy_active_version:String(fp.activeVersion||'')===String(name),legacy_revision:b.portal_data?.floor_plan_layout_revision||0},lock_version:1,updated_at:fp.updatedAt||b.updated_at||now()};if(cur)await supabase(`tenant_floorplans?id=eq.${enc(cur.id)}`,{method:'PATCH',body,prefer:'return=minimal'});else await supabase('tenant_floorplans',{method:'POST',body:{...body,created_at:b.created_at||now()},prefer:'return=minimal'});count++}
  return count;
}

export async function ensureLegacyMigrationForPlanner(email){
  const admin=await one(`admin_users?email=ilike.${enc(email)}&is_active=eq.true&select=*&limit=1`);if(!admin)return null;
  const tenant=await ensureTenant(admin);await ensureLicense(tenant.id);const user=await ensurePlanner(admin,tenant);const byEmail=await ensureClientUsers(tenant);
  const bookings=await supabase('bookings?select=*&order=created_at.asc&limit=1000').catch(()=>[]);let events=0,design=0,floorplans=0;
  for(const b of bookings||[]){if(!goodStatus(b.status))continue;const e=await ensureEvent(tenant,b);if(!e)continue;events++;await ensureClientAccess(tenant,e,byEmail,b);design+=await migrateDesign(tenant,b);floorplans+=await migrateFloorplans(tenant,b)}
  return {tenant,user,events,design,floorplans};
}
