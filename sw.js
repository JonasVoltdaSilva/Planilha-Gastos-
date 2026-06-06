// Network-only com bypass total do cache HTTP para arquivos próprios
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Para arquivos do próprio site: ignora cache HTTP, sempre busca da rede
  if (url.origin === self.location.origin) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }));
  }
  // CDN externos (React, Babel, etc.): deixa o browser gerenciar normalmente
});
