// Service worker do Promotor Ajudante:
//  1) notificações push (Firebase Cloud Messaging)
//  2) funcionamento sem internet (guarda o app e as bibliotecas no aparelho)
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
importScripts('firebase-config.js');

try {
  firebase.initializeApp(self.FIREBASE_CONFIG);
  firebase.messaging();   // com o app fechado, o Firebase exibe a notificação e abre o link ao tocar
} catch (e) { /* aparelho sem suporte a notificações: o app continua funcionando normalmente */ }

const CACHE = 'promotor-ajudante-v1';
const ESPERA_REDE_MS = 3000;   // com sinal fraco, depois de 3 s usa a cópia guardada no aparelho

// Arquivos do próprio app (sempre tenta a internet primeiro, para pegar atualizações)
const LOCAIS = ['./', 'index.html', 'firebase-config.js', 'manifest.json', 'logo.png'];
// Bibliotecas externas com versão fixa (ficam guardadas e abrem na hora)
const HOSTS_CDN = ['cdn.tailwindcss.com', 'unpkg.com', 'www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'raw.githubusercontent.com'];
const CDN = [
  'https://cdn.tailwindcss.com/3.4.17',
  'https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap',
];

async function baixar(url) {
  try { return await fetch(url, { mode: 'cors', credentials: 'omit' }); }
  catch (_) { return fetch(url, { mode: 'no-cors' }); }
}
async function guardarTudo() {
  const c = await caches.open(CACHE);
  await Promise.all([
    ...LOCAIS.map(u => fetch(u, { cache: 'reload' }).then(r => (r.ok ? c.put(u, r) : null)).catch(() => {})),
    ...CDN.map(u => baixar(u).then(r => (r && (r.ok || r.type === 'opaque') ? c.put(u, r) : null)).catch(() => {})),
  ]);
}

self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(guardarTudo()); });
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const nomes = await caches.keys();
    await Promise.all(nomes.filter(n => n !== CACHE).map(n => caches.delete(n)));   // limpa versões antigas
    await self.clients.claim();
    const janelas = await self.clients.matchAll({ type: 'window' });
    janelas.forEach(j => j.postMessage('sw-ativo-v1'));   // a página guarda as bibliotecas que ainda faltam
  })());
});

// Internet primeiro (com limite de espera); se falhar ou demorar, usa a cópia do aparelho
async function redeOuCache(req) {
  const cache = await caches.open(CACHE);
  const rede = fetch(req).then((r) => { if (r && r.ok) cache.put(req, r.clone()); return r; });
  rede.catch(() => {});
  try {
    return await Promise.race([rede, new Promise((_, rej) => setTimeout(() => rej(new Error('lento')), ESPERA_REDE_MS))]);
  } catch (_) {
    const guardado = await cache.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await cache.match('./index.html') : null);
    if (guardado) return guardado;
    return rede;   // não há cópia: espera a internet mesmo
  }
}
// Cópia do aparelho primeiro; se não houver, busca na internet e guarda
async function cacheOuRede(req) {
  const cache = await caches.open(CACHE);
  const guardado = await cache.match(req);
  if (guardado) return guardado;
  const r = await fetch(req);
  if (r && (r.ok || r.type === 'opaque')) cache.put(req, r.clone());
  return r;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url; try { url = new URL(req.url); } catch (_) { return; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.origin === self.location.origin) {
    if (url.pathname.endsWith('firebase-messaging-sw.js')) return;
    e.respondWith(redeOuCache(req));
  } else if (HOSTS_CDN.includes(url.hostname)) {
    e.respondWith(cacheOuRede(req));
  }
  // qualquer outra coisa (Firestore, login, notificações) passa direto, sem interferência
});
