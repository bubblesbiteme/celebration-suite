import {createHmac,randomBytes} from 'node:crypto';
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function newTotpSecret(){const b=randomBytes(20);let bits='',out='';for(const x of b)bits+=x.toString(2).padStart(8,'0');for(let i=0;i<bits.length;i+=5){const c=bits.slice(i,i+5).padEnd(5,'0');out+=alphabet[parseInt(c,2)]}return out}
function decode(s){let bits='';for(const c of String(s||'').replace(/=+$/,'').toUpperCase()){const i=alphabet.indexOf(c);if(i>=0)bits+=i.toString(2).padStart(5,'0')}const bytes=[];for(let i=0;i+8<=bits.length;i+=8)bytes.push(parseInt(bits.slice(i,i+8),2));return Buffer.from(bytes)}
function code(secret,counter){const buf=Buffer.alloc(8);buf.writeBigUInt64BE(BigInt(counter));const h=createHmac('sha1',decode(secret)).update(buf).digest(),o=h[h.length-1]&15,n=((h[o]&127)<<24)|((h[o+1]&255)<<16)|((h[o+2]&255)<<8)|(h[o+3]&255);return String(n%1000000).padStart(6,'0')}
export function verifyTotp(secret,input){const v=String(input||'').replace(/\D/g,'');if(v.length!==6)return false;const t=Math.floor(Date.now()/30000);return[-1,0,1].some(d=>code(secret,t+d)===v)}
export function otpauthUri(secret,label,issuer='Celebration Suite'){return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`}
