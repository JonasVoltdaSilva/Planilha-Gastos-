const CACHE = 'cofrinho-v6';
const LOCAL = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './icon.svg',
  './icons.jsx',
  './data.jsx',
  './chart.jsx',
  './modal.jsx',
  './views.jsx',
  './app.jsx',
];

// Instala e pré-carrega o cache para uso offline
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(LOCAL)).then(() => self.skipWaiting())
  );
});

// Ativa imediatamente, limpa caches antigos e recarrega todas as abas abertas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then(clients => clients.forEach(client => client.navigate(client.url)))
  );
});

// Network-first: busca da rede (sempre atualizado), cai no cache só se offline
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
