import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const checks=[
 ['shared branding runtime exists',fs.existsSync('assets/tenant-branding.js')],
 ['default Celebration Suite logo configured',read('assets/tenant-branding.js').includes('/assets/celebration-suite-mark.svg')],
 ['planner-wide brand CSS variables',read('assets/tenant-branding.js').includes('--brand-primary')&&read('assets/tenant-branding.js').includes('--brand-secondary')&&read('assets/tenant-branding.js').includes('--brand-accent')],
 ['settings supports logo upload',read('settings.html').includes('tenant-logo-upload')&&read('settings.html').includes('type="file"')],
 ['settings has live brand preview',read('settings.html').includes('brandPreview')&&read('settings.html').includes('updatePreview')],
 ['portal uses shared tenant branding',read('portal.html').includes('CSBrand.apply')&&read('portal.html').includes('celebration-suite-mark.svg')],
 ['client login uses shared tenant branding',read('client-login.html').includes('CSBrand.apply')],
 ['my events uses shared tenant branding',read('my-events.html').includes('CSBrand.apply')],
 ['RSVP uses shared tenant branding',read('rsvp-public.html').includes('CSBrand.apply')],
 ['ticket sales uses shared tenant branding',read('registration-public.html').includes('CSBrand.apply')],
 ['ticket wallet uses shared tenant branding',read('ticket.html').includes('CSBrand.apply')],
 ['proposal uses shared tenant branding',read('proposal-public.html').includes('CSBrand.apply')],
 ['questionnaire uses shared tenant branding',read('questionnaire-public.html').includes('CSBrand.apply')],
 ['approval uses shared tenant branding',read('approval-public.html').includes('CSBrand.apply')],
 ['change order uses shared tenant branding',read('change-order-public.html').includes('CSBrand.apply')],
 ['public invoice endpoint exists',fs.existsSync('netlify/functions/invoice-public.mjs')],
 ['invoice payment page is branded',read('pay-invoice.html').includes('CSBrand.apply')],
 ['tenant emails are wrapped in brand',read('netlify/functions/_mailer.mjs').includes('tenantEmailHtml')&&read('netlify/functions/_mailer.mjs').includes('branding')],
 ['legacy Sage headers are replaced at runtime',read('assets/tenant-branding.js').includes('Sage & Celebration')&&read('assets/tenant-branding.js').includes('assets/logo.png')]
];
let fail=0;for(const [name,ok] of checks){console.log((ok?'PASS ':'FAIL ')+name);if(!ok)fail++}if(fail){console.error(`\n${fail} branding checks failed.`);process.exit(1)}console.log(`\n${checks.length} branding checks passed.`)
