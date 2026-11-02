import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const checks=[];
const add=(name,ok,detail='')=>checks.push({name,ok,detail});
const exists=p=>fs.existsSync(path.join(root,p));
const text=p=>fs.readFileSync(path.join(root,p),'utf8');

const requiredAliases=['admin.html','agreement.html','booking.html','booking-success.html','change-order.html','change-password.html','client-2fa-verify.html','create-password.html','decor-rental-requests-admin.html','partner-login.html','payment.html','payment-success.html','proposal.html','staff-login.html','staff-set-password.html','thank-you.html'];
for(const p of requiredAliases)add(`legacy route: ${p}`,exists(p));
for(const p of ['netlify/functions/event-ai-assistant.mjs','netlify/functions/client-change-password.mjs','supabase/migrations/0031_ORIGINAL_PARITY_RECONCILIATION.sql','ORIGINAL-PARITY-RECONCILIATION.md'])add(`parity artifact: ${p}`,exists(p));

const migration=text('supabase/migrations/0031_ORIGINAL_PARITY_RECONCILIATION.sql');
for(const t of ['tenant_event_ai_settings','tenant_event_ai_conversations','tenant_event_ai_audit_log'])add(`AI schema: ${t}`,migration.includes(t));
const ai=text('netlify/functions/event-ai-assistant.mjs');
add('AI tenant scoped',ai.includes('tenantContext(request)')&&ai.includes('assertEventAccess(ctx,eventId)'));
add('AI privacy controls',ai.includes('allow_client_data')&&ai.includes('allow_financial_data')&&ai.includes('redact_contact_details'));
add('AI review + purge lifecycle',ai.includes("body.action==='review'")&&ai.includes("body.action==='purge'")&&ai.includes("body.action==='purge_all'"));
const workspace=text('netlify/functions/event-workspace.mjs');
add('workspace loads AI history',workspace.includes("q('tenant_event_ai_conversations'")&&workspace.includes('aiSettings:aiSettingsRows?.[0]||null'));

const funcs=new Set(fs.readdirSync(path.join(root,'netlify/functions')).filter(x=>x.endsWith('.mjs')).map(x=>x.slice(0,-4)));
const htmls=new Set(fs.readdirSync(root).filter(x=>x.endsWith('.html')));
const scanFiles=[...fs.readdirSync(root).filter(x=>x.endsWith('.html')).map(x=>path.join(root,x)),...fs.readdirSync(path.join(root,'assets')).filter(x=>x.endsWith('.js')).map(x=>path.join(root,'assets',x)),...fs.readdirSync(path.join(root,'netlify/functions')).filter(x=>x.endsWith('.mjs')).map(x=>path.join(root,'netlify/functions',x))];
const missingFunctions=new Set(),missingHtml=new Set();
for(const file of scanFiles){const s=fs.readFileSync(file,'utf8');for(const m of s.matchAll(/(?:\/\.netlify\/functions\/|WLP\.api\(['"])([A-Za-z0-9_.-]+)/g))if(!funcs.has(m[1]))missingFunctions.add(m[1]);for(const m of s.matchAll(/['"]\/?([A-Za-z0-9_.-]+\.html)(?:[?#'"]|$)/g))if(!htmls.has(m[1]))missingHtml.add(m[1]);}
add('no internally referenced missing functions',missingFunctions.size===0,[...missingFunctions].join(', '));
add('no internally referenced missing HTML routes',missingHtml.size===0,[...missingHtml].join(', '));

const report=text('ORIGINAL-PARITY-RECONCILIATION.md');
add('report has no REVIEW rows',!report.includes('| REVIEW |'));
add('report covers original page matrix',report.includes('## Original HTML route matrix'));
add('report covers original function matrix',report.includes('## Original Netlify function matrix'));
add('report covers original table matrix',report.includes('## Original database table matrix'));

const fail=checks.filter(x=>!x.ok);
for(const c of checks)console.log(`${c.ok?'PASS':'FAIL'} ${c.name}${c.detail?` — ${c.detail}`:''}`);
console.log(`\n${checks.length-fail.length}/${checks.length} original-parity checks passed.`);
if(fail.length)process.exit(1);
