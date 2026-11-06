import fs from 'node:fs';
const portal=fs.readFileSync('portal.html','utf8');
const api=fs.readFileSync('netlify/functions/client-data.mjs','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
 ['package v1.4.0',pkg.version==='1.4.0'],
 ['client canonical design-update action',api.includes("action==='design-update'")],
 ['client update uses optimistic lock',api.includes('lock_version=eq.${enc(expected)}')],
 ['client update returns canonical row',api.includes('item:saved[0]')],
 ['portal saves individual design item',portal.includes("api('design-update',payload)")],
 ['portal renders item x directly',portal.includes('Number.isFinite(+item.x)?+item.x')],
 ['portal renders item width directly',portal.includes('Number.isFinite(+item.width)?+item.width')],
 ['portal orders by canonical z index',portal.includes('(Number(a.z_index)||0)-(Number(b.z_index)||0)')],
 ['service worker cache bumped',sw.includes("celebration-suite-v140")],
];
let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++}console.log(`\n${checks.length-fail}/${checks.length} v1.4.0 inspiration sync checks passed.`);if(fail)process.exit(1);
