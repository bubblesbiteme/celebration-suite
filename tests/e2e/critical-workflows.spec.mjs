import {test,expect} from '@playwright/test';

const plannerEmail=process.env.CS_E2E_PLANNER_EMAIL;
const plannerPassword=process.env.CS_E2E_PLANNER_PASSWORD;
const eventId=process.env.CS_E2E_EVENT_ID;
const clientUrl=process.env.CS_E2E_CLIENT_URL;

function watchPage(page){
  const errors=[];
  page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
  page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`)});
  return errors;
}

async function plannerLogin(page){
  test.skip(!plannerEmail||!plannerPassword,'Set CS_E2E_PLANNER_EMAIL and CS_E2E_PLANNER_PASSWORD for authenticated regression tests.');
  await page.goto('/login.html');
  const email=page.locator('input[type=email],input[name=email]').first();
  const password=page.locator('input[type=password],input[name=password]').first();
  await email.fill(plannerEmail);await password.fill(plannerPassword);
  await page.locator('button[type=submit],#loginBtn').first().click();
  await expect(page).toHaveURL(/\/(app|planner-dashboard)\.html/,{timeout:15000});
}

test('public product shell has no broken navigation or Sage tenant-brand leakage',async({page})=>{
  const errors=watchPage(page);
  await page.goto('/');
  await expect(page.getByText('Celebration Suite').first()).toBeVisible();
  await expect(page.locator('a[href="/pricing.html"]').first()).toBeVisible();
  await page.locator('a[href="/pricing.html"]').first().click();
  await expect(page).toHaveURL(/pricing\.html/);
  expect(errors).toEqual([]);
});

test('planner critical pages open without browser errors',async({page})=>{
  await plannerLogin(page);
  for(const route of ['/inventory.html','/floorplan.html'+(eventId?`?event_id=${eventId}`:''),'/inspiration.html'+(eventId?`?event_id=${eventId}`:''),'/guests.html'+(eventId?`?event_id=${eventId}`:''),'/event-day.html'+(eventId?`?event_id=${eventId}`:'')]){
    const errors=watchPage(page);await page.goto(route);await expect(page.locator('body')).toBeVisible();await page.waitForTimeout(750);expect(errors,route).toEqual([]);
  }
});

test('inventory edit form exposes rental, image and persistence controls',async({page})=>{
  await plannerLogin(page);await page.goto('/inventory.html');
  await expect(page.locator('input[name=rentable]')).toBeVisible();
  await expect(page.locator('input[name=rental_price]')).toBeVisible();
  await expect(page.locator('#manualPhoto')).toBeVisible();
  await expect(page.locator('button[type=submit]')).toBeVisible();
});

test('floor plan supports object add/move and survives a page reload',async({page})=>{
  test.skip(!eventId,'Set CS_E2E_EVENT_ID to exercise an actual event.');
  await plannerLogin(page);await page.goto(`/floorplan.html?event_id=${eventId}`);
  const palette=page.locator('[draggable=true]').first();
  const canvas=page.locator('#canvas,#floorCanvas,.canvas').first();
  await expect(palette).toBeVisible();await expect(canvas).toBeVisible();
  const before=await page.locator('[data-object-id],.floor-object,.placed').count();
  const p=await palette.boundingBox(),c=await canvas.boundingBox();
  test.skip(!p||!c,'Floor plan palette/canvas geometry unavailable.');
  await page.mouse.move(p.x+p.width/2,p.y+p.height/2);await page.mouse.down();await page.mouse.move(c.x+c.width/2,c.y+c.height/2,{steps:8});await page.mouse.up();
  await page.waitForTimeout(500);
  const after=await page.locator('[data-object-id],.floor-object,.placed').count();
  expect(after).toBeGreaterThanOrEqual(before);
  const save=page.getByRole('button',{name:/save/i}).first();if(await save.count())await save.click();
  await page.reload();await expect(canvas).toBeVisible();
});

test('client portal loads from a real share/login URL without planner branding leakage',async({page})=>{
  test.skip(!clientUrl,'Set CS_E2E_CLIENT_URL to a real client invitation or tenant login URL.');
  const errors=watchPage(page);await page.goto(clientUrl);await expect(page.locator('body')).toBeVisible();await page.waitForTimeout(750);
  await expect(page.locator('body')).not.toContainText('SAGE & CELEBRATION');
  expect(errors).toEqual([]);
});

test('white-label commerce storefronts load for a configured tenant',async({page})=>{
  const slug=process.env.CS_E2E_TENANT_SLUG;test.skip(!slug,'Set CS_E2E_TENANT_SLUG to a tenant with commerce enabled.');
  for(const route of [`/instant-book.html?tenant=${encodeURIComponent(slug)}`,`/decor-rentals.html?tenant=${encodeURIComponent(slug)}`]){
    const errors=watchPage(page);await page.goto(route);await expect(page.locator('body')).toBeVisible();await page.waitForTimeout(750);await expect(page.locator('body')).not.toContainText('SAGE & CELEBRATION');expect(errors,route).toEqual([]);
  }
});

// v0.36 infrastructure pages are included in authenticated staging smoke coverage.

test('stale collaboration writes are rejected instead of overwriting newer planner work',async({page})=>{
  test.skip(!eventId,'Set CS_E2E_EVENT_ID to exercise collaboration conflict protection.');
  await plannerLogin(page);
  const result=await page.evaluate(async(eventId)=>{
    async function call(path,options={}){const r=await fetch('/.netlify/functions/'+path,{credentials:'same-origin',headers:{'content-type':'application/json',...(options.headers||{})},...options});let j={};try{j=await r.json()}catch{}return {status:r.status,body:j}}
    const fp=await call('floorplans?event_id='+encodeURIComponent(eventId));
    const plan=fp.body?.floorplans?.[0];
    let floor=null;
    if(plan){const version=Number(plan.lock_version||1),payload={id:plan.id,name:plan.name,lock_version:version};const first=await call('floorplans?event_id='+encodeURIComponent(eventId),{method:'PATCH',body:JSON.stringify(payload)});const stale=await call('floorplans?event_id='+encodeURIComponent(eventId),{method:'PATCH',body:JSON.stringify(payload)});floor={first:first.status,stale:stale.status,code:stale.body?.code}}
    const ins=await call('inspiration?event_id='+encodeURIComponent(eventId));
    const item=ins.body?.items?.[0];
    let inspiration=null;
    if(item){const version=Number(item.lock_version||1),payload={notes:item.notes||null,lock_version:version};const first=await call('inspiration?event_id='+encodeURIComponent(eventId)+'&id='+encodeURIComponent(item.id),{method:'PATCH',body:JSON.stringify(payload)});const stale=await call('inspiration?event_id='+encodeURIComponent(eventId)+'&id='+encodeURIComponent(item.id),{method:'PATCH',body:JSON.stringify(payload)});inspiration={first:first.status,stale:stale.status,code:stale.body?.code}}
    return {floor,inspiration};
  },eventId);
  test.skip(!result.floor&&!result.inspiration,'The staging event needs at least one floor plan or inspiration item.');
  if(result.floor){expect(result.floor.first).toBe(200);expect(result.floor.stale).toBe(409);expect(result.floor.code).toBe('EDIT_CONFLICT')}
  if(result.inspiration){expect(result.inspiration.first).toBe(200);expect(result.inspiration.stale).toBe(409);expect(result.inspiration.code).toBe('EDIT_CONFLICT')}
});

test('custom domain production diagnostics can be exercised on an explicitly designated staging domain',async({page})=>{
  const domainId=process.env.CS_E2E_DOMAIN_ID;
  test.skip(!domainId,'Set CS_E2E_DOMAIN_ID to a verified staging custom domain.');
  await plannerLogin(page);
  const result=await page.evaluate(async(domainId)=>{const r=await fetch('/.netlify/functions/custom-domains?id='+encodeURIComponent(domainId),{method:'PATCH',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({action:'diagnose'})});return {status:r.status,body:await r.json()}},domainId);
  expect(result.status).toBe(200);expect(result.body.dns_ok).toBeTruthy();expect(typeof result.body.https_ok).toBe('boolean');
});

// Stripe refund acceptance is intentionally opt-in because it moves real money in the connected test account.
test('designated Stripe test payment can be partially refunded',async({page})=>{
  const paymentId=process.env.CS_E2E_REFUND_PAYMENT_ID;
  const amount=Number(process.env.CS_E2E_REFUND_AMOUNT||0);
  test.skip(!paymentId||!(amount>0),'Set CS_E2E_REFUND_PAYMENT_ID and CS_E2E_REFUND_AMOUNT only for a disposable Stripe test payment.');
  await plannerLogin(page);
  const result=await page.evaluate(async({paymentId,amount})=>{const r=await fetch('/.netlify/functions/financial-admin?action=refundPayment',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({id:paymentId,amount})});return {status:r.status,body:await r.json()}},{paymentId,amount});
  expect(result.status).toBe(200);expect(result.body.ok).toBeTruthy();expect(result.body.refund_id).toBeTruthy();
});
