const CACHE='celebration-suite-v161';
const CORE=['/demo.html','/assets/demo-explorer.css','/assets/demo-explorer.js','/offline.html','/assets/app.css','/assets/app.js','/assets/ui-v019.js','/assets/favicon.svg','/app.html','/event-day.html','/guest-checkin.html','/guest-photos.html','/guest-photo-upload.html','/inventory-scan.html','/getting-started.html','/knowledge-base.html','/commerce.html','/assets/knowledge-base.js','/assets/premium-experience.css','/assets/premium-experience.js','/assets/ultra-luxury.css','/assets/ultra-luxury.js','/pwa.js','/admin-google-ui.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);if(u.origin!==location.origin)return;
 if(u.pathname.startsWith('/.netlify/functions/'))return;
 const isHtml=e.request.mode==='navigate'||u.pathname.endsWith('.html');const req=isHtml?new Request(e.request,{cache:'no-store'}):e.request;e.respondWith(fetch(req).then(r=>{if(!isHtml){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{})}return r}).catch(async()=>isHtml?await caches.match('/offline.html'):(await caches.match(e.request)||await caches.match('/offline.html'))));
});
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch{d={body:e.data?e.data.text():''}};e.waitUntil(self.registration.showNotification(d.title||'Celebration Suite',{body:d.body||'You have a new update.',icon:'/assets/celebration-suite-mark.svg',badge:'/assets/favicon.svg',data:{url:d.url||'/notifications.html'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=e.notification.data?.url||'/notifications.html';e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const c of list){if('focus'in c){c.navigate(url);return c.focus()}}return clients.openWindow(url)}))});