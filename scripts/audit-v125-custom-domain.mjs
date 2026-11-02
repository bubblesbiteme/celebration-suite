import fs from 'node:fs';
let passed=0, failed=0;
const check=(label,cond)=>{if(cond){console.log('PASS',label);passed++}else{console.error('FAIL',label);failed++}};
const html=fs.readFileSync('custom-domains.html','utf8');
const fn=fs.readFileSync('netlify/functions/custom-domains.mjs','utf8');
check('explicit form binding',html.includes("document.getElementById('addForm')"));
check('visible generating state',html.includes("Creating verification record")&&html.includes("Generating…"));
check('request timeout',html.includes('AbortController')&&html.includes('timed out'));
check('TXT result card',html.includes('DNS verification record')&&html.includes("id=\"txtName\"")&&html.includes("id=\"txtValue\""));
check('copy controls',html.includes("id=\"copyName\"")&&html.includes("id=\"copyValue\""));
check('backend returns TXT',fn.includes("type:'TXT'")&&fn.includes('_celebration-suite.${hostname}'));
check('existing domain is idempotent',fn.includes('existing:true')&&fn.includes('existing.verification_token'));
check('cross-tenant duplicate protected',fn.includes('already connected to another Celebration Suite account'));
check('service worker is v125 or newer',/celebration-suite-v12[5-9]/.test(fs.readFileSync('sw.js','utf8'))||/celebration-suite-v1[3-9][0-9]/.test(fs.readFileSync('sw.js','utf8')));
if(failed){console.error(`${failed} failed, ${passed} passed`);process.exit(1)}
console.log(`${passed}/${passed} custom-domain checks passed`);
