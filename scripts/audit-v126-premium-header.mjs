import fs from 'node:fs';
let passed=0,failed=0;
const check=(l,c)=>{if(c){console.log('PASS',l);passed++}else{console.error('FAIL',l);failed++}};
const js=fs.readFileSync('assets/ultra-luxury.js','utf8');
const css=fs.readFileSync('assets/ultra-luxury.css','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const sw=fs.readFileSync('sw.js','utf8');
check('version 1.2.6+',/^1\.2\.(?:6|[7-9]|[1-9][0-9]+)$/.test(pkg.version));
check('segmented workspace mode control',js.includes('cs-mode-segmented')&&js.includes('Workspace experience'));
check('guided segment exists',js.includes('data-mode=\"diy\"'));
check('professional segment exists',js.includes('data-mode=\"professional\"'));
check('mode remains functional',js.includes('setMode(mode)')&&js.includes("celebration:experience-mode"));
check('search button has stable width',css.includes('.cs-command-trigger{display:inline-flex')&&css.includes('min-width:118px'));
check('event workspace header has premium layout',css.includes('v1.2.6 premium planner header')&&css.includes('body.cs-page-event-workspace .shell>.top'));
check('active mode has visible selected state',css.includes('.cs-mode-segment[aria-pressed=\"true\"]'));
check('mobile controls collapse intentionally',css.includes('@media(max-width:900px)')&&css.includes('.cs-command-trigger span,.cs-command-trigger kbd'));
check('service worker v126+',/celebration-suite-v(?:12[6-9]|1[3-9][0-9]|[2-9][0-9]{2})/.test(sw));
if(failed){console.error(`${failed} failed, ${passed} passed`);process.exit(1)}
console.log(`${passed}/${passed} premium header checks passed`);
