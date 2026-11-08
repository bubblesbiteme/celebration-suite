const env=k=>process.env[k]||'';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const platformEmailConfigured=()=>!!(env('RESEND_API_KEY')&&(env('PLATFORM_FROM_EMAIL')||env('SUPPORT_EMAIL')));
export async function sendPlatformEmail({to,subject,html,text,replyTo}){
  if(!platformEmailConfigured())throw new Error('Platform transactional email is not configured.');
  const fromAddress=env('PLATFORM_FROM_EMAIL')||env('SUPPORT_EMAIL');
  const fromName=env('PLATFORM_FROM_NAME')||'Celebration Suite';
  const body={from:`${fromName} <${fromAddress}>`,to:[to],subject,html:html||`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#37243F">${esc(text||'').replace(/\n/g,'<br>')}</div>`,text:text||undefined,reply_to:replyTo||env('SUPPORT_EMAIL')||fromAddress};
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${env('RESEND_API_KEY')}`,'content-type':'application/json'},body:JSON.stringify(body)});
  const out=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(out?.message||out?.error||`Email provider returned ${r.status}.`);
  return out;
}
export function brandedEmail({heading,body,buttonLabel,buttonUrl,footer}){
  return `<!doctype html><html><body style="margin:0;background:#FAF7F2;font-family:Arial,sans-serif;color:#37243F"><div style="max-width:620px;margin:0 auto;padding:32px 18px"><div style="background:#fff;border:1px solid #D9BE8C;border-radius:18px;padding:28px"><div style="font-family:Georgia,serif;font-size:28px;font-weight:700;margin-bottom:4px">Celebration Suite</div><div style="font-size:11px;letter-spacing:3px;color:#B38E52;margin-bottom:24px">EVENT PLANNING PLATFORM</div><h1 style="font-family:Georgia,serif;font-size:30px;margin:0 0 16px">${esc(heading)}</h1><div style="line-height:1.7;color:#4d4250">${body}</div>${buttonUrl?`<p style="margin:26px 0"><a href="${esc(buttonUrl)}" style="display:inline-block;background:#A9B89A;color:#1d1720;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:999px">${esc(buttonLabel||'Open Celebration Suite')}</a></p>`:''}<div style="border-top:1px solid #eadfce;margin-top:26px;padding-top:18px;font-size:12px;color:#786f79">${footer||'Celebration Suite · by Sage &amp; Celebration'}</div></div></div></body></html>`;
}
