const CACHE_NAME = 'promotor-v5-force'; // Versão nova para forçar o browser a atualizar

self.addEventListener('install', (event) => {
    // Força o Service Worker a se tornar ativo imediatamente
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    // Apaga ABSOLUTAMENTE todos os caches antigos
                    return caches.delete(cache);
                })
            );
        }).then(() => self.clients.claim()) // Assume o controle da página na hora
    );
});

self.addEventListener('fetch', (event) => {
    // Tenta buscar na rede primeiro, se falhar, vai pro cache
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
