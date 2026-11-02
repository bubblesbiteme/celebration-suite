import {supabase,origin} from './_shared.mjs';
import {decrypt} from './_crypto.mjs';
export const enc=encodeURIComponent;
export const money=n=>Math.round((Number(n)||0)*100)/100;
export async function tenantBySlug(slug){return (await supabase(`tenants?slug=eq.${enc(slug)}&status=eq.active&select=id,slug,business_name,branding,reply_to_email,from_name,status&limit=1`))?.[0]||null}
export async function commerceSettings(tenantId){return (await supabase(`tenant_commerce_settings?tenant_id=eq.${enc(tenantId)}&select=*&limit=1`))?.[0]||{tenant_id:tenantId,instant_book_enabled:false,rental_store_enabled:false,booking_hold_hours:4,rental_hold_hours:4,max_general_events_per_day:2,max_exclusive_events_per_day:1,recovery_enabled:true,recovery_first_minutes:30,recovery_second_hours:72}}
export async function stripeConfig(tenantId){const i=(await supabase(`tenant_integrations?tenant_id=eq.${enc(tenantId)}&kind=eq.stripe&status=eq.configured&select=*&limit=1`))?.[0];if(!i)return null;const c=JSON.parse(decrypt(i.config_encrypted)||'{}');return c.secret_key?c:null}
export async function stripeSession(secret,params){const r=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{authorization:`Bearer ${secret}`,'content-type':'application/x-www-form-urlencoded'},body:params});const j=await r.json();if(!r.ok)throw new Error(j.error?.message||'Stripe could not create checkout.');return j}
export async function getStripeSession(secret,id){const r=await fetch(`https://api.stripe.com/v1/checkout/sessions/${enc(id)}`,{headers:{authorization:`Bearer ${secret}`}}),j=await r.json();if(!r.ok)throw new Error(j.error?.message||'Unable to verify payment.');return j}
export function checkoutUrls(request,path,token){return {success:`${origin(request)}/${path}?token=${enc(token)}&session_id={CHECKOUT_SESSION_ID}`,cancel:`${origin(request)}/${path}?token=${enc(token)}&canceled=1`}}
