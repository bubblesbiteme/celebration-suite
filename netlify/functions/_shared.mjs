const env=(k)=>String(process.env[k]??'').trim().replace(/^['"]|['"]$/g,'');
const CELEBRATION_SUITE_PROJECT_REF='iwslswjidkdwlsfgvezu';
const CELEBRATION_SUITE_URL=`https://${CELEBRATION_SUITE_PROJECT_REF}.supabase.co`;
export function getSupabaseConfig(){
 const configured=env('SUPABASE_URL').replace(/\/$/,'');
 const url=configured||CELEBRATION_SUITE_URL;
 let ref='';try{ref=new URL(url).hostname.split('.')[0]||''}catch{}
 if(ref!==CELEBRATION_SUITE_PROJECT_REF)throw new Error(`Celebration Suite backend configuration mismatch: expected Supabase project ${CELEBRATION_SUITE_PROJECT_REF}, received ${ref||'an invalid URL'}.`);
 const secret=env('SUPABASE_SECRET_KEY').trim().replace(/^['"]|['"]$/g,'');
 const service=env('SUPABASE_SERVICE_ROLE_KEY').trim().replace(/^['"]|['"]$/g,'');
 const jwtRef=(token)=>{try{if(!token.startsWith('eyJ'))return null;const part=token.split('.')[1];const data=JSON.parse(Buffer.from(part,'base64url').toString('utf8'));return String(data.ref||'')}catch{return null}};
 const serviceRef=jwtRef(service),secretRef=jwtRef(secret);
 if(service&&serviceRef===CELEBRATION_SUITE_PROJECT_REF)return {url,key:service,ref,key_source:'SUPABASE_SERVICE_ROLE_KEY'};
 if(secret&&secretRef===CELEBRATION_SUITE_PROJECT_REF)return {url,key:secret,ref,key_source:'SUPABASE_SECRET_KEY'};
 if(secret&&!secret.startsWith('eyJ'))return {url,key:secret,ref,key_source:'SUPABASE_SECRET_KEY'};
 if(service&&!service.startsWith('eyJ'))return {url,key:service,ref,key_source:'SUPABASE_SERVICE_ROLE_KEY'};
 const wrongRef=serviceRef||secretRef;
 if(wrongRef)throw new Error(`Celebration Suite Supabase key belongs to project ${wrongRef}, not ${CELEBRATION_SUITE_PROJECT_REF}. Replace the Netlify server key with a key from Celebration Suite - S&G.`);
 throw new Error('Celebration Suite Supabase secret key is not configured.');
}
export function supabaseStatus(){const {url,key,ref,key_source}=getSupabaseConfig();return {url,project_ref:ref,key_type:key.startsWith('sb_secret_')?'secret':key.startsWith('eyJ')?'legacy_service_role':'unknown',key_source};}
export const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store',...headers}});
export const clean=(v,n=500)=>String(v??'').trim().slice(0,n);
export async function supabase(path,{method='GET',body,prefer='return=representation'}={}){const {url,key}=getSupabaseConfig();const r=await fetch(`${url}/rest/v1/${path}`,{method,headers:{apikey:key,...(String(key).startsWith('sb_')?{}:{authorization:`Bearer ${key}`}),'content-type':'application/json',prefer},body:body===undefined?undefined:JSON.stringify(body)});const txt=await r.text();if(!r.ok)throw new Error(txt||`Supabase ${r.status}`);return txt?JSON.parse(txt):null}
export const origin=(request)=>env('SITE_URL')||new URL(request.url).origin;
