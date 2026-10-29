import {createHmac,timingSafeEqual,randomBytes,scryptSync} from 'node:crypto';
const PLANNER_COOKIE='cs_planner_session',PLATFORM_COOKIE='cs_platform_session',CLIENT_COOKIE='cs_client_session',MAX=12*60*60*1000;
const secret=()=>process.env.SESSION_SECRET||'';
const b64=v=>Buffer.from(v).toString('base64url');
const un=v=>Buffer.from(v,'base64url').toString('utf8');
const sign=v=>{if(!secret())throw new Error('SESSION_SECRET missing.');return createHmac('sha256',secret()).update(v).digest('base64url')};
const eq=(a,b)=>{try{const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&timingSafeEqual(aa,bb)}catch{return false}};
const cookie=(req,name)=>{for(const p of (req.headers.get('cookie')||'').split(';')){const [k,...r]=p.trim().split('=');if(k===name)return decodeURIComponent(r.join('='))}return''};
const create=(data)=>{const p=b64(JSON.stringify({...data,exp:Date.now()+MAX}));return `${p}.${sign(p)}`};
const read=(req,name,required)=>{const t=cookie(req,name);if(!t)return null;const [p,s]=t.split('.');if(!p||!s||!eq(s,sign(p)))return null;try{const d=JSON.parse(un(p));if(Number(d.exp)<Date.now())return null;for(const k of required)if(!d[k])return null;return d}catch{return null}};
const cookieOut=(name,t)=>`${name}=${encodeURIComponent(t)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX/1000|0}`;
export const createSession=data=>create(data);
export const readSession=req=>read(req,PLANNER_COOKIE,['user_id','tenant_id']);
export const sessionCookie=t=>cookieOut(PLANNER_COOKIE,t);
export const clearCookie=()=>`${PLANNER_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
export const createPlatformSession=data=>create(data);
export const readPlatformSession=req=>read(req,PLATFORM_COOKIE,['admin_id']);
export const platformSessionCookie=t=>cookieOut(PLATFORM_COOKIE,t);
export const clearPlatformCookie=()=>`${PLATFORM_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
export const createClientSession=data=>create(data);
export const readClientSession=req=>read(req,CLIENT_COOKIE,['client_user_id','tenant_id']);
export const clientSessionCookie=t=>cookieOut(CLIENT_COOKIE,t);
export const clearClientCookie=()=>`${CLIENT_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
export function hashPassword(password,salt=randomBytes(16).toString('hex')){return{salt,hash:scryptSync(String(password),salt,64).toString('hex')}}
export function verifyPassword(password,salt,hash){if(!salt||!hash)return false;const a=Buffer.from(scryptSync(String(password),salt,64).toString('hex')),b=Buffer.from(String(hash||''));return a.length===b.length&&timingSafeEqual(a,b)}
