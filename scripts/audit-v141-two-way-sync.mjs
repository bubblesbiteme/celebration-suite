import fs from 'node:fs';
const portal=fs.readFileSync('portal.html','utf8');
const client=fs.readFileSync('netlify/functions/client-data.mjs','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
 ['package v1.4.1',pkg.version==='1.4.1'],
 ['client floor normalizer exists',portal.includes('function clientNormalizeFloorPlan(raw)')],
 ['client canonical floor save exists',portal.includes("api('floorplan-save',payload)")],
 ['client floor autosave queue exists',portal.includes('function queueClientFloorSave()')],
 ['floor payload carries canonical id',client.includes('_floorplan_id:fp.id')&&client.includes('lock_version:Math.max(1,Math.round(n(fp.lock_version,1)))')],
 ['server canonical floor save action exists',client.includes("action==='floorplan-save'")&&client.includes('lock_version=eq.${enc(expected)}')],
 ['inspiration remains canonical',client.includes("action==='design-update'")&&client.includes('tenant_inspiration_items')],
 ['service worker cache v141',sw.includes('celebration-suite-v141')]
];
let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++}console.log(`
${checks.length-fail}/${checks.length} v1.4.1 two-way sync checks passed.`);if(fail)process.exit(1);
