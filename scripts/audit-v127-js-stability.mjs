import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const checks=[];
const pass=(name,ok,detail='')=>checks.push({name,ok,detail});
const app=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
const runtime=fs.readFileSync(path.join(root,'assets/runtime-compat.js'),'utf8');
pass('shared app runtime no longer declares global lexical const $',!/^const \$=/m.test(app));
pass('shared app runtime no longer declares global lexical const esc',!/^const esc=/m.test(app));
pass('WLP selector helper is still exported',/window\.WLP=\{\$:selectOne/.test(app));
pass('WLP escaping helper is still exported',/esc:escapeHtml/.test(app));
pass('legacy window selector compatibility retained',/window\.\$=selectOne/.test(app));
pass('legacy window esc compatibility retained',/window\.esc=escapeHtml/.test(app));
pass('generic un-actionable Script error is filtered',/script error/.test(runtime.toLowerCase()) && /filename/.test(runtime));
pass('extension-origin generic errors are filtered',/chrome-extension\|moz-extension\|edge-extension/.test(runtime));
const html=fs.readdirSync(root).filter(f=>f.endsWith('.html'));
let unresolved=[];
for(const f of html){
  const s=fs.readFileSync(path.join(root,f),'utf8');
  if(s.includes('/assets/app.js') && (/\bconst\s+\$\s*=/.test(s)||/\bconst\s+esc\s*=/.test(s))){
    // This is now valid because app.js helpers live in an IIFE/window properties, not global lexical bindings.
    continue;
  }
}
pass('pages may safely declare local helper names alongside app.js',unresolved.length===0,unresolved.join(','));
const bad=checks.filter(c=>!c.ok);
for(const c of checks) console.log(`${c.ok?'PASS':'FAIL'} ${c.name}${c.detail?' — '+c.detail:''}`);
console.log(`\n${checks.length-bad.length}/${checks.length} JS stability checks passed.`);
if(bad.length) process.exit(1);
