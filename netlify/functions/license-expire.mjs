import {json,getSupabaseConfig} from './_shared.mjs';
export const config={schedule:'0 3 * * *'};
export default async()=>{try{const {url,key}=getSupabaseConfig();const r=await fetch(`${url}/rest/v1/rpc/expire_white_label_licenses`,{method:'POST',headers:{apikey:key,...(String(key).startsWith('sb_')?{}:{authorization:`Bearer ${key}`}),'content-type':'application/json'},body:'{}'});if(!r.ok)throw new Error(await r.text());return json({ok:true});}catch(e){return json({error:e.message},500)}};
