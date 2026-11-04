from pathlib import Path
from playwright.sync_api import sync_playwright
import base64,re
root=Path('/mnt/data/v1360')
html=(root/'demo.html').read_text()
css=(root/'assets/demo-explorer.css').read_text()
js=(root/'assets/demo-explorer.js').read_text()
svg=(root/'assets/celebration-suite-mark.svg').read_bytes()
svg_url='data:image/svg+xml;base64,'+base64.b64encode(svg).decode()
html=html.replace('<link rel="stylesheet" href="/assets/demo-explorer.css">', '<style>'+css+'</style>')
html=html.replace('<script src="/assets/demo-explorer.js" defer></script>', '<script>'+js+'</script>')
html=html.replace('/assets/celebration-suite-mark.svg', svg_url)
html=re.sub(r'<link rel="manifest"[^>]*>','',html)
html=re.sub(r'<link rel="icon"[^>]*>','',html)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=False, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--use-gl=swiftshader'])
    for name,width,height in [('desktop',1440,1100),('tablet',820,1100),('mobile',390,844)]:
        page=browser.new_page(viewport={'width':width,'height':height}, device_scale_factor=1)
        errs=[]
        page.on('console', lambda msg, e=errs: e.append(f'console {msg.type}: {msg.text}') if msg.type=='error' else None)
        page.on('pageerror', lambda exc, e=errs: e.append(f'pageerror: {exc}'))
        page.set_content(html, wait_until='load', timeout=30000)
        page.wait_for_timeout(700)
        page.screenshot(path=f'/mnt/data/demo1360-{name}.png', full_page=True)
        print(name, 'viewport', width,height, 'doc', page.evaluate('({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight})'), 'errors', errs)
        page.close()
    browser.close()
