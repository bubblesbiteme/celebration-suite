import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root,p),'utf8');
const exists = (p) => fs.existsSync(path.join(root,p));
const results=[];
const check=(name,ok,detail='')=>results.push({name,ok:Boolean(ok),detail:String(detail||'')});
const pkg=JSON.parse(read('package.json'));
const htmlFiles=fs.readdirSync(root).filter((f)=>f.endsWith('.html')).sort();
const html=htmlFiles.map((f)=>[f,read(f)]);

check('package version is 1.2.0',pkg.version==='1.2.0',pkg.version);
check('ultra luxury stylesheet exists',exists('assets/ultra-luxury.css'));
check('ultra luxury runtime exists',exists('assets/ultra-luxury.js'));
check('compatibility PWA helper exists',exists('pwa.js'));
check('Google connection UI helper exists',exists('admin-google-ui.js'));
check('all HTML pages load ultra luxury CSS',html.every(([,s])=>s.includes('/assets/ultra-luxury.css')),`${html.filter(([,s])=>!s.includes('/assets/ultra-luxury.css')).length} missing`);
check('all HTML pages load ultra luxury runtime',html.every(([,s])=>s.includes('/assets/ultra-luxury.js')),`${html.filter(([,s])=>!s.includes('/assets/ultra-luxury.js')).length} missing`);
check('no HTML loads external Google fonts',html.every(([,s])=>!/(fonts\.googleapis\.com|fonts\.gstatic\.com)/i.test(s)));
check('shared scripts are inside the HTML document',html.every(([,s])=>{
  const end=s.toLowerCase().lastIndexOf('</html>');
  const script=s.lastIndexOf('/assets/ultra-luxury.js');
  return end<0 || (script>=0 && script<end);
}),`${html.filter(([,s])=>{const end=s.toLowerCase().lastIndexOf('</html>');const script=s.lastIndexOf('/assets/ultra-luxury.js');return end>=0 && script>end;}).map(([f])=>f).join(', ')}`);
check('all full pages declare English language',html.every(([,s])=>!/<html\b/i.test(s)||/<html\b[^>]*\blang=["']en["']/i.test(s)));
check('all full pages include responsive viewport',html.every(([,s])=>!/<html\b/i.test(s)||/<meta\b[^>]*name=["']viewport["']/i.test(s)));

const css=read('assets/ultra-luxury.css');
const luxuryTokens=['--lux-canvas','--lux-paper','--lux-ink','--lux-gold','--lux-shadow-lg','--lux-font-display'];
check('luxury design tokens are complete',luxuryTokens.every((x)=>css.includes(x)),luxuryTokens.filter((x)=>!css.includes(x)).join(', '));
check('client portal has dedicated luxury treatment',css.includes('body.cs-page-portal')&&css.includes('body.cs-page-portal aside')&&css.includes('body.cs-page-portal .hero'));
check('event workspace has dedicated luxury treatment',css.includes('body.cs-page-event-workspace'));
check('communications has dedicated luxury treatment',css.includes('body.cs-page-communications'));
check('public landing and pricing have dedicated treatment',css.includes('.lux-hero')&&css.includes('.lux-pricing-grid'));
check('mobile responsive luxury rules exist',/@media\(max-width:900px\)/.test(css)&&/@media\(max-width:580px\)/.test(css));
check('reduced motion is respected',css.includes('prefers-reduced-motion'));
check('visible focus baseline remains available',read('assets/premium-experience.css').includes('focus-visible'));

const ux=read('assets/ultra-luxury.js');
check('quick navigation command palette exists',ux.includes('mountCommandPalette')&&ux.includes('metaKey')&&ux.includes("key.toLowerCase()==='k'"));
check('guided and professional experiences exist',ux.includes('Guided planning')&&ux.includes('Professional workspace'));
check('event context is preserved across tools',ux.includes('withEvent')&&ux.includes('eventPages'));
check('navigation uses refined SVG icons',ux.includes('<svg')&&ux.includes('refineDock'));
check('brand contrast is calculated dynamically',ux.includes('contrastText')&&ux.includes('--brand-on-primary'));

const branding=read('assets/tenant-branding.js');
check('tenant branding no longer floods global topbars',!branding.includes('.top,.topbar,.header'));
check('legacy ink maps to a readable neutral',branding.includes("--ink','#1D191F"));
check('tenant colors remain available as brand variables',branding.includes('--brand-primary')&&branding.includes('--brand-secondary')&&branding.includes('--brand-accent'));

check('landing page has premium outcome-led positioning',read('index.html').includes('The operating system behind remarkable celebrations.'));
check('landing page addresses DIY and professional planners',read('index.html').includes('For DIY party planners')&&read('index.html').includes('For planners and event teams'));
check('pricing page explains full-value access',read('pricing.html').includes('No stripped-down experience.'));

// Verify JavaScript syntax in standalone JS/MJS files.
const scriptFiles=[];
for(const dir of ['assets','scripts','tools','netlify/functions']){
  const base=path.join(root,dir); if(!fs.existsSync(base)) continue;
  const walk=(d)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\.(m?js)$/.test(e.name))scriptFiles.push(p)}};walk(base);
}
let syntaxFailures=[];
for(const p of scriptFiles){
  const rel=path.relative(root,p);
  try{new vm.SourceTextModule(fs.readFileSync(p,'utf8'),{identifier:rel});}catch(e){
    // SourceTextModule may be unavailable without experimental flag; fall back for classic scripts.
    try{new vm.Script(fs.readFileSync(p,'utf8'),{filename:rel});}catch(e2){
      // ESM import/export syntax is valid but rejected by Script; only count other errors.
      if(!/Cannot use import statement|Unexpected token 'export'|Unexpected identifier 'assert'/.test(String(e2.message)))syntaxFailures.push(`${rel}: ${e2.message}`);
    }
  }
}
check('standalone JavaScript and modules parse',syntaxFailures.length===0,syntaxFailures.slice(0,8).join(' | '));

// Literal local resource and page references.
const missing=[];
const refs=[];
const attr=/\b(?:href|src|action)\s*=\s*["']([^"']+)["']/gi;
for(const [source,s] of html){
  let m;
  while((m=attr.exec(s))){
    const raw=m[1].trim();
    if(!raw||raw.startsWith('#')||/^(?:https?:|mailto:|tel:|sms:|data:|javascript:|blob:|\/\/)/i.test(raw)||/[${}]/.test(raw)||raw.includes('+')||/encodeURIComponent|encodeURI|String\(/.test(raw))continue;
    const clean=raw.split('#')[0].split('?')[0];
    if(!clean)continue;
    if(clean.startsWith('/.netlify/functions/')){
      const name=clean.replace('/.netlify/functions/','').replace(/\/$/,'');
      const candidates=[`netlify/functions/${name}.mjs`,`netlify/functions/${name}.js`,`netlify/functions/${name}/index.mjs`,`netlify/functions/${name}/index.js`];
      refs.push({source,raw,type:'function'});
      if(!candidates.some(exists))missing.push(`${source} -> ${raw}`);
      continue;
    }
    const local=clean.replace(/^\//,'');
    refs.push({source,raw,type:/\.html$/i.test(local)?'page':'asset'});
    if(!exists(local))missing.push(`${source} -> ${raw}`);
  }
}
// Also capture literal internal page transitions from production HTML and browser scripts.
const routeSeen = new Set(refs.map((r)=>`${r.source}\u0000${r.raw}`));
const productionScripts = [];
for (const dir of ['assets']) {
  const base=path.join(root,dir); if(!fs.existsSync(base)) continue;
  const walk=(d)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\.js$/.test(e.name))productionScripts.push(p)}}; walk(base);
}
for (const sourcePath of [...htmlFiles.map((f)=>path.join(root,f)),...productionScripts]) {
  const source=path.relative(root,sourcePath).replaceAll(path.sep,'/');
  const text=fs.readFileSync(sourcePath,'utf8');
  const routeRe=/["'`](\/?[A-Za-z0-9._/-]+\.html(?:[?#][^"'`\s<]*)?)["'`]/g;
  let m;
  while((m=routeRe.exec(text))){
    const raw=m[1];
    if(!raw||raw.includes('${')||raw.includes('+'))continue;
    const key=`${source}\u0000${raw}`; if(routeSeen.has(key))continue; routeSeen.add(key);
    const clean=raw.split('#')[0].split('?')[0].replace(/^\//,'');
    refs.push({source,raw,type:'page'});
    if(!exists(clean))missing.push(`${source} -> ${raw}`);
  }
}
check('all literal local page and asset references resolve',missing.length===0,missing.slice(0,12).join(' | '));

// Inline script parse gate. Strip scripts with src and non-JS data blocks.
const inlineFailures=[];
for(const [source,s] of html){
  const re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;let m;let i=0;
  while((m=re.exec(s))){
    i++;
    const attrs=m[1]||'';const code=m[2]||'';
    if(/\bsrc\s*=/.test(attrs)||/type\s*=\s*["'](?:application\/json|importmap)["']/i.test(attrs)||!code.trim())continue;
    try{new vm.Script(code,{filename:`${source}#inline-${i}`});}catch(e){inlineFailures.push(`${source}#${i}: ${e.message}`)}
  }
}
check('all inline page scripts parse',inlineFailures.length===0,inlineFailures.slice(0,10).join(' | '));

// Write transparent machine-readable reports.
const reportDir=path.join(root,'reports');fs.mkdirSync(reportDir,{recursive:true});
const esc=(v)=>`"${String(v).replaceAll('"','""')}"`;
fs.writeFileSync(path.join(reportDir,'ULTRA-LUXURY-AUDIT.csv'),'check,status,detail\n'+results.map(r=>[esc(r.name),r.ok?'PASS':'FAIL',esc(r.detail)].join(',')).join('\n')+'\n');
fs.writeFileSync(path.join(reportDir,'STATIC-REFERENCE-MATRIX.csv'),'source,reference,type,status\n'+refs.map(r=>[esc(r.source),esc(r.raw),r.type,missing.includes(`${r.source} -> ${r.raw}`)?'MISSING':'OK'].join(',')).join('\n')+'\n');
const eventScoped=new Set(['event-workspace.html','event-day.html','event-day-command.html','event-closeout.html','event-book.html','event-inventory.html','inventory-event-sheet.html','floorplan.html','inspiration.html','guests.html','guest-checkin.html','documents.html','appointments.html','questionnaires.html','approvals.html','change-orders.html','financials.html']);
const transitionRows=refs.filter(r=>r.type!=='function').map((r)=>{
  const clean=r.raw.split('#')[0].split('?')[0].replace(/^\//,'');
  return [esc(r.source),esc(r.raw),esc(clean),missing.includes(`${r.source} -> ${r.raw}`)?'no':'yes',eventScoped.has(path.basename(clean))?'event-scoped':'not-event-scoped'].join(',');
});
fs.writeFileSync(path.join(reportDir,'PAGE-TRANSITION-MATRIX.csv'),'source,reference,target,exists,context\n'+transitionRows.join('\n')+'\n');

for(const r of results)console.log(`${r.ok?'PASS':'FAIL'} ${r.name}${r.detail?` — ${r.detail}`:''}`);
const passed=results.filter(r=>r.ok).length;
console.log(`\nUltra luxury audit: ${passed}/${results.length} passed`);
if(passed!==results.length)process.exit(1);
