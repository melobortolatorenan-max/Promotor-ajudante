const NOME_DO_CACHE = 'promotor-v11';
const ARQUIVOS_ESTATICOS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png' // certifique-se que este caminho está certo
];

// Instalação do Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(NOME_DO_CACHE).then((cache) => {
      return cache.addAll(ARQUIVOS_ESTATICOS);
    })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== NOME_DO_CACHE).map((key) => caches.delete(key))
      );
    })
  );
});

// Responde às requisições (Offline)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// --- LÓGICA DE NOTIFICAÇÃO ---
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Você tem uma nova atualização no Ajuda Promotor!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png', // se tiver um ícone pequeno de aviso
    vibrate: [100, 50, 100]
  };

  event.waitUntil(
    self.registration.showNotification('Ajuda Promotor', options)
  );
});

// Abre o app ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
