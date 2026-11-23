const CACHE='tatamedesk-v28';
const FILES=['./','./index.html','./style.css?v=28','./app.js?v=28','./manifest.json','./icon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(FILES);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('tatamedesk-')&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      // Sempre tenta a versão publicada primeiro para não servir relatórios/código antigos.
      const fresh=await fetch(event.request,{cache:'no-store'});
      if(fresh&&fresh.ok)await cache.put(event.request,fresh.clone());
      return fresh;
    }catch(error){
      const cached=await cache.match(event.request);
      if(cached)return cached;
      if(event.request.mode==='navigate')return cache.match('./index.html');
      throw error;
    }
  })());
});
