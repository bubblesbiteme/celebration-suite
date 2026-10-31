import {json,clean} from './_shared.mjs';
import {tenantContext,requireActive,requirePermission,assertEventAccess} from './_tenant.mjs';
import crypto from 'node:crypto';
const env=k=>process.env[k]||'';
export default async request=>{try{
  const ctx=await tenantContext(request);requireActive(ctx);requirePermission(ctx,'manage_events');
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  const u=new URL(request.url),eventId=clean(u.searchParams.get('event_id'),80),name=clean(u.searchParams.get('name'),220)||'inspiration.jpg';
  if(!eventId)throw new Error('Event is required.');await assertEventAccess(ctx,eventId);
  const mime=(request.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
  if(!['image/jpeg','image/png','image/webp','image/gif'].includes(mime))throw new Error('Upload a JPG, PNG, WEBP, or GIF image.');
  const body=Buffer.from(await request.arrayBuffer());if(!body.length)throw new Error('Image is empty.');if(body.length>6*1024*1024)throw new Error('Image is too large. Maximum size is 6 MB.');
  const ext=({ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'})[mime]||'jpg';
  const path=`${ctx.tenant.id}/${eventId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const base=env('SUPABASE_URL'),key=env('SUPABASE_SERVICE_ROLE_KEY');if(!base||!key)throw new Error('Supabase is not configured.');
  const r=await fetch(`${base}/storage/v1/object/celebration-suite-media/${path}`,{method:'POST',headers:{apikey:key,authorization:`Bearer ${key}`,'content-type':mime,'x-upsert':'false'},body});
  const tx=await r.text();if(!r.ok)throw new Error(tx||`Upload failed (${r.status}).`);
  return json({ok:true,file_name:name,path,url:`${base}/storage/v1/object/public/celebration-suite-media/${path}`});
}catch(e){return json({error:e.message},e.status||400)}};
