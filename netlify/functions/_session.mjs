import {createHmac,timingSafeEqual,randomBytes,scryptSync} from 'node:crypto';
const COOKIE='wl_planner_session',MAX=12*60*60*1000;
const secret=()=>process.env.SESSION_SECRET||'';
const b64=v=>Buffer.from(v).toString('base64url');
const un=v=>Buffer.from(v,'base64url').toString('utf8');
const sign=v=>{if(!secret())throw new Error('SESSION_SECRET missing.');return createHmac('sha256',secret()).update(v).digest('base64url')};
const eq=(a,b)=>{try{const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&timingSafeEqual(aa,bb)}catch{return false}};
const cookie=(req,name)=>{for(const p of (req.headers.get('cookie')||'').split(';')){const [k,...r]=p.trim().split('=');if(k===name)return decodeURIComponent(r.join('='))}return''};
export function createSession(data){const p=b64(JSON.stringify({...data,exp:Date.now()+MAX}));return `${p}.${sign(p)}`}
export function readSession(req){const t=cookie(req,COOKIE);if(!t)return null;const [p,s]=t.split('.');if(!p||!s||!eq(s,sign(p)))return null;try{const d=JSON.parse(un(p));if(!d.user_id||!d.tenant_id||Number(d.exp)<Date.now())return null;return d}catch{return null}}
export const sessionCookie=t=>`${COOKIE}=${encodeURIComponent(t)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX/1000|0}`;
export const clearCookie=()=>`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
export function hashPassword(password,salt=randomBytes(16).toString('hex')){return{salt,hash:scryptSync(String(password),salt,64).toString('hex')}}
export function verifyPassword(password,salt,hash){const a=Buffer.from(scryptSync(String(password),salt,64).toString('hex')),b=Buffer.from(String(hash||''));return a.length===b.length&&timingSafeEqual(a,b)}
