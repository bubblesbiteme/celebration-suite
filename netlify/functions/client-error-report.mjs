import {getSupabaseConfig} from './_shared.mjs';
const json=(status,body)=>({statusCode:status,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify(body)});
const trim=(v,n)=>String(v??'').slice(0,n);
function siteUrl(event){return process.env.SITE_URL||`${event.headers?.['x-forwarded-proto']||'https'}://${event.headers?.host||''}`}
async function sessionContext(event){
  try{const r=await fetch(siteUrl(event).replace(/\/$/,'')+'/.netlify/functions/bootstrap',{headers:{cookie:event.headers.cookie||''}});if(!r.ok)return{};const d=await r.json();return{tenant_id:d?.tenant?.id||d?.user?.tenant_id||null,user_email:d?.user?.email||null}}catch{return{}}
}
async function insert(row){try{const {url:u,key:k}=getSupabaseConfig();await fetch(u+'/rest/v1/platform_error_logs',{method:'POST',headers:{apikey:k,...(String(k).startsWith('sb_')?{}:{authorization:`Bearer ${k}`}),'content-type':'application/json',prefer:'return=minimal'},body:JSON.stringify(row)}).catch(()=>{})}catch{}}
export async function handler(event){if(event.httpMethod!=='POST')return json(405,{error:'Method not allowed'});try{const b=JSON.parse(event.body||'{}');if(!b.message)return json(400,{error:'Message required'});const ctx=await sessionContext(event);await insert({...ctx,page_path:trim(b.page_path,500),message:trim(b.message,2000),stack:trim(b.stack,12000)||null,source:trim(b.source,500)||null,severity:trim(b.severity,32)||'error',context:b.context&&typeof b.context==='object'?b.context:{},user_agent:trim(event.headers['user-agent'],1000)||null});return json(202,{ok:true})}catch{return json(202,{ok:true})}}
