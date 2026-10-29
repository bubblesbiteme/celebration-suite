import {json} from './_shared.mjs';
const money=(v,fallback)=>{const n=Number(v);return Number.isFinite(n)&&n>0?n:fallback};
export default async request=>json({
  single_event:{price:money(process.env.PUBLIC_PRICE_SINGLE,99),currency:'USD',label:'Single Event',access:'1 event through 90 days after the event date'},
  monthly_unlimited:{price:money(process.env.PUBLIC_PRICE_MONTHLY,59),currency:'USD',label:'Planner Unlimited Monthly',access:'Unlimited events, billed monthly'},
  annual_unlimited:{price:money(process.env.PUBLIC_PRICE_ANNUAL,499),currency:'USD',label:'Planner Unlimited Annual',access:'Unlimited events for 12 months'}
});
