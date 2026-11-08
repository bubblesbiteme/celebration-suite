import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];
const checks = [];
const ok = (name, value, detail='') => { checks.push({name, pass:Boolean(value), detail}); if (!value) failures.push(name + (detail ? `: ${detail}` : '')); };
const exists = p => fs.existsSync(path.join(root,p));
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.name === 'node_modules' || e.name === '.git' ? [] : e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const files = walk(root);
const html = files.filter(f => f.endsWith('.html'));
const functions = exists('netlify/functions') ? fs.readdirSync(path.join(root,'netlify/functions')).filter(f => /\.(m?js|cjs|ts)$/.test(f)) : [];
const migrations = exists('supabase/migrations') ? fs.readdirSync(path.join(root,'supabase/migrations')).filter(f => f.endsWith('.sql')) : [];

ok('premium CSS exists', exists('assets/premium-experience.css'));
ok('premium runtime exists', exists('assets/premium-experience.js'));
ok('page transition matrix exists', exists('reports/PAGE-TRANSITION-MATRIX.csv'));
ok('control audit exists', exists('reports/CONTROL-AUDIT.csv'));
ok('premium product report exists', exists('PREMIUM-PRODUCT-AUDIT.md'));
ok('feature priorities exist', exists('FEATURE-PRIORITY-MATRIX.md'));
ok('0032 hardening migration exists', migrations.some(f => f.startsWith('0032')));
ok('security headers configured', exists('netlify.toml') && read('netlify.toml').includes('X-Content-Type-Options'));
ok('DIY/Professional mode implemented', read('assets/premium-experience.js').includes('celebration_suite_experience_mode'));
ok('customer-safe error helper implemented', read('assets/premium-experience.js').includes('CelebrationSuiteSafeError'));
ok('event-context preservation implemented', read('assets/premium-experience.js').includes('enhanceContextLinks'));
ok('skip link only visible on focus', read('assets/premium-experience.css').includes('.skip-link:focus'));
ok('reduced motion supported', read('assets/premium-experience.css').includes('prefers-reduced-motion'));
ok('all HTML includes premium layer', html.every(f => read(path.relative(root,f)).includes('premium-experience.js')), `${html.filter(f => !read(path.relative(root,f)).includes('premium-experience.js')).length} missing`);
ok('suite has substantial page coverage', html.length >= 120, `${html.length} pages`);
ok('suite has substantial server coverage', functions.length >= 150, `${functions.length} functions`);
ok('migration lineage retained', migrations.length >= 32, `${migrations.length} migrations`);

const matrix = exists('reports/PAGE-TRANSITION-MATRIX.csv') ? read('reports/PAGE-TRANSITION-MATRIX.csv') : '';
ok('no unresolved literal local transitions', !matrix.split(/\r?\n/).slice(1).some(line => /,no,/.test(line)), 'see transition matrix');

const functionNames = new Set(functions.map(f => f.replace(/\.(m?js|cjs|ts)$/,'')));
const apiRefs = new Set();
for (const f of files.filter(f => /\.(html|m?js|cjs)$/.test(f))) {
  const text = fs.readFileSync(f,'utf8');
  for (const m of text.matchAll(/\/\.netlify\/functions\/([A-Za-z0-9_-]+)/g)) apiRefs.add(m[1]);
}
ok('all literal API references resolve', [...apiRefs].every(n => functionNames.has(n)), [...apiRefs].filter(n => !functionNames.has(n)).join(', '));

console.log(JSON.stringify({pass: failures.length === 0, checks, failures, counts:{pages:html.length,functions:functions.length,migrations:migrations.length,apiRefs:apiRefs.size}}, null, 2));
if (failures.length) process.exit(1);
