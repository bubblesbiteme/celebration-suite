import {json} from './_shared.mjs';
const money=(v,fallback)=>{const n=Number(v);return Number.isFinite(n)&&n>0?n:fallback};
export default async request=>json({
  single_event:{price:money(process.env.PUBLIC_PRICE_SINGLE,99),currency:'USD',label:'Single Event',access:'1 event through 90 days after the event date'},
  annual_unlimited:{price:money(process.env.PUBLIC_PRICE_ANNUAL,499),currency:'USD',label:'Annual Unlimited',access:'Unlimited events for 12 months'}
});
