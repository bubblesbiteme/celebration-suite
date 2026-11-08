import crypto from 'node:crypto';
import {json,clean} from './_shared.mjs';
import {tenantContext} from './_tenant.mjs';
export default async request=>{try{
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  const ctx=await tenantContext(request),d=await request.json().catch(()=>({}));
  const name=String(d.file_name||'logo').replace(/[^a-zA-Z0-9._-]+/g,'-').slice(-120)||'logo';
  const mime=clean(d.mime_type,120)||'image/png',size=Number(d.size_bytes||0);
  if(!['image/png','image/jpeg','image/webp','image/gif','image/svg+xml'].includes(mime))throw new Error('Upload a PNG, JPG, WEBP, GIF or SVG logo.');
  if(!size||size>3*1024*1024)throw new Error('Logo must be 3 MB or smaller.');
  const base=(process.env.SUPABASE_URL||'').replace(/\/$/,''),key=(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY||'').trim().replace(/^['"]|['"]$/g,'');
  if(!base||!key)throw new Error('Storage is not configured.');
  const path=`${ctx.tenant.id}/branding/${Date.now()}-${crypto.randomUUID()}-${name}`;
  const encoded=path.split('/').map(encodeURIComponent).join('/');
  const r=await fetch(`${base}/storage/v1/object/upload/sign/celebration-suite-media/${encoded}`,{method:'POST',headers:{apikey:key,...(String(key).startsWith('sb_')?{}:{authorization:`Bearer ${key}`}),'content-type':'application/json'},body:'{}'});
  const tx=await r.text();let j={};try{j=JSON.parse(tx)}catch{}
  if(!r.ok)throw new Error(j.message||tx||'Could not prepare logo upload.');
  const raw=j.url||j.signedURL||j.signedUrl;if(!raw)throw new Error('Upload URL not returned.');
  const signedUrl=raw.startsWith('http')?raw:`${base}/storage/v1${raw}`;
  const publicUrl=`${base}/storage/v1/object/public/celebration-suite-media/${encoded}`;
  return json({ok:true,signedUrl,publicUrl,storage_path:path});
}catch(e){return json({error:e.message},e.status||400)}};
