import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
let pass=0,fail=0;
function check(name,ok,detail=''){if(ok){pass++;console.log('PASS',name)}else{fail++;console.error('FAIL',name,detail)}}
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
check('package version is 1.0.0',pkg.version==='1.0.0',pkg.version);
check('v1 release notes exist',fs.existsSync('RELEASE-NOTES-v1.0.0.md'));
check('launch checklist exists',fs.existsSync('V1-LAUNCH-CHECKLIST.md'));
check('deployment guide exists',fs.existsSync('V1-DEPLOYMENT-GUIDE.md'));
for(const n of ['0026_WHITE_LABEL_COMMERCE_STOREFRONTS.sql','0027_CUSTOM_DOMAINS_PUSH_RESILIENCE.sql','0028_CONFLICT_REFUND_ACCEPTANCE.sql','0029_COMMERCIAL_LAUNCH_OPERATIONS.sql'])check(`migration ${n}`,fs.existsSync(path.join('supabase/migrations',n)));
const html=fs.readdirSync('.').filter(x=>x.endsWith('.html'));
const full=html.filter(f=>/<html\b/i.test(fs.readFileSync(f,'utf8')));
const noLang=full.filter(f=>!/<html\b[^>]*\blang=/i.test(fs.readFileSync(f,'utf8')));
const noViewport=full.filter(f=>!/name=["']viewport["']/i.test(fs.readFileSync(f,'utf8')));
check('all full HTML documents declare language',noLang.length===0,noLang.join(','));
check('all full HTML documents have viewport metadata',noViewport.length===0,noViewport.join(','));
const css=fs.readFileSync('assets/app.css','utf8');
check('visible focus baseline present',css.includes(':focus-visible'));
check('reduced-motion baseline present',css.includes('prefers-reduced-motion'));
const runtime=fs.readFileSync('assets/runtime-compat.js','utf8');
check('skip-to-content runtime present',runtime.includes('cs-skip-link'));
check('unnamed button fallback present',runtime.includes("querySelectorAll('button,[role=\"button\"]')"));
const app=fs.readFileSync('app.html','utf8');
check('mobile menu Escape behavior present',app.includes("e.key==='Escape'&&plannerSidebar"));
for(const [legacy,canonical] of [['communications-admin.html','communications.html'],['inventory-admin.html','inventory.html'],['vendors-admin.html','vendors.html']]){
 const t=fs.readFileSync(legacy,'utf8');
 check(`${legacy} is compatibility alias`,t.includes(`/${canonical}`)&&t.length<1800);
}
const logo=fs.statSync('assets/logo.png').size;
check('default logo payload under 400KB',logo<400*1024,`${logo} bytes`);
const support=fs.readFileSync('netlify/functions/support-escalation-run.mjs','utf8');
check('support escalation is scheduled',support.includes('export const config')&&support.includes('schedule'));
console.log(`\nV1 launch audit: ${pass}/${pass+fail} passed`);
if(fail)process.exit(1);
