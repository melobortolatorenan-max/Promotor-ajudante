import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const $ = (s) => document.querySelector(s);
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pausa = (ms) => new Promise(r => setTimeout(r, ms));
const NOMES = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const DIA = new Date().getDay();

const app = initializeApp(window.FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);

const diasDaLoja = (l) => Array.isArray(l.diasVisita) ? l.diasVisita : (typeof l.diaVisita === 'number' ? [l.diaVisita] : []);
const mostrar = (html) => { $('#rota-corpo').innerHTML = html; };

// distância em km, em linha reta
function distancia(a, b) {
  const R = 6371, rad = (x) => x * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// endereço -> coordenadas, pelo OpenStreetMap (gratuito); guarda no aparelho para não repetir
async function coordenadas(endereco) {
  const chave = 'geo:' + endereco.toLowerCase();
  const guardado = localStorage.getItem(chave);
  if (guardado) return JSON.parse(guardado);
  await pausa(1100); // o serviço pede no máximo 1 pedido por segundo
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=' + encodeURIComponent(endereco);
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  const j = await r.json();
  if (!j.length) return null;
  const pt = { lat: +j[0].lat, lng: +j[0].lon };
  localStorage.setItem(chave, JSON.stringify(pt));
  return pt;
}

function localizacao() {
  return new Promise((ok) => {
    if (!navigator.geolocation) return ok(null);
    navigator.geolocation.getCurrentPosition(
      (p) => ok({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => ok(null),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// ordem: sempre a parada mais próxima de onde você está agora
function ordenar(paradas, origem) {
  if (!origem) return [...paradas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const restantes = [...paradas], rota = [];
  let atual = origem;
  while (restantes.length) {
    restantes.sort((a, b) => distancia(atual, a.pt) - distancia(atual, b.pt));
    const prox = restantes.shift();
    rota.push(prox);
    atual = prox.pt;
  }
  return rota;
}

function cartao(p, i, origem) {
  const destino = p.pt ? `${p.pt.lat},${p.pt.lng}` : p.endereco;
  const km = origem && p.pt ? `${distancia(origem, p.pt).toFixed(1)} km em linha reta` : '';
  return `<div class="rounded-2xl border border-gray-800 bg-[#111827] p-4">
    <div class="flex items-start gap-3">
      <div class="w-8 h-8 rounded-full bg-amber-500 text-gray-950 font-black flex items-center justify-center shrink-0">${i + 1}</div>
      <div class="flex-1">
        <div class="text-white font-black italic uppercase text-sm">${esc(p.nome)}</div>
        <div class="text-gray-400 text-xs">${esc(p.endereco)}</div>
        ${km ? `<div class="text-amber-500 text-[11px] font-bold mt-1">${km}</div>` : ''}
      </div>
    </div>
    <div class="grid grid-cols-2 gap-2 mt-3">
      <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}" target="_blank" rel="noopener" class="text-center py-2 rounded-xl border border-gray-700 text-gray-200 text-[11px] font-black uppercase">Google Maps</a>
      <a href="https://waze.com/ul?${p.pt ? `ll=${p.pt.lat},${p.pt.lng}` : `q=${encodeURIComponent(p.endereco)}`}&navigate=yes" target="_blank" rel="noopener" class="text-center py-2 rounded-xl border border-sky-500/60 text-sky-400 text-[11px] font-black uppercase">Waze</a>
    </div>
  </div>`;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    mostrar('<p class="text-gray-300">Entre no app primeiro para ver a rota de hoje.</p><a href="index.html" class="inline-block mt-3 px-4 py-3 rounded-xl bg-amber-500 text-gray-950 font-black uppercase text-xs">Abrir o app</a>');
    return;
  }
  mostrar('Carregando as lojas de hoje...');
  try {
    const snap = await getDocs(collection(db, 'users', user.uid, 'lojas'));
    const hoje = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(l => diasDaLoja(l).includes(DIA));
    if (!hoje.length) {
      mostrar(`<p class="text-gray-300">Nenhuma loja de atendimento marcada para ${NOMES[DIA]}.</p><p class="text-xs text-gray-500 mt-2">Marque os dias de visita de cada loja no app.</p>`);
      return;
    }
    const semEndereco = hoje.filter(l => !(l.endereco || '').trim());
    const comEndereco = hoje.filter(l => (l.endereco || '').trim());
    mostrar(`Localizando ${comEndereco.length} loja(s) no mapa...`);

    const paradas = [], naoEncontradas = [];
    for (const l of comEndereco) {
      const pt = await coordenadas(l.endereco.trim());
      if (pt) paradas.push({ nome: l.nome, endereco: l.endereco.trim(), pt });
      else naoEncontradas.push(l.nome);
    }
    const origem = await localizacao();
    const rota = ordenar(paradas, origem);

    let html = `<div class="text-[11px] text-gray-500 mb-1">${NOMES[DIA].toUpperCase()} · ${origem ? 'ordenado pela sua localização' : 'localização indisponível: ordem alfabética'}</div>`;
    html += rota.map((p, i) => cartao(p, i, origem)).join('');
    if (!origem) html += '<p class="text-xs text-gray-500">Permita a localização no navegador para a rota sair da sua posição atual.</p>';
    if (naoEncontradas.length) html += `<p class="text-xs text-red-400">Não encontrei o endereço de: ${naoEncontradas.map(esc).join(', ')}. Confira o endereço na tela da loja.</p>`;
    if (semEndereco.length) html += `<p class="text-xs text-amber-500">Sem endereço cadastrado: ${semEndereco.map(l => esc(l.nome)).join(', ')}. Cadastre no app, na tela de cada loja.</p>`;
    mostrar(html);
  } catch (e) {
    console.error(e);
    mostrar('<p class="text-red-400">Não consegui carregar a rota agora. Verifique a conexão e toque em Atualizar.</p>');
  }
});

$('#rota-atualizar').addEventListener('click', () => location.reload());
