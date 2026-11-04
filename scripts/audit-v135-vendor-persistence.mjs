import fs from 'node:fs';
let pass=0,fail=0;
const check=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${name}`);ok?pass++:fail++};
const vendorPage=fs.readFileSync('vendors.html','utf8');
const api=fs.readFileSync('netlify/functions/vendor-admin.mjs','utf8');
const migration=fs.readFileSync('supabase/migrations/0034_VENDOR_CRM_PERSISTENCE.sql','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const sw=fs.readFileSync('sw.js','utf8');

check('package version is 1.3.5',pkg.version==='1.3.5');
check('service worker cache is v135+',/celebration-suite-v(?:13[5-9]|1[4-9][0-9]|[2-9][0-9]{2,})/.test(sw));
check('migration adds operational vendor statuses',migration.includes("'active','busy','seasonal','inactive'")&&migration.includes('tenant_vendors_status_check'));
check('migration persists vendor contact/location fields',['instagram','address','city','state','zip'].every(x=>migration.includes(`add column if not exists ${x}`)));
check('migration persists commercial/compliance fields',['pricing_summary','minimum_spend','referral_discount','w9_status','coi_status','coi_expires_on','contract_status','document_links'].every(x=>migration.includes(`add column if not exists ${x}`)));
check('migration persists vendor quality/referral flags',['rating_communication','rating_reliability','rating_quality','rating_value','rating_professionalism','referred_clients','referred_revenue','referral_bonus_due','preferred','public_profile'].every(x=>migration.includes(`add column if not exists ${x}`)));
check('vendor API accepts rich CRM payload',api.includes('function vendorRow')&&['instagram','minimum_spend','document_links','preferred','public_profile'].every(x=>api.includes(`${x}:`)));
check('vendor create returns persisted record',api.includes("action==='create'")&&api.includes('vendor:r?.[0]'));
check('vendor update returns persisted record',api.includes('vendor:r[0]'));
check('vendor API reports missing migration clearly',api.includes('0034_VENDOR_CRM_PERSISTENCE.sql'));
check('vendor save button has visible saving state',vendorPage.includes("btn.textContent='Saving…'")&&vendorPage.includes('btn.disabled=true'));
check('vendor save confirms returned record after refresh',vendorPage.includes('record could not be confirmed after refresh')&&vendorPage.includes('vendors.some(v=>v.id===saved.id)'));
check('vendor form includes compliance and referral fields',vendorPage.includes('id="w9"')&&vendorPage.includes('id="coi"')&&vendorPage.includes('id="referredRevenue"')&&vendorPage.includes('id="preferred"'));

console.log(`\nVendor persistence audit: ${pass} passed, ${fail} failed`);
if(fail)process.exit(1);
