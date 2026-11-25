import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

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

// variações do mesmo endereço, do mais exato ao mais genérico
function variantes(e) {
  const base = e.trim();
  const sem = base.split(' - ')[0];
  const exp = (t) => t
    .replace(/^Av\.?\s+/i, 'Avenida ')
    .replace(/^R\.\s+/i, 'Rua ')
    .replace(/\bGov\.\s*/i, 'Governador ')
    .replace(/\bPres\.\s*/i, 'Presidente ');
  const lista = [base, sem, exp(base), exp(sem), exp(sem).replace(/,\s*\d+[^,]*/, '')];
  const comCidade = lista.map(x => /florian/i.test(x) ? x : x + ', Florianópolis, SC');
  return [...new Set([...lista, ...comCidade].map(x => x.trim()).filter(Boolean))].slice(0, 8);
}

// endereço -> coordenadas, pelo OpenStreetMap (gratuito); guarda no aparelho para não repetir
async function coordenadas(endereco) {
  const chave = 'geo:' + endereco.toLowerCase();
  const guardado = localStorage.getItem(chave);
  if (guardado) return JSON.parse(guardado);
  for (const t of variantes(endereco)) {
    await pausa(1100); // o serviço pede no máximo 1 pedido por segundo
    const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=' + encodeURIComponent(t);
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!r.ok) continue;
    const j = await r.json();
    if (j.length) {
      const pt = { lat: +j[0].lat, lng: +j[0].lon };
      localStorage.setItem(chave, JSON.stringify(pt));
      return pt;
    }
  }
  return null;
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
    // ordem definida pelo usuário na tela Lojas (setas de subir e descer); empate: alfabética
    const paradas = comEndereco
        .map(l => ({ id: l.id, nome: l.nome, ordem: typeof l.ordem === 'number' ? l.ordem : 9999, endereco: l.endereco.trim(), pt: null }))
        .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, 'pt-BR'));
    let html = `<div class="text-[11px] text-gray-500 mb-1">${NOMES[DIA].toUpperCase()} · ordem definida no app (tela Lojas)</div>`;
    html += paradas.map((p, i) => cartao(p, i, null) + `<div class="flex gap-2 justify-end -mt-2 mb-3"><button data-mover="${i}" data-dir="-1" class="px-3 py-1 rounded-lg border border-gray-700 text-gray-300 text-xs" aria-label="Subir">&#9650; subir</button><button data-mover="${i}" data-dir="1" class="px-3 py-1 rounded-lg border border-gray-700 text-gray-300 text-xs" aria-label="Descer">&#9660; descer</button></div>`).join('');
    if (semEndereco.length) html += `<p class="text-xs text-amber-500">Sem endereço cadastrado: ${semEndereco.map(l => esc(l.nome)).join(', ')}. Cadastre no app, na tela de cada loja.</p>`;
    mostrar(html);
    document.querySelectorAll('[data-mover]').forEach(b => b.addEventListener('click', async () => {
      const i = Number(b.dataset.mover), j = i + Number(b.dataset.dir);
      if (j < 0 || j >= paradas.length) return;
      const A = paradas[i], C = paradas[j];
      const diferentes = C.ordem !== A.ordem;
      const novoA = diferentes ? C.ordem : j, novoC = diferentes ? A.ordem : i;
      try {
        await Promise.all([
          updateDoc(doc(db, 'users', user.uid, 'lojas', A.id), { ordem: novoA }),
          updateDoc(doc(db, 'users', user.uid, 'lojas', C.id), { ordem: novoC }),
        ]);
        location.reload();
      } catch (e) { console.warn('ordem:', e); alert('Não consegui mudar a ordem agora. Verifique a internet.'); }
    }));
  } catch (e) {
    console.error(e);
    mostrar('<p class="text-red-400">Não consegui carregar a rota agora. Verifique a conexão e toque em Atualizar.</p>');
  }
});

$('#rota-atualizar').addEventListener('click', () => location.reload());
