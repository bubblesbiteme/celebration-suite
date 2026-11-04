import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const fp=read('floorplan.html'), ew=read('event-workspace.html'), portal=read('portal.html'), sw=read('sw.js');
const pkg=JSON.parse(read('package.json'));
let pass=0,fail=0;function check(name,ok){if(ok){console.log('PASS',name);pass++}else{console.error('FAIL',name);fail++}}
for(const [name,src] of [['standalone',fp],['workspace',ew],['client portal',portal]]){
  check(name+' uses size-based round table presets',src.includes('Round Table – 60 in (5 ft)')&&src.includes('Round Table – 72 in (6 ft)'));
  check(name+' uses size-based rectangle presets',src.includes('Rectangle Table – 6 ft')&&src.includes('Rectangle Table – 8 ft'));
  check(name+' removed no-chair table palette preset',!src.includes('Table — no chairs'));
  check(name+' provides per-table show-chairs control',/Show chairs/.test(src)&&/show_chairs/.test(src));
  check(name+' renders half-round and serpentine geometry',src.includes('halfround60')&&src.includes('serpentine60')&&src.includes('fp-serpentine'));
  check(name+' retains legacy table type conversion',/round10.*round72/.test(src)&&/rect8.*rect96/.test(src));
}
check('standalone true physical table dimensions',fp.includes('round60:[60,60]')&&fp.includes('rect96:[96,30]')&&fp.includes('farm96:[96,36]'));
check('workspace true physical table dimensions',ew.includes('round60:[5,5]')&&ew.includes('rect96:[8,2.5]')&&ew.includes('farm96:[8,3]'));
check('client portal true physical table dimensions',portal.includes('round60:[5,5]')&&portal.includes('rect96:[8,2.5]'));
check('chair rendering scales from 18 inch physical chair size',fp.includes('18/wi*100')&&ew.includes('18/wi*100')&&portal.includes('18/wi*100'));
check('cocktail tables default with chairs hidden',fp.includes("!String(type).startsWith('cocktail')")&&ew.includes("!String(type).startsWith('cocktail')")&&portal.includes("!String(type).startsWith('cocktail')"));
check('package version 1.3.4',pkg.version==='1.3.4');
check('service worker cache v134',sw.includes('celebration-suite-v134'));
console.log(`\n${pass}/${pass+fail} v1.3.4 sized floor-furniture checks passed.`);if(fail)process.exit(1);
