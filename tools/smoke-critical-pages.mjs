import fs from 'node:fs';import path from 'node:path';
const root=path.resolve('.');const read=f=>fs.readFileSync(path.join(root,f),'utf8');let pass=0,fail=0;const check=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${name}`);ok?pass++:fail++};
const specs={
 'event-workspace.html':['Event Workspace','More tools','Preview client portal','Floor plan'],
 'portal.html':['CLIENT PLANNING PORTAL','Inspiration Board','Floor Plan','Documents','Messages'],
 'event-day.html':['Event Day','Guest','Incident','Vendor'],
 'guests.html':['Guest Management','Import CSV','QR Check-In'],
 'floorplan.html':['Floor Plan','Save + Share','Snap to grid'],
 'inspiration.html':['Inspiration','Master Inventory','Board Settings'],
 'inventory.html':['Inventory','Bulk inventory','QR'],
 'financials.html':['Financial Center','Invoice','Payment'],
 'integration-health.html':['Account Health','Connected services','Warnings'],
 'platform-admin.html':['Platform Admin','Account Health','Support','Errors']
};
for(const [file,markers] of Object.entries(specs)){const full=path.join(root,file);check(`${file} exists`,fs.existsSync(full));if(!fs.existsSync(full))continue;const s=read(file);for(const m of markers)check(`${file} exposes ${m}`,s.toLowerCase().includes(m.toLowerCase()));const blocks=[...s.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).filter(x=>x.trim());let ok=true;for(const code of blocks){try{new Function(code)}catch{ok=false;break}}check(`${file} inline scripts parse`,ok)}
const ew=read('event-workspace.html');check('workspace menu closes after selection',ew.includes('details.open=false')||ew.includes("removeAttribute('open')"));check('workspace menu closes on Escape',ew.includes('Escape'));check('workspace menu closes outside click',/contains\(e\.target\)|closest\(/.test(ew));
const portal=read('portal.html');check('portal planner preview supported',/preview/i.test(portal));check('portal shared messages action',portal.includes('add-message'));check('portal shared design review action',portal.includes('review-design'));check('portal shared documents action',portal.includes('add-document'));check('portal floorplan save path',/floorplan/i.test(portal)&&/save/i.test(portal));
console.log(`\nCritical interaction smoke contracts: ${pass} passed, ${fail} failed`);if(fail)process.exit(1);
