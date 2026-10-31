const env=(k)=>process.env[k]||'';
export const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store',...headers}});
export const clean=(v,n=500)=>String(v??'').trim().slice(0,n);
export async function supabase(path,{method='GET',body,prefer='return=representation'}={}){const url=env('SUPABASE_URL');const key=env('SUPABASE_SERVICE_ROLE_KEY');if(!url||!key)throw new Error('Supabase is not configured.');const r=await fetch(`${url}/rest/v1/${path}`,{method,headers:{apikey:key,authorization:`Bearer ${key}`,'content-type':'application/json',prefer},body:body===undefined?undefined:JSON.stringify(body)});const txt=await r.text();if(!r.ok)throw new Error(txt||`Supabase ${r.status}`);return txt?JSON.parse(txt):null}
export const origin=(request)=>env('SITE_URL')||new URL(request.url).origin;
