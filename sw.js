// Service worker do Anael Up!: abre sem internet e se atualiza em segundo plano.
const CACHE="au-v10";
const APP=["./", "index.html", "config.js", "css/app.css", "anael-up.webmanifest", "favicon.png", "au-icone.svg", "au-avatar.jpg", "au-icon-192.png", "au-icon-512.png", "au-maskable-512.png", "au-apple-touch.png", "js/icones.js", "js/01-base.js", "js/02-meditacao.js", "js/03-inicio-agenda.js", "js/04-financas.js", "js/05-estudos-notas.js", "js/06-nuvem.js", "js/07-academia.js"];
const MED=["assets/med/manifest.json", "assets/amb/musica.mp3"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP).then(()=>c.addAll(MED).catch(()=>{}))).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
function cacheEAtualiza(e,chave){const rede=fetch(e.request,{cache:"no-cache"}).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(chave||e.request,c));}return r;});
  e.waitUntil(rede.catch(()=>{}));return caches.match(chave||e.request,{ignoreSearch:true}).then(r=>r||rede);}
self.addEventListener("fetch",e=>{const req=e.request;if(req.method!=="GET")return;const u=new URL(req.url);
  if(req.mode==="navigate"){e.respondWith(cacheEAtualiza(e,"index.html").catch(()=>caches.match("index.html")));return;}
  if(u.origin===location.origin){
    if(/\/(assets|voz-f|voz-m)\//.test(u.pathname)){e.respondWith(caches.match(req).then(r=>r||fetch(req).then(resp=>{if(resp.ok){const c=resp.clone();caches.open(CACHE).then(x=>x.put(req,c));}return resp;})));return;}
    e.respondWith(cacheEAtualiza(e));return;}
  if(/(fonts\.googleapis|fonts\.gstatic|www\.gstatic)\.com$/.test(u.hostname))
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(resp=>{const c=resp.clone();caches.open(CACHE).then(x=>x.put(req,c));return resp;})));});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(l=>{for(const c of l)if("focus" in c)return c.focus();return self.clients.openWindow("./");}));});
