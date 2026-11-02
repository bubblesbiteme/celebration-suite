import fs from 'node:fs';
const src=fs.readFileSync('assets/ultra-luxury.js','utf8');
const app=fs.readFileSync('app.html','utf8');
const checks=[
  ['dock logo enhancement idempotent', src.includes("csLuxuryLogoApplied")],
  ['dock icon enhancement idempotent', src.includes("csLuxuryIcon")],
  ['observer filters added nodes', src.includes('records.some') && src.includes('addedNodes')],
  ['observer batches with requestAnimationFrame', src.includes('dockRefreshQueued') && src.includes('requestAnimationFrame')],
  ['no unconditional icon innerHTML rewrite', !/if\(icon && b\) b\.innerHTML=icons\[icon\]/.test(src)],
  ['dashboard bootstrap still has timeout fallback', app.includes('Workspace loading timed out. Please retry.')],
  ['service worker cache v123+', /celebration-suite-v12[3-9]/.test(fs.readFileSync('sw.js','utf8'))],
  ['package version 1.2 patch line', /^1\.2\.[3-9]$/.test(JSON.parse(fs.readFileSync('package.json','utf8')).version)]
];
let pass=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`); if(ok)pass++;}
console.log(`${pass}/${checks.length} v1.2.3 dashboard-freeze checks passed.`);
if(pass!==checks.length) process.exit(1);
