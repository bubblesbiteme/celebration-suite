from pathlib import Path
from playwright.sync_api import sync_playwright
import base64,re
root=Path('/mnt/data/v1390')
html=(root/'demo.html').read_text();css=(root/'assets/demo-explorer.css').read_text();js=(root/'assets/demo-explorer.js').read_text();svg=(root/'assets/celebration-suite-mark.svg').read_bytes();svg_url='data:image/svg+xml;base64,'+base64.b64encode(svg).decode()
html=html.replace('<link rel="stylesheet" href="/assets/demo-explorer.css">','<style>'+css+'</style>').replace('<script src="/assets/demo-explorer.js" defer></script>','<script>'+js+'</script>').replace('/assets/celebration-suite-mark.svg',svg_url);html=re.sub(r'<link rel="manifest"[^>]*>','',html);html=re.sub(r'<link rel="icon"[^>]*>','',html)
with sync_playwright() as p:
  b=p.chromium.launch(headless=False,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--use-gl=swiftshader'])
  page=b.new_page(viewport={'width':1440,'height':1000});errs=[];page.on('console',lambda m: errs.append('console '+m.type+': '+m.text) if m.type=='error' else None);page.on('pageerror',lambda e:errs.append('pageerror: '+str(e)))
  page.set_content(html,wait_until='load',timeout=30000);page.wait_for_timeout(300)
  modules=page.locator('[data-demo-module]').evaluate_all('(els)=>els.map(e=>e.dataset.demoModule)')
  for mid in modules:
    page.locator(f'[data-demo-module="{mid}"]').click(force=True);page.wait_for_timeout(80)
    title=page.locator('#stageTitle').inner_text()
    if not title: raise RuntimeError('blank title '+mid)
  # exercise representative interactions
  for action in ['checkout-preview','rsvp-demo','approve-inspo','guest-photo-upload','ticket-preview','document-open','brand-toggle']:
    el=page.locator(f'[data-demo-action="{action}"]')
    if el.count(): el.first.click(force=True); page.wait_for_timeout(60)
  page.locator('[data-demo-module="guestphotos"]').click(force=True);page.screenshot(path='/mnt/data/demo1380-guest-photo.png',full_page=True)
  print('modules',len(modules),modules);print('errors',errs);print('scrollWidth',page.evaluate('document.documentElement.scrollWidth'),'innerWidth',page.evaluate('innerWidth'))
  if errs: raise SystemExit(1)
  b.close()
