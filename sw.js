const CACHE='celebration-suite-v021';
const CORE=['/offline.html','/assets/app.css','/assets/app.js','/assets/ui-v019.js','/assets/favicon.svg','/app.html','/event-day.html','/guest-checkin.html','/inventory-scan.html'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);if(u.origin!==location.origin)return;
 if(u.pathname.startsWith('/.netlify/functions/'))return;
 e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return r}).catch(async()=>await caches.match(e.request)||await caches.match('/offline.html')));
});
