import {json,supabase,origin} from './_shared.mjs';
import {decrypt} from './_crypto.mjs';
const enc=encodeURIComponent;
export default async request=>{try{
 const u=new URL(request.url),token=u.searchParams.get('token');if(!token)throw Object.assign(new Error('Invoice link is invalid.'),{status:404});
 const invoice=(await supabase(`tenant_invoices?public_token=eq.${enc(token)}&select=*&limit=1`))?.[0];if(!invoice)throw Object.assign(new Error('Invoice not found.'),{status:404});
 const tenant=(await supabase(`tenants?id=eq.${enc(invoice.tenant_id)}&select=id,business_name,branding,reply_to_email,from_name,status&limit=1`))?.[0];if(!tenant||tenant.status==='disabled')throw Object.assign(new Error('This payment page is unavailable.'),{status:404});
 if(request.method==='GET')return json({invoice,tenant});
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 if(invoice.status==='paid')throw new Error('This invoice has already been paid.');
 const integration=(await supabase(`tenant_integrations?tenant_id=eq.${enc(invoice.tenant_id)}&kind=eq.stripe&select=*&limit=1`))?.[0];if(!integration)throw new Error('Online payment is not configured. Contact your planner for payment instructions.');
 const cfg=JSON.parse(decrypt(integration.config_encrypted)||'{}');if(!cfg.secret_key)throw new Error('Online payment is not configured.');
 const p=new URLSearchParams();p.set('mode','payment');p.set('success_url',`${origin(request)}/pay-invoice.html?token=${enc(token)}&paid=1`);p.set('cancel_url',`${origin(request)}/pay-invoice.html?token=${enc(token)}&canceled=1`);p.set('client_reference_id',invoice.id);if(invoice.client_email)p.set('customer_email',invoice.client_email);p.set('line_items[0][price_data][currency]','usd');p.set('line_items[0][price_data][product_data][name]',`Invoice ${invoice.invoice_number}`);p.set('line_items[0][price_data][unit_amount]',String(Math.round(Number(invoice.amount||0)*100)));p.set('line_items[0][quantity]','1');p.set('metadata[invoice_id]',invoice.id);p.set('metadata[tenant_id]',invoice.tenant_id);
 const r=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{authorization:`Bearer ${cfg.secret_key}`,'content-type':'application/x-www-form-urlencoded'},body:p});const j=await r.json();if(!r.ok)throw new Error(j.error?.message||'Stripe could not create checkout.');
 await supabase(`tenant_invoices?id=eq.${enc(invoice.id)}`,{method:'PATCH',body:{stripe_checkout_session_id:j.id,status:invoice.status==='draft'?'sent':invoice.status,updated_at:new Date().toISOString()},prefer:'return=minimal'});
 return json({ok:true,url:j.url});
}catch(e){return json({error:e.message},e.status||500)}};
