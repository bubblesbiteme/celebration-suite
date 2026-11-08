import crypto from 'node:crypto';
import {json,supabase,clean} from './_shared.mjs';
const allowed=new Set(['image/jpeg','image/png','image/webp','image/heic','image/heif']);
const safeName=v=>String(v||'photo.jpg').replace(/[^a-zA-Z0-9._-]/g,'-').slice(-160)||'photo.jpg';
async function galleryFor(token){
 const rows=await supabase(`tenant_event_photo_galleries?public_token=eq.${encodeURIComponent(token)}&select=*,tenant_events(id,title,event_date,venue),tenants(business_name,branding)&limit=1`);
 const g=rows?.[0]; if(!g||!g.enabled)throw Object.assign(new Error('This guest photo gallery is not available.'),{status:404}); return g;
}
async function signUpload(path){const base=(process.env.SUPABASE_URL||'').replace(/\/$/,'');const key=(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY||'').trim().replace(/^['"]|['"]$/g,'');if(!base||!key)throw new Error('Photo storage is not configured.');const encoded=['celebration-suite-guest-photos',...path.split('/')].map(encodeURIComponent).join('/');const r=await fetch(`${base}/storage/v1/object/upload/sign/${encoded}`,{method:'POST',headers:{apikey:key,...(String(key).startsWith('sb_')?{}:{authorization:`Bearer ${key}`}),'content-type':'application/json'},body:'{}'});const txt=await r.text();let j={};try{j=JSON.parse(txt)}catch{}if(!r.ok)throw new Error(j.message||txt||'Could not prepare photo upload.');const raw=j.url||j.signedURL||j.signedUrl;if(!raw)throw new Error('Upload URL not returned.');return raw.startsWith('http')?raw:`${base}/storage/v1${raw}`}
export default async request=>{try{
 const u=new URL(request.url),token=clean(u.searchParams.get('token'),100);if(!token)throw new Error('Gallery token required.');const g=await galleryFor(token),event=Array.isArray(g.tenant_events)?g.tenant_events[0]:g.tenant_events,tenant=Array.isArray(g.tenants)?g.tenants[0]:g.tenants;
 if(request.method==='GET')return json({gallery:{id:g.id,title:g.title||`${event?.title||'Event'} Guest Photos`,welcome_message:g.welcome_message||'Share the moments you captured today.',allow_guest_captions:g.allow_guest_captions,moderation_required:g.moderation_required,retention_until:g.retention_until},event,tenant});
 const d=await request.json().catch(()=>({}));
 if(request.method==='POST'&&d.action==='prepare-upload'){
  const size=Math.max(0,Number(d.size_bytes)||0),mime=clean(d.mime_type,100).toLowerCase(),name=safeName(d.file_name);if(!size||size>25*1024*1024)throw new Error('Each photo must be 25 MB or smaller.');if(!allowed.has(mime))throw new Error('Please upload a JPG, PNG, WebP, HEIC, or HEIF image.');const path=`${g.tenant_id}/${g.event_id}/${Date.now()}-${crypto.randomUUID()}-${name}`;return json({ok:true,signed_url:await signUpload(path),storage_path:path,file_name:name});
 }
 if(request.method==='POST'&&d.action==='complete-upload'){
  const path=clean(d.storage_path,900),mime=clean(d.mime_type,100).toLowerCase(),name=safeName(d.file_name),size=Math.max(0,Number(d.size_bytes)||0);if(!path.startsWith(`${g.tenant_id}/${g.event_id}/`))throw new Error('Invalid upload path.');if(!allowed.has(mime)||!size||size>25*1024*1024)throw new Error('Invalid photo upload.');const minRetain=new Date();minRetain.setUTCFullYear(minRetain.getUTCFullYear()+2);const retain=new Date(Math.max(Date.parse(g.retention_until)||0,minRetain.getTime())).toISOString();const rows=await supabase('tenant_event_guest_photos',{method:'POST',body:{tenant_id:g.tenant_id,event_id:g.event_id,gallery_id:g.id,uploader_name:clean(d.uploader_name,160)||null,caption:g.allow_guest_captions?clean(d.caption,600)||null:null,file_name:name,mime_type:mime,size_bytes:size,storage_path:path,status:g.moderation_required?'pending':'approved',retain_until:retain}});return json({ok:true,photo_id:rows?.[0]?.id,status:rows?.[0]?.status||'pending'});
 }
 return json({error:'Method not allowed'},405);
}catch(e){return json({error:e.message},e.status||400)}};
