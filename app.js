// Logo: se o arquivo local não carregar, usa a cópia do GitHub (sem script inline no HTML)
document.addEventListener('error', (e) => {
  const t = e.target;
  if (t && t.tagName === 'IMG' && t.dataset && t.dataset.fallbackLogo && t.dataset.fb !== '1') {
    t.dataset.fb = '1';
    t.src = 'https://raw.githubusercontent.com/melobortolatorenan-max/Promotor-ajudante/main/logo.png';
  }
}, true);
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
    import { normaliza, distancia, motivoObrigatorio, parseValidade } from "./regras.mjs";
    import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-check.js";
    import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile, GoogleAuthProvider, signInWithPopup, deleteUser }
        from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
    import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, doc, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, where, writeBatch, serverTimestamp, getDoc, getDocs, runTransaction, waitForPendingWrites }
        from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
    import { getMessaging, getToken, deleteToken, onMessage, isSupported }
        from "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging.js";

    /* ================= utilidades ================= */
    const VERSAO_APP = 'v60';
    document.getElementById('versao-login').textContent = VERSAO_APP;
    const API_BASE = 'https://promotor-ajudante.vercel.app';
    const SETORES = ['Bebidas', 'Doces', 'Higiene', 'Laticínios', 'Leites', 'Limpeza', 'Massas congeladas', 'Molhos', 'Pães', 'Salgadinhos', 'Temperos'];
    const ASSINATURA = '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';   // marca d'água "Designed and created by"
    const $ = (s) => document.querySelector(s);
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const fmt = (d) => d.split('-').reverse().join('/');
    // dias entre hoje (fuso do aparelho) e a data 'AAAA-MM-DD'. Negativo = já venceu.
    const mesAtualISO = () => isoLocal(new Date()).slice(0, 7);
    // Só valem os registros do mês corrente; os de meses anteriores são apagados automaticamente
    const vencMes = () => vencidos.filter(v => (v.dataRetirada || '').slice(0, 7) === mesAtualISO());
    function diasParaFimDoMes() {
        const h = new Date(); h.setHours(0, 0, 0, 0);
        return Math.round((new Date(h.getFullYear(), h.getMonth() + 1, 0) - h) / 86400000);
    }
    function ultimoDiaDoMes() { const h = new Date(); return isoLocal(new Date(h.getFullYear(), h.getMonth() + 1, 0)); }
    const PERIODOS = [['dia', 'Hoje'], ['ontem', 'Ontem'], ['semana', 'Esta semana'], ['15', 'Últimos 15 dias'], ['mes', 'Mês todo'], ['datas', 'Data específica']];
    // Faixa de datas de cada período (sempre limitada ao mês corrente)
    function faixaPeriodo(tipo) {
        const h = new Date(); h.setHours(0, 0, 0, 0);
        const fim = isoLocal(h), primeiro = fim.slice(0, 8) + '01';
        let ini = fim, fimRot = fim;
        if (tipo === 'ontem') { const d = new Date(h); d.setDate(d.getDate() - 1); const o = isoLocal(d); return { ini: o, fim: o, fimRot: o }; }
        if (tipo === 'semana') { const d = new Date(h); d.setDate(d.getDate() - ((h.getDay() + 6) % 7)); ini = isoLocal(d); }   // segunda-feira
        if (tipo === '15') { const d = new Date(h); d.setDate(d.getDate() - 14); ini = isoLocal(d); }
        if (tipo === 'mes') { ini = primeiro; fimRot = ultimoDiaDoMes(); }
        if (ini < primeiro) ini = primeiro;
        return { ini, fim, fimRot };
    }
    const isoLocal = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    function diasAte(dataISO) {
        const [y, m, d] = dataISO.split('-').map(Number);
        const alvo = new Date(y, m - 1, d);
        const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
        return Math.round((alvo - hoje) / 86400000);
    }
    const plural = (n, a, b) => n === 1 ? a : b;

    /* ================= estado ================= */
    let app, auth, db, messaging, msgOk = false;
    let uid = null, userInfo = null;
    let lojas = [], produtos = [], vencidos = [];
    let diasSalvos = false, termosGravado = false;



    /* ---- visita automática: qualquer registro na loja conta como visita do dia ---- */
    const visitasMarcadasSessao = new Set();
    function registrarVisitaAuto(lojaId) {
        const l = lojas.find(x => x.id === lojaId);
        if (!l || !uid) return;
        if (!infoDiaLoja(l).atendeHoje) return;   // fora do dia de atendimento não conta como visita
        const hoje = isoLocal(new Date()), chave = `${lojaId}|${hoje}`;
        if (visitasMarcadasSessao.has(chave) || visitas.some(v => v.lojaId === lojaId && v.data === hoje && !v.semVisita && !v.extra)) return;
        visitasMarcadasSessao.add(chave);
        const ag = new Date();
        addDoc(collection(db, 'users', uid, 'visitas'), { lojaId, lojaNome: l.nome, data: hoje, hora: `${String(ag.getHours()).padStart(2, '0')}:${String(ag.getMinutes()).padStart(2, '0')}`, criadoEm: serverTimestamp() })
            .catch(e => { visitasMarcadasSessao.delete(chave); erroDb(e); });
    }

    /* ---- loja da foto PDV: vale 30 min a partir da primeira informação ---- */
    let pdvLoja = null, pdvDepois = null;
    const PDV_JANELA = 30 * 60 * 1000;
    const pdvLojaValida = () => !!pdvLoja && (Date.now() - pdvLoja.ts) < PDV_JANELA;
    let pdvSelecionada = null;
    function pdvListaLojas(depois) {
        pdvDepois = depois;
        const box = $('#pdv-loja'); box.classList.remove('hidden'); box.classList.add('flex');
        const lista = [...lojas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        const sel = lista.find(l => l.id === pdvSelecionada);
        const cards = lista.length
            ? lista.map(l => `<button data-act="pdvEscolherLoja" data-id="${esc(l.id)}" class="card-app w-full p-4 mb-3 text-left text-white font-black italic uppercase text-sm ${l.id === pdvSelecionada ? 'border border-amber-500' : ''}">${esc(l.nome)}</button>`).join('')
            : '<p class="text-gray-500 text-[11px]">Cadastre uma loja antes de tirar a foto.</p>';
        const rodape = sel
            ? `<button data-act="pdvLojaConfirmar" class="w-full py-4 rounded-xl bg-amber-500 text-black text-[11px] font-black uppercase mt-2">Tirar foto em ${esc(sel.nome)}</button>`
            : '<p class="text-gray-500 text-[11px] mt-2">Escolha a loja para tirar a foto.</p>';
        $('#pdv-loja-lista').innerHTML = cards + rodape + `<button data-act="pdvLojaCancelar" class="w-full py-3 text-[10px] font-black uppercase text-gray-500 mt-2">Cancelar</button>`;
    }
    function pdvListaFechar() { const box = $('#pdv-loja'); box.classList.add('hidden'); box.classList.remove('flex'); }
    function pdvLojaCancelar() { pdvListaFechar(); pdvDepois = null; pdvSelecionada = null; }
    function pdvEscolherLoja(id) {
        pdvSelecionada = id;
        pdvListaLojas(pdvDepois);
    }
    function pdvLojaConfirmar() {
        const l = lojas.find(x => x.id === pdvSelecionada); if (!l) return;
        pdvLoja = { lojaId: l.id, nome: l.nome, ts: Date.now() };
        const depois = pdvDepois;
        pdvDepois = null; pdvSelecionada = null;
        pdvListaFechar();
        if (depois) depois();
    }

    /* ---- foto PDV: foto com data, hora, nome e marca d'água ---- */
    const pdv = { stream: null, blob: null, nomeArq: '' };
    let logoPdv = null;
    const logoParaMarca = () => { if (!logoPdv) { logoPdv = new Image(); logoPdv.src = 'logo.png'; } return logoPdv; };
    function cortarTexto(ctx, txt, max) {
        if (ctx.measureText(txt).width <= max) return txt;
        let t = txt;
        while (t.length > 3 && ctx.measureText(t + '…').width > max) t = t.slice(0, -1);
        return t + '…';
    }
    function desenharMarca(ctx, W, H, nome, local, lojaNome, lojaEnd) {
        const ag = new Date();
        const dataHora = ag.toLocaleDateString('pt-BR') + ' ' + String(ag.getHours()).padStart(2, '0') + ':' + String(ag.getMinutes()).padStart(2, '0');
        const pad = Math.round(W * 0.025), fs = Math.round(W * 0.03), fsMenor = Math.round(W * 0.022);
        // faixa escura atrás do logo, do nome e da data: começa no final da foto e tem a altura do texto
        const addrFs = fsMenor * 0.95, addrLine = addrFs * 1.3;
        const bandH = fs * 1.25 + fsMenor * 1.1 + pad * 1.6 + (local ? fsMenor * 1.35 : 0) + (lojaNome && lojaEnd ? addrLine : 0);
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, H - bandH, W, bandH); ctx.restore();
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.75)'; ctx.shadowBlur = fs * 0.4;
        ctx.fillStyle = '#f59e0b'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
        let y = H - pad;
        ctx.font = `800 ${fs}px Arial, sans-serif`;
        ctx.fillText(nome, W - pad, y); y -= fs * 1.25;
        ctx.font = `600 ${fsMenor}px Arial, sans-serif`;
        ctx.fillText(dataHora, W - pad, y); y -= fsMenor * 1.35;
        if (local) {
            ctx.fillText(cortarTexto(ctx, local, W * 0.62), W - pad, y);
        }
        ctx.restore();
        if (lojaNome) {
            const baseEnd = H - pad - (lojaEnd ? addrLine : 0);
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,.75)'; ctx.shadowBlur = fs * 0.4;
            ctx.fillStyle = '#f59e0b'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
            ctx.font = `800 ${fsMenor * 1.1}px Arial, sans-serif`;
            ctx.fillText(cortarTexto(ctx, String(lojaNome).toUpperCase(), W * 0.34), W / 2, baseEnd);
            ctx.restore();
            if (lojaEnd) {
                ctx.save();
                ctx.shadowColor = 'rgba(0,0,0,.75)'; ctx.shadowBlur = fs * 0.4;
                ctx.fillStyle = '#e5e7eb'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
                ctx.font = `600 ${addrFs}px Arial, sans-serif`;
                ctx.fillText(cortarTexto(ctx, String(lojaEnd), W * 0.4), W / 2, H - pad);
                ctx.restore();
            }
        }
        const logo = logoSemFundo();
        const hL = fs * 1.25 + fsMenor * 1.1;          // altura do bloco de texto (PROMOTOR até AJUDANTE)
        const lh = hL, lw = logo ? hL * logo.width / logo.height : 0;
        if (logo) {
            ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.globalAlpha = 0.9;
            ctx.drawImage(logo, pad, H - pad - lh, lw, lh);
            ctx.restore();
        }
        // nome do app ao lado do boneco
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.75)'; ctx.shadowBlur = lh * 0.15;
        ctx.fillStyle = '#f59e0b'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
        const xTexto = pad + lw + lh * 0.25;
        ctx.font = `600 ${fsMenor}px Arial, sans-serif`;   // mesmo tamanho da data e hora
        // alinhado com as linhas da direita: AJUDANTE na linha do nome, PROMOTOR na linha da data
        ctx.fillText('PROMOTOR', xTexto, H - pad - fs * 1.25);
        ctx.fillText('AJUDANTE', xTexto, H - pad);
        ctx.restore();
    }
    let logoLimpo = null;
    function logoSemFundo() {
        if (logoLimpo) return logoLimpo;
        const img = logoParaMarca();
        if (!img.complete || !img.naturalWidth) return null;
        const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
        const cx = c.getContext('2d'); cx.drawImage(img, 0, 0);
        const d = cx.getImageData(0, 0, c.width, c.height), px = d.data;
        for (let i = 0; i < px.length; i += 4) {
            const m = Math.max(px[i], px[i + 1], px[i + 2]);
            if (m < 30) px[i + 3] = 0;
            else if (m < 60) px[i + 3] = Math.round(px[i + 3] * (m - 30) / 30);
        }
        cx.putImageData(d, 0, 0);
        // recorta as margens transparentes, para o desenho ficar alinhado pela parte visível
        let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
        for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
            if (px[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        }
        if (x1 < 0) { logoLimpo = c; return c; }
        const r = document.createElement('canvas'); r.width = x1 - x0 + 1; r.height = y1 - y0 + 1;
        r.getContext('2d').drawImage(c, x0, y0, r.width, r.height, 0, 0, r.width, r.height);
        logoLimpo = r;
        return r;
    }
    async function obterLocalizacao() {
        // Só usa a localização se ela já estiver liberada no navegador. Nunca pede permissão durante a foto.
        try {
            if (!navigator.geolocation || !navigator.permissions) return null;
            const st = await navigator.permissions.query({ name: 'geolocation' });
            if (st.state !== 'granted') return null;
        } catch (e) { return null; }
        return new Promise(resolve => {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const lat = pos.coords.latitude, lon = pos.coords.longitude;
                if (!navigator.onLine) return resolve(null);
                const coords = lat.toFixed(5) + ', ' + lon.toFixed(5);
                let endereco = null;
                try {
                    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 6000);
                    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=pt-BR&zoom=18&lat=${lat}&lon=${lon}`, { signal: ctl.signal, headers: { Accept: 'application/json' } });
                    clearTimeout(t);
                    const j = await r.json(), a = j.address || {};
                    const partes = [a.road, a.house_number, a.suburb || a.neighbourhood, a.city || a.town || a.municipality].filter(Boolean);
                    endereco = partes.length ? partes.join(', ') : (j.display_name || null);
                } catch (e) { console.warn('endereço:', e); }
                resolve(endereco || coords);
            }, () => resolve(null), { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
        });
    }
    // ---- zoom 1x/2x e lanterna nas câmeras (leitura de código e foto do PDV) ----
    const camEstado = { scan: { zoom: 1, flash: false }, pdv: { zoom: 1, flash: false } };
    function camTrack(box) { const s = box === 'scan' ? leitor.stream : pdv.stream; return s ? s.getVideoTracks()[0] : null; }
    function camDestacar(box) {
        const barra = document.getElementById(box + '-cam'); if (!barra) return;
        barra.querySelectorAll('[data-z]').forEach(b => { const on = Number(b.dataset.z) === camEstado[box].zoom; b.classList.toggle('bg-amber-500', on); b.classList.toggle('border-amber-500', on); b.classList.toggle('text-gray-950', on); b.classList.toggle('text-white', !on); });
        const f = barra.querySelector('[data-flash]');
        if (f) { const on = camEstado[box].flash; f.classList.toggle('bg-amber-500', on); f.classList.toggle('border-amber-500', on); f.classList.toggle('text-gray-950', on); f.classList.toggle('text-white', !on); }
    }
    function camPrepararBotoes(box) {
        camEstado[box] = { zoom: 1, flash: false };
        const t = camTrack(box), caps = t && t.getCapabilities ? t.getCapabilities() : {};
        const barra = document.getElementById(box + '-cam'); if (!barra) return;
        const mostra = !!(caps.zoom || caps.torch);
        barra.classList.toggle('hidden', !mostra); barra.classList.toggle('flex', mostra);
        barra.querySelectorAll('[data-z]').forEach(b => b.classList.toggle('hidden', !caps.zoom));
        barra.querySelectorAll('[data-flash]').forEach(b => b.classList.toggle('hidden', !caps.torch));
        camDestacar(box);
    }
    async function camZoom(box, z) {
        const t = camTrack(box); if (!t || !t.getCapabilities) return;
        const caps = t.getCapabilities(); if (!caps.zoom) return;
        const alvo = Math.min(caps.zoom.max, Math.max(caps.zoom.min, z));
        await t.applyConstraints({ advanced: [{ zoom: alvo }] }).catch(() => {});
        camEstado[box].zoom = z; camDestacar(box);
    }
    async function camFlash(box) {
        const t = camTrack(box); if (!t || !t.getCapabilities) return;
        if (!t.getCapabilities().torch) return;
        camEstado[box].flash = !camEstado[box].flash;
        await t.applyConstraints({ advanced: [{ torch: camEstado[box].flash }] }).catch(() => {});
        camDestacar(box);
    }
    async function pdvIniciarCamera() {
        if (pdv.stream) return;
        try {
            pdv.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
            const v = $('#pdv-video'); v.srcObject = pdv.stream; await v.play();
            camPrepararBotoes('pdv');
            // sobe para a resolução máxima que este aparelho oferece
            const track = pdv.stream.getVideoTracks()[0];
            const caps = track && track.getCapabilities ? track.getCapabilities() : {};
            if (caps.width && caps.height) {
                await track.applyConstraints({ width: { ideal: caps.width.max }, height: { ideal: caps.height.max } }).catch(() => {});
            }
        } catch (e) {
            console.error('camera PDV:', e);
            aviso('Não consegui acessar a câmera. Confira a permissão do navegador.', { soConfirmar: true });
        }
    }
    async function pdvAbrirCamera() {
        $('#pdv-trocar').classList.toggle('hidden', !pdvLojaValida());
        const box = $('#pdv'); box.classList.remove('hidden'); box.classList.add('flex');
        const temNome = !!(userInfo && userInfo.displayName);
        $('#pdv-nome-box').classList.toggle('hidden', temNome);
        $('#pdv-nome').value = temNome ? userInfo.displayName : '';
        pdv.blob = null;
        $('#pdv-share').classList.add('invisible');
        logoParaMarca();
    }
    // Câmera nativa do celular: a foto já sai na posição certa
    function pdvAbrirCameraNativa() {
        const inp = document.getElementById('pdv-arquivo');
        if (!inp) return aviso('Não consegui abrir a câmera. Atualize o app.', { soConfirmar: true });
        const bx = $('#pdv'); bx.classList.add('hidden'); bx.classList.remove('flex');
        inp.value = '';
        inp.click();
    }
    async function pdvArquivoEscolhido(ev) {
        const f = ev.target.files && ev.target.files[0];
        if (!f) return;
        try {
            const bmp = await createImageBitmap(f, { imageOrientation: 'from-image' });
            await pdvCapturar(bmp);
        } catch (e) { console.warn('foto PDV:', e); aviso('Não consegui usar essa foto. Tente de novo.', { soConfirmar: true }); }
    }
    // Relatório em PDF: abre a versão para imprimir; no celular, escolha "Salvar como PDF"
    function exportarPdf() {
        const mes = isoLocal(new Date()).slice(0, 7);
        const itens = vencidos.filter(v => (v.dataRetirada || '').startsWith(mes));
        const nomeLoja = id => (lojas.find(l => l.id === id) || {}).nome || 'Loja';
        const total = itens.reduce((s, v) => s + (Number(v.qtd) || 0), 0);
        const linhas = itens.map(v => `<tr><td>${esc(v.nome || '')}</td><td>${esc(nomeLoja(v.lojaId))}</td><td>${esc(v.marcaNome || '')}</td><td>${dataBR(v.dataRetirada || '')}</td><td style="text-align:right">${Number(v.qtd) || 0}</td></tr>`).join('');
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Relatório de vencidos</title>
            <style>body{font-family:Arial,sans-serif;color:#111;padding:20px}h1{font-size:18px;margin:0 0 4px}p{font-size:12px;color:#555}
            table{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px}th,td{border-bottom:1px solid #ddd;padding:6px;text-align:left}th{background:#f3f4f6}
            .total{margin-top:12px;font-weight:bold}</style></head><body>
            <h1>Relatório de vencidos: ${esc(mes)}</h1><p>Promotor Ajudante · ${esc(userInfo && userInfo.displayName ? userInfo.displayName : '')}</p>
            <table><thead><tr><th>Produto</th><th>Loja</th><th>Marca</th><th>Data</th><th style="text-align:right">Qtd</th></tr></thead><tbody>${linhas || '<tr><td colspan="5">Nenhum vencido neste mês.</td></tr>'}</tbody></table>
            <p class="total">Total: ${total} unidades</p></body></html>`;
        const janela = window.open('', '_blank');
        if (!janela) return aviso('Permita abrir janelas para gerar o PDF.', { soConfirmar: true });
        janela.document.write(html); janela.document.close();
        janela.focus(); setTimeout(() => janela.print(), 300);
    }
    async function pdvAbrir() {
        if (!pdvLojaValida()) return pdvListaLojas(() => pdvAbrirCameraNativa());
        pdvAbrirCameraNativa();
        await pdvAbrirCamera();
    }
    function pdvFechar() {
        if (pdv.stream) { pdv.stream.getTracks().forEach(t => t.stop()); pdv.stream = null; }
        pdv.blob = null;
        const v = $('#pdv-video'); if (v) v.srcObject = null;
        const box = $('#pdv'); box.classList.add('hidden'); box.classList.remove('flex');
    }
    async function pdvCapturar(externa) {
        const imgExt = (typeof ImageBitmap !== 'undefined' && externa instanceof ImageBitmap) ? externa : null;
        if (!pdvLojaValida()) { pdvListaLojas(null); return; }   // janela de 30 min terminou: pergunta a loja de novo
        const campoNome = $('#pdv-nome-box').classList.contains('hidden') ? '' : $('#pdv-nome').value.trim();
        const nome = (campoNome || (userInfo && userInfo.displayName) || '').slice(0, 40);
        if (!nome) return aviso('Informe seu nome para aparecer na foto.', { soConfirmar: true });
        const v = $('#pdv-video');
        if (!imgExt && !v.videoWidth) return;
        const local = await obterLocalizacao();
        // foto em tamanho cheio do sensor (quando o navegador permite); senão, usa o quadro do vídeo
        let fonte = imgExt || v, FW = imgExt ? imgExt.width : v.videoWidth, FH = imgExt ? imgExt.height : v.videoHeight;
        try {
            const track = pdv.stream && pdv.stream.getVideoTracks()[0];
            // desligado: a imagem bruta do sensor sai deitada; usa o quadro da câmera, que já aparece em pé
            if (false && track && 'ImageCapture' in window) {
                const bmp = await createImageBitmap(await new ImageCapture(track).takePhoto());
                fonte = bmp; FW = bmp.width; FH = bmp.height;
            }
        } catch (e) { console.warn('ImageCapture indisponível, usando o quadro do vídeo:', e); }
        // a saída é sempre em pé: se o quadro vier na horizontal, gira para ficar vertical
        const vw = FW, vh = FH;
        const girar = false;   // o quadro do vídeo já vem na posição certa
        const W0 = girar ? vh : vw, H0 = girar ? vw : vh;
        const c = $('#pdv-canvas'); c.width = W0; c.height = H0;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
        ctx.save();
        if (girar) {
            // sensor deitado + celular em pé: sempre gira no sentido horário (independe da posição informada pelo aparelho)
            ctx.translate(W0, 0); ctx.rotate(Math.PI / 2);
        }
        ctx.drawImage(fonte, 0, 0, vw, vh);
        ctx.restore();
        const lojaDaFoto = pdvLoja ? lojas.find(x => x.id === pdvLoja.lojaId) : null;
        desenharMarca(ctx, W0, H0, nome, local, pdvLoja ? pdvLoja.nome : '', lojaDaFoto && lojaDaFoto.endereco ? lojaDaFoto.endereco : '');
        // foto reduzida para 1600 px no lado maior: envia mais rápido e ocupa menos espaço
        const s = Math.min(1, 1600 / Math.max(c.width, c.height));
        const c2 = document.createElement('canvas'); c2.width = Math.round(c.width * s); c2.height = Math.round(c.height * s);
        c2.getContext('2d').drawImage(c, 0, 0, c2.width, c2.height);
        pdv.blob = await new Promise(r => c2.toBlob(r, 'image/jpeg', 0.85));
        const ag = new Date();
        const stamp = isoLocal(ag) + ' ' + String(ag.getHours()).padStart(2, '0') + '-' + String(ag.getMinutes()).padStart(2, '0') + '-' + String(ag.getSeconds()).padStart(2, '0');
        pdv.nomeArq = `Promotor Ajudante - foto pdv - ${stamp}.jpg`;
        pdvSalvar();                                   // salva em silêncio, sem aviso
        const bx2 = $('#pdv'); bx2.classList.add('hidden'); bx2.classList.remove('flex');
        toast('Foto salva.');
        if (pdvLoja) registrarVisitaAuto(pdvLoja.lojaId);
    }
    async function pdvCompartilhar() {
        if (!pdv.blob) return;
        const arq = new File([pdv.blob], pdv.nomeArq, { type: 'image/jpeg' });
        if (navigator.canShare && navigator.canShare({ files: [arq] })) {
            try { await navigator.share({ files: [arq], title: 'Foto PDV' }); } catch (e) { /* cancelado */ }
        }
    }
    function pdvSalvar() {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(pdv.blob); a.download = pdv.nomeArq;
        document.body.appendChild(a);
        try { a.click(); } catch (e) { console.error('download PDV:', e); }
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    }

    /* ---- leitura de código de barras e registro de códigos ---- */
    aplicarContraste();
    let criadaEm = null;
    let marcaPendente = null;
    let scanPendente = null;   // dados reconhecidos pela leitura, até o usuário sair do cadastro
    let avalPendente = null;   // nota de 1 a 4 aguardando a resposta escrita   // marca lida no código, aplicada quando a loja for escolhida
    // motivo obrigatório: só quando o vencimento for mais de 2 dias depois da retirada
    const qtdInformada = (p) => p.semQtd === false || (p.semQtd === undefined && p.qtd != null && p.qtd !== '');
    const diasDaLoja = (l) => Array.isArray(l.diasVisita) ? l.diasVisita : (typeof l.diaVisita === 'number' ? [l.diaVisita] : []);
    let buscaHits = [];
    const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const htmlAcaoCard = (rot, titulo, sub, act) => `<button data-act="${act}" class="card-app w-full p-4 mb-3 flex items-center justify-between text-left">
        <div><div class="text-[9px] text-gray-500 font-black uppercase mb-1">${rot}</div><div class="text-white font-black italic uppercase text-sm">${titulo}</div><div class="text-gray-500 text-[11px]">${sub}</div></div>
        <i data-lucide="chevron-right" class="w-5 h-5 text-amber-500"></i></button>`;
    const addDiasISO = (iso, n) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };
    let relAcao = 'imprimir';
    let relMotivo = '';          // filtro por motivo no relatório de vencidos
    let scanDestino = null;
    let planoLoja = null;
    let ultimoRegistro = null;
    let superiores = [];
    let solicitacoes = [];       // solicitações de aprovação deste promotor
    let convitesRecebidos = [];   // convites de agências para este promotor         // superiores cadastrados (recebem o relatório semanal)
    let supEdit = null;          // null = lista; 'novo' ou id = formulário
    let visitas = [];            // visitas registradas (loja, data e hora)   // último cadastro de produto feito nesta sessão (para desfazer)        // loja aberta no planograma      // 'busca' quando a leitura serve para a busca        // 'imprimir' ou 'compartilhar' (vale para o próximo relatório)
    let filtroSetor = '';            // filtro de setor na lista de produtos da marca
    let desfazerTimer = null, desfazerFn = null;
    const leitor = { stream: null, timer: null, busy: false, detector: null };
    let fotoCodigoAtual = null;   // { codigo, img } capturado na leitura do código
    function leitorFechar() {
        clearInterval(leitor.timer); leitor.timer = null; leitor.busy = false;
        if (leitor.stream) { leitor.stream.getTracks().forEach(t => t.stop()); leitor.stream = null; }
        const v = $('#scan-video'); if (v) v.srcObject = null;
        const box = $('#scan'); box.classList.add('hidden'); box.classList.remove('flex');
    }
    async function lerCodigo() {
        if (!('BarcodeDetector' in window)) {
            aviso('Este navegador não lê código pela câmera. Digite os números no campo Código de barras.', { soConfirmar: true });
            return;
        }
        const box = $('#scan'); box.classList.remove('hidden'); box.classList.add('flex');
        $('#scan-msg').textContent = 'Aponte a câmera para o código de barras';
        try {
            leitor.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
            const v = $('#scan-video'); v.srcObject = leitor.stream; await v.play();
            camPrepararBotoes('scan');
            try { leitor.detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf'] }); }
            catch (e) { leitor.detector = new BarcodeDetector(); }
            leitor.timer = setInterval(async () => {
                if (leitor.busy) return;
                leitor.busy = true;
                try {
                    const achados = await leitor.detector.detect(v);
                    if (achados.length) {
                        const cod = String(achados[0].rawValue || '').replace(/[^0-9A-Za-z]/g, '');
                        try {
                            const cv = document.createElement('canvas'), f = Math.min(1, 480 / v.videoWidth);
                            cv.width = Math.round(v.videoWidth * f); cv.height = Math.round(v.videoHeight * f);
                            cv.getContext('2d').drawImage(v, 0, 0, cv.width, cv.height);
                            fotoCodigoAtual = { codigo: cod, img: cv.toDataURL('image/jpeg', 0.6) };
                        } catch (e) { console.warn('foto do código:', e); }
                        leitorFechar();
                        if (cod) await codigoLido(cod);
                    }
                } catch (e) { console.warn('leitor:', e); }
                finally { leitor.busy = false; }
            }, 300);
        } catch (e) {
            console.warn('camera:', e);
            leitorFechar();
            aviso('Não consegui acessar a câmera. Confira a permissão do navegador ou digite o código.', { soConfirmar: true });
        }
    }
    // Ao identificar o código: registra o código no sistema (se ainda não existir) e preenche o que já for conhecido
    async function codigoLido(cod) {
        if (scanDestino === 'busca') { scanDestino = null; const bq = $('#busca-q'); if (bq) { bq.value = cod; buscaResultados(); } return; }
        const ref = doc(db, 'codigos', cod);
        let base = null;
        try {
            const snap = await getDoc(ref);
            if (!snap.exists()) {
                await setDoc(ref, { codigo: cod, nome: null, setor: null, marcaNome: null, criadoPor: uid, criadoEm: serverTimestamp() });
            }
            base = snap.exists() ? snap.data() : null;
        } catch (e) {
            console.error('codigo lido:', e);
            aviso(`Código ${esc(cod)} lido, mas não consegui consultar a base agora. Preencha os dados à mão.`, { soConfirmar: true });
        }
        let info = null;
        if (base && base.nome) info = base;
        else {
            // base sem nome: usa um produto já cadastrado por você com esse código (em qualquer loja)
            const pr = produtos.find(p => p.codigo === cod && p.nome);
            if (pr) {
                const l = lojas.find(x => x.id === pr.lojaId);
                const m = l && (l.marcas || []).find(x => x.id === pr.marcaId);
                info = { nome: pr.nome, setor: pr.setor || null, marcaNome: m ? m.nome : null };
            }
        }
        preencherPorCodigo(info || {}, cod);
    }
    // Motivo obrigatório quando a validade é posterior à data da retirada (produto retirado antes de vencer)
    function atualizarMotivoObrigatorio() {
        const pd = $('#pd'), ret = $('#pdret'), rot = $('#motivo-rotulo'), box = $('#venc-motivo-box');
        if (!pd || !ret) return;
        const obrig = !!pd.value && motivoObrigatorio(pd.value, ret.value);
        if (rot) rot.textContent = obrig ? '(obrigatório)' : '(opcional)';
        if (obrig && box) box.classList.remove('hidden');
    }
    function aplicarMarcaPendente() {
        const pm = $('#pm');
        if (!pm || !marcaPendente) return;
        const op = [...pm.options].find(o => o.textContent.trim().toLowerCase() === marcaPendente.toLowerCase());
        if (op) pm.value = op.value;
    }
    function preencherPorCodigo(d, cod) {
        scanPendente = { nome: d.nome || '', setor: d.setor || '', marcaNome: d.marcaNome ? String(d.marcaNome) : '', codigo: cod || '', lojaId: '' };
        marcaPendente = scanPendente.marcaNome || null;
        // se só uma loja tem essa marca, a loja já vem escolhida
        if (marcaPendente) {
            const candidatas = lojas.filter(l => (l.marcas || []).some(m => String(m.nome || '').trim().toLowerCase() === marcaPendente.toLowerCase()));
            if (candidatas.length === 1) scanPendente.lojaId = candidatas[0].id;
        }
        if (view.tab === 'p' || view.tab === 'v') desenhar();
        else ir('p', { preLoja: scanPendente.lojaId || '' });
        setTimeout(aplicarScanPendente, 0);
        if (d.nome) aviso(`Produto reconhecido: <b>${esc(d.nome)}</b>. Escolha entrada ou vencido e informe a validade.`, { soConfirmar: true });
        else aviso(`Código ${esc(cod)} ainda não tem nome. Preencha o produto e salve.`, { soConfirmar: true });
    }
    // Preenche o formulário que acabou de aparecer com o que a leitura reconheceu
    function aplicarScanPendente() {
        const s = scanPendente; if (!s) return;
        const pn = $('#pn'); if (pn && !pn.value.trim()) pn.value = s.nome;
        const ps = $('#psetor'); if (ps && s.setor) ps.value = s.setor;
        const pc = $('#pcod'); if (pc && s.codigo) pc.value = s.codigo;
        const pl = $('#pl');
        if (pl && s.lojaId && !pl.value) { pl.value = s.lojaId; if (typeof refreshCampoMarca === 'function') refreshCampoMarca(s.lojaId, ''); }
        aplicarMarcaPendente();
    }
    // Lê o que está digitado no formulário atual (para trocar entre entrada e vencido sem perder nada)
    function capturarFormCadastro() {
        const pn = $('#pn'), ps = $('#psetor'), pc = $('#pcod'), pl = $('#pl'), pm = $('#pm');
        const marcaTxt = pm && pm.selectedIndex > 0 ? pm.options[pm.selectedIndex].textContent.trim() : (marcaPendente || '');
        return { nome: pn ? pn.value.trim() : (scanPendente ? scanPendente.nome : ''), setor: ps ? ps.value : (scanPendente ? scanPendente.setor : ''), codigo: pc ? pc.value.trim() : (scanPendente ? scanPendente.codigo : ''), marcaNome: marcaTxt, lojaId: pl ? pl.value : '' };
    }
    // Ícones no topo: cadastrar entrada e cadastrar vencido
    function barraCadastro(tab) {
        const btn = (t, icone, rotulo, on, off) => `<button type="button" data-act="cadTipo" data-tipo="${t}" class="flex-1 py-3 rounded-2xl border ${tab === t ? on : off} flex flex-col items-center gap-1 text-[10px] font-black uppercase"><i data-lucide="${icone}" class="w-5 h-5"></i>${rotulo}</button>`;
        return `<div class="flex gap-2 mb-5">${btn('p', 'package-plus', 'Cadastrar entrada', 'bg-amber-500 border-amber-500 text-gray-950', 'border-gray-700 text-gray-400')}${btn('v', 'package-x', 'Cadastrar vencido', 'bg-red-600 border-red-600 text-white', 'border-gray-700 text-gray-400')}</div>`;
    }
    // Quem chega primeiro define o nome do código (setor e marca vêm junto)
    async function registrarNomeCodigo(cod, dados) {
        const ref = doc(db, 'codigos', cod);
        try {
            await runTransaction(db, async (t) => {
                const snap = await t.get(ref);
                if (snap.exists() && snap.data().nome) {
                    // nome já definido: só completa a marca, se ainda estiver vazia
                    if (!snap.data().marcaNome && dados.marcaNome) t.update(ref, { marcaNome: dados.marcaNome });
                    return;
                }
                if (snap.exists()) {
                    t.update(ref, { nome: dados.nome, setor: dados.setor || null, marcaNome: dados.marcaNome || null, definidoPor: uid, definidoEm: serverTimestamp() });
                } else {
                    t.set(ref, { codigo: cod, nome: dados.nome, setor: dados.setor || null, marcaNome: dados.marcaNome || null, criadoPor: uid, criadoEm: serverTimestamp(), definidoPor: uid, definidoEm: serverTimestamp() });
                }
            });
        } catch (e) {
            // sem internet a transação não roda: grava direto (o Firestore envia quando a conexão voltar)
            console.warn('registro do código sem transação (offline):', e);
            try {
                const s = await getDoc(ref);
                if (!s.exists() || !s.data().nome) {
                    await setDoc(ref, { codigo: cod, nome: dados.nome, setor: dados.setor || null, marcaNome: dados.marcaNome || null, criadoPor: uid, criadoEm: serverTimestamp(), definidoPor: uid, definidoEm: serverTimestamp() }, { merge: true });
                } else if (!s.data().marcaNome && dados.marcaNome) {
                    await setDoc(ref, { marcaNome: dados.marcaNome }, { merge: true });
                }
            } catch (e2) { console.error('registro do código falhou:', e2); }
        }
    }

    /* ---- termos, privacidade e reembolso ---- */
    const VERSAO_TERMOS = '2026-11-08';
    const CONTATO_LEGAL = 'melobortolato.renan@gmail.com';
    const RESPONSAVEL_LEGAL = 'Renan Melo Bortolato';
    const EMPRESA_LEGAL = 'Melo Staff';
    const CNPJ_LEGAL = '47.128.136/0001-45';
    const h3 = (t) => `<h3 class="text-white font-black uppercase text-[11px] mt-5 mb-1">${t}</h3>`;
    const LEGAL = {
        termos: { titulo: 'Termos de uso', html: `
            <p class="text-gray-500 text-[10px] uppercase font-bold">Versão de 08/11/2026</p>
            ${h3('1. Quem somos')}<p>O <b>Promotor Ajudante</b> (“app”) é um aplicativo para organizar produtos e datas de validade em lojas. Ele é mantido por ${RESPONSAVEL_LEGAL}, da empresa <b>${EMPRESA_LEGAL}</b> (CNPJ ${CNPJ_LEGAL}), de Florianópolis/SC (“responsável”). Contato: ${CONTATO_LEGAL}.</p>
            ${h3('2. O que o app faz')}<p>Permite cadastrar lojas, marcas e produtos com data de vencimento e receber avisos antes do vencimento. É uma ferramenta de apoio: conferir os produtos nas lojas continua sendo responsabilidade do usuário.</p>
            ${h3('3. Conta')}<p>Você pode criar a conta com e-mail e senha ou com sua conta Google. Informe dados verdadeiros, mantenha sua senha em segurança e use o app apenas se tiver 18 anos ou mais. Você é responsável pelo que acontece na sua conta.</p>
            ${h3('4. Acesso pago')}<p>O acesso custa <b>R$ 50,00 por 365 dias</b>, em pagamento único feito pelo Mercado Pago (Pix, cartão ou boleto). <b>Não há renovação automática nem cobrança recorrente</b>: quando o período acaba, o acesso fica pausado até uma nova contratação. O acesso é liberado após a confirmação do pagamento (Pix e cartão, em geral na hora; boleto, em 1 a 3 dias úteis). O responsável pode oferecer condições promocionais ou gratuitas a alguns usuários.</p>
            ${h3('5. Uso correto')}<p>Os dados que você cadastra são seus. Use o app para fins lícitos e não tente burlar a cobrança, acessar dados de outras pessoas ou sobrecarregar o serviço.</p>
            ${h3('6. Avisos e disponibilidade')}<p>As notificações dependem do seu aparelho, do navegador, das permissões e da internet, e podem atrasar ou falhar. O app é oferecido “como está”, sem garantia de funcionamento ininterrupto. O responsável não responde por perdas de produtos, prejuízos por vencimentos não avisados ou decisões tomadas com base no app, salvo nos casos exigidos por lei. Nada aqui afasta os direitos do consumidor previstos em lei.</p>
            ${h3('7. Suspensão')}<p>O acesso pode ser suspenso em caso de uso indevido, fraude ou estorno de pagamento.</p>
            ${h3('8. Mudanças')}<p>Estes termos podem mudar, e as mudanças serão avisadas no app. Mudanças de preço valem para novas contratações, e não para o período já pago.</p>
            ${h3('9. Lei aplicável')}<p>Valem as leis do Brasil. Em caso de conflito, o foro é o do domicílio do consumidor.</p>` },
        privacidade: { titulo: 'Política de privacidade', html: `
            <p class="text-gray-500 text-[10px] uppercase font-bold">Versão de 08/11/2026 · Lei Geral de Proteção de Dados (LGPD)</p>
            ${h3('1. Dados que coletamos')}<p><b>Conta:</b> nome, e-mail e forma de login (a senha é tratada pelo Firebase Authentication, e o app não tem acesso a ela).<br><b>Dados que você cadastra:</b> lojas, marcas, produtos e validades, além de preferências como os dias de aviso.<br><b>Notificações:</b> identificador do aparelho (token) e tipo de navegador.<br><b>Pagamento:</b> situação, valor, data e identificador do pagamento. Dados de cartão e de Pix são tratados direto pelo Mercado Pago e não passam pelo app.<br><b>Localização (opcional):</b> quando você autoriza, usamos o endereço aproximado apenas para escrever o local na foto PDV. Não guardamos sua localização nos nossos servidores.<br><b>Suporte (CAP):</b> nome, e-mail, telefone (se informado), versão do app e a mensagem enviada.</p>
            ${h3('2. Para que usamos')}<p>Para fazer o app funcionar, enviar os avisos de vencimento, liberar o acesso após o pagamento, dar suporte, manter a segurança e prevenir fraudes, e cumprir obrigações legais.</p>
            ${h3('3. Bases legais')}<p>Execução do contrato, cumprimento de obrigação legal, legítimo interesse (segurança) e consentimento (notificações, que você pode desativar quando quiser).</p>
            ${h3('4. Com quem compartilhamos')}<p>Usamos estes serviços para operar o app: <b>Google Firebase</b> (login, banco de dados e notificações), <b>Vercel</b> (hospedagem), <b>Mercado Pago</b> (pagamentos) e <b>Web3Forms</b> (envio das mensagens de suporte). Não vendemos seus dados. Alguns desses serviços ficam em servidores fora do Brasil.</p>
            ${h3('5. Por quanto tempo guardamos')}<p>Enquanto a sua conta existir. Dados de pagamento podem ser guardados pelo prazo exigido por lei. Ao excluir a conta, apagamos os dados, exceto os que a lei mande guardar.</p>
            ${h3('6. Seus direitos')}<p>Você pode pedir confirmação de que tratamos seus dados, acesso, correção, anonimização, bloqueio ou eliminação, portabilidade, informações sobre compartilhamento e a revogação do consentimento. Peça pelo CAP (no app) ou pelo e-mail ${CONTATO_LEGAL}.</p>
            ${h3('7. Segurança')}<p>Usamos recursos de segurança do Google e da Vercel, como conexão criptografada e regras de acesso em que cada usuário só acessa os próprios dados. Nenhum sistema é 100% seguro, mas trabalhamos para proteger você.</p>
            ${h3('8. Contato')}<p>Responsável pelo tratamento de dados (controlador): <b>${EMPRESA_LEGAL}</b>, CNPJ ${CNPJ_LEGAL}, representada por ${RESPONSAVEL_LEGAL}. E-mail: ${CONTATO_LEGAL}.</p>
            ${h3('9. Mudanças')}<p>Esta política pode mudar, e avisaremos no app.</p>` },
        reembolso: { titulo: 'Política de reembolso', html: `
            <p class="text-gray-500 text-[10px] uppercase font-bold">Versão de 08/11/2026</p>
            ${h3('1. Desistência em 7 dias')}<p>Como a contratação é feita pela internet, você pode desistir em até <b>7 dias corridos</b> a partir do pagamento, sem precisar justificar, e receber o valor <b>integral</b> de volta (Código de Defesa do Consumidor, art. 49).</p>
            ${h3('2. Como pedir')}<p>Envie uma mensagem pelo CAP (no app) ou para ${CONTATO_LEGAL}, informando o e-mail da sua conta.</p>
            ${h3('3. Como o valor volta')}<p>O reembolso é feito pelo mesmo meio de pagamento, por meio do Mercado Pago. O prazo para o valor aparecer depende do meio usado (Pix, cartão ou boleto) e do banco.</p>
            ${h3('4. Depois dos 7 dias')}<p>Não há devolução proporcional do período já contratado, salvo falha grave do app que impeça o uso e não seja resolvida em prazo razoável, ou outro caso previsto em lei.</p>
            ${h3('5. Cobrança em duplicidade')}<p>Se você for cobrado mais de uma vez pelo mesmo período, devolvemos o valor cobrado a mais.</p>
            ${h3('6. O que acontece com o acesso')}<p>Quando um reembolso é feito, o acesso daquela contratação é encerrado.</p>
            ${h3('7. Cancelamento')}<p>Não há cobrança recorrente, então não é preciso cancelar nada. Para não renovar, basta não pagar de novo ao fim dos 365 dias.</p>` },
    };
    function abrirLegal(aba) {
        const a = LEGAL[aba] ? aba : 'termos';
        $('#legal-titulo').textContent = LEGAL[a].titulo;
        $('#legal-corpo').innerHTML = LEGAL[a].html;
        $('#legal-corpo').scrollTop = 0;
        document.querySelectorAll('#legal .legal-aba').forEach(b => {
            const on = b.dataset.aba === a;
            b.classList.toggle('border-amber-500', on); b.classList.toggle('text-amber-500', on);
            b.classList.toggle('border-gray-700', !on); b.classList.toggle('text-gray-400', !on);
        });
        const box = $('#legal'); box.classList.remove('hidden'); box.classList.add('flex');
    }
    // Exclusão de conta: apaga lojas, produtos, vencidos e tokens de notificação, depois o cadastro e o login.
    // O registro de pagamento fica guardado pelo prazo exigido por lei.
    function confirmarExclusao() {
        aviso('Isto apaga suas lojas, produtos, vencidos e sua conta. Não é possível desfazer. Os registros de pagamento são mantidos pelo prazo exigido por lei. Para confirmar, digite EXCLUIR.', {
            titulo: 'EXCLUIR CONTA', okTexto: 'Excluir', input: '',
            ok: (v) => { if (v !== 'EXCLUIR') return aviso('Digite EXCLUIR, em maiúsculas, para confirmar.', { soConfirmar: true }); excluirContaAgora(); } });
    }
    async function excluirContaAgora() {
        const user = auth.currentUser;
        if (!user) return;
        try {
            for (const col of ['lojas', 'produtos', 'vencidos', 'tokens']) {
                const snap = await getDocs(collection(db, 'users', user.uid, col));
                for (const d of snap.docs) await deleteDoc(d.ref);
            }
            await deleteDoc(doc(db, 'users', user.uid));
            await deleteUser(user);
            aviso('Sua conta foi excluída.', { soConfirmar: true });
        } catch (e) {
            console.error('excluir conta:', e);
            if (e && e.code === 'auth/requires-recent-login') {
                aviso('Por segurança, saia da conta, entre de novo e tente excluir novamente.', { soConfirmar: true });
            } else erroDb(e);
        }
    }
    // Exporta lojas, produtos e vencidos em planilha (abre no Excel)
    function exportarCsv() {
        const cel = (v) => { const t = String(v ?? '').replace(/"/g, '""'); return /[";\r\n]/.test(t) ? `"${t}"` : t; };
        const nomeLoja = (id) => (lojas.find(l => l.id === id) || {}).nome || '';
        const nomeMarca = (lojaId, marcaId) => { const l = lojas.find(x => x.id === lojaId); const m = l && (l.marcas || []).find(x => x.id === marcaId); return m ? m.nome : 'Sem marca'; };
        const linhas = [['PRODUTOS'], ['Loja', 'Marca', 'Setor', 'Produto', 'Validade', 'Quantidade', 'Codigo de barras']];
        produtos.forEach(p => linhas.push([nomeLoja(p.lojaId), nomeMarca(p.lojaId, p.marcaId), p.setor || '', p.nome, p.data, p.semQtd ? '' : p.qtd, p.codigo || '']));
        linhas.push([], ['VENCIDOS'], ['Loja', 'Marca', 'Produto', 'Vencimento', 'Retirada', 'Quantidade', 'Motivo']);
        vencidos.forEach(v => linhas.push([nomeLoja(v.lojaId), nomeMarca(v.lojaId, v.marcaId), v.nome, v.dataVenc, v.dataRetirada, v.qtd, v.motivo || '']));
        const csv = '\ufeff' + linhas.map(l => l.map(cel).join(';')).join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Promotor Ajudante - dados.csv';
        document.body.appendChild(a); a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    }
    // Resumo da semana na tela inicial: produtos que vencem em até 7 dias, por loja
    function htmlResumoSemana() {
        const proximos = produtos.filter(p => { const d = diasAte(p.data); return d >= 0 && d <= 7; });
        if (!proximos.length) return '';
        const porLoja = {};
        proximos.forEach(p => { porLoja[p.lojaId] = (porLoja[p.lojaId] || 0) + 1; });
        const linhas = Object.entries(porLoja).map(([id, n]) => {
            const nome = (lojas.find(l => l.id === id) || {}).nome || 'Loja';
            return `<div class="flex justify-between text-[11px] py-0.5"><span class="text-gray-300 font-bold uppercase">${esc(nome)}</span><span class="text-amber-500 font-black">${n} ${n === 1 ? 'produto' : 'produtos'}</span></div>`;
        }).join('');
        return `<div class="card-app p-4 mb-4"><div class="text-[9px] text-gray-500 font-black uppercase mb-2">Vence nos próximos 7 dias</div>${linhas}</div>`;
    }
    let ultimaListaVenc = [];
    function htmlResumoVencidos(lista) {
        if (!lista.length) return '';
        const nomeLoja = (id) => (lojas.find(l => l.id === id) || {}).nome || 'Loja';
        const total = lista.reduce((t, v) => t + (Number(v.qtd) || 0), 0);
        const somar = (chave) => { const o = {}; lista.forEach(v => { const k = chave(v); o[k] = (o[k] || 0) + (Number(v.qtd) || 0); }); return o; };
        const tabela = (titulo, obj) => `<table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:10px">
            <thead><tr><th style="text-align:left;padding:6px 12px;border-bottom:2px solid #f59e0b">${titulo}</th><th style="text-align:center;padding:6px 12px;border-bottom:2px solid #f59e0b">Unidades</th></tr></thead>
            <tbody>${Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${esc(k)}</td><td style="padding:6px 12px;text-align:center;border-bottom:1px solid #e5e7eb;font-weight:900">${n}</td></tr>`).join('')}</tbody></table>`;
        return `<div style="margin-top:26px"><p style="font-weight:900;font-size:12px;color:#f59e0b;text-transform:uppercase;margin:0">Resumo · ${total} unidades retiradas</p>`
            + tabela('Loja', somar(v => nomeLoja(v.lojaId)))
            + tabela('Motivo', somar(v => (v.motivo || '').trim() || 'Sem motivo informado'))
            + '</div>';
    }
    function abrirImpressaoVenc(titulo, html) { return abrirImpressao(titulo, html + htmlResumoVencidos(ultimaListaVenc)); }
    // ---- bloco de notas: fica salvo neste aparelho por 12 horas ----
    const NOTAS_MS = 12 * 60 * 60 * 1000;
    const chaveNotas = () => 'notas_' + (uid || 'local');
    function notasLer() {
        try {
            const r = JSON.parse(localStorage.getItem(chaveNotas()) || 'null');
            if (!r || Date.now() - r.salvoEm > NOTAS_MS) { localStorage.removeItem(chaveNotas()); return ''; }
            return r.texto || '';
        } catch (e) { return ''; }
    }
    function notasAbrir() {
        notasFechar();
        const ov = document.createElement('div');
        ov.id = 'notas-ov';
        ov.className = 'fixed inset-0 z-[95] bg-black overflow-y-auto p-4';
        ov.innerHTML = `<div class="w-full max-w-md mx-auto pb-10">
            <h1 class="font-black italic uppercase text-amber-500 text-2xl leading-tight mb-2">Anote suas idéias</h1>
            <p class="text-[12px] text-gray-300 mb-4">As informações ficam salvas por <b class="text-red-500">12 horas</b>.</p>
            <textarea id="notas-txt" class="w-full min-h-[55vh] rounded-2xl bg-[#111827] border border-gray-800 text-white p-4 text-[14px] outline-none"></textarea>
            <button data-act="notasSalvar" class="btn-amarelo mt-4">SALVAR</button>
            <p class="text-[12px] text-gray-300 mt-4 text-center">As informações ficam salvas por <b class="text-red-500">12 horas</b>.</p>
            <button data-act="notasFechar" class="w-full py-3 mt-2 text-[10px] font-black uppercase text-gray-500">Voltar</button>
        </div>`;
        document.body.appendChild(ov);
        document.getElementById('notas-txt').value = notasLer();
    }
    function notasFechar() { const ov = document.getElementById('notas-ov'); if (ov) ov.remove(); }
    function notasSalvar() {
        const t = document.getElementById('notas-txt');
        localStorage.setItem(chaveNotas(), JSON.stringify({ texto: t.value, salvoEm: Date.now() }));
        toast('Anotação salva. Fica guardada por 12 horas.');
    }
    // ---- sem visita hoje: motivo obrigatório ----
    function semVisitaAbrir(lojaId) {
        semVisitaEscolhaFechar();
        const l = lojas.find(x => x.id === lojaId); if (!l) return;
        const ov = document.createElement('div');
        ov.id = 'sv-ov';
        ov.dataset.id = lojaId;
        ov.className = 'fixed inset-0 z-[95] bg-black/90 flex items-center justify-center p-4';
        ov.innerHTML = `<div class="w-full max-w-sm card-app p-5">
            <div class="text-[9px] text-gray-500 font-black uppercase mb-1">Sem visita hoje</div>
            <div class="text-white font-black italic uppercase text-lg mb-3">${esc(l.nome)}</div>
            <label class="text-[11px] text-gray-300 font-bold">Motivo (obrigatório)</label>
            <textarea id="sv-motivo" class="w-full min-h-[120px] mt-2 rounded-xl bg-[#111827] border border-gray-800 text-white p-3 text-[13px] outline-none" placeholder="Ex.: loja fechada, reposição não feita"></textarea>
            <button data-act="semVisitaSalvar" class="btn-amarelo mt-4">SALVAR</button>
            <button data-act="svFechar" class="w-full py-3 mt-2 text-[10px] font-black uppercase text-gray-500">Cancelar</button>
        </div>`;
        document.body.appendChild(ov);
        setTimeout(() => document.getElementById('sv-motivo').focus(), 50);
    }
    function svFechar() { const ov = document.getElementById('sv-ov'); if (ov) ov.remove(); }
    async function semVisitaSalvar() {
        const ov = document.getElementById('sv-ov'); if (!ov) return;
        const motivo = document.getElementById('sv-motivo').value.trim();
        if (!motivo) { aviso('Informe o motivo para continuar.', { soConfirmar: true }); return; }
        const l = lojas.find(x => x.id === ov.dataset.id);
        if (!l || !uid) return;
        const ag = new Date();
        if (temAprovador()) {
            await pedirAprovacao('sem_visita', l.id, l.nome, { motivo, data: isoLocal(ag), hora: `${String(ag.getHours()).padStart(2, '0')}:${String(ag.getMinutes()).padStart(2, '0')}` });
            svFechar();
            return;
        }
        try {
            await addDoc(collection(db, 'users', uid, 'visitas'), {
                lojaId: l.id, lojaNome: l.nome, data: isoLocal(ag),
                hora: `${String(ag.getHours()).padStart(2, '0')}:${String(ag.getMinutes()).padStart(2, '0')}`,
                semVisita: true, motivo, criadoEm: serverTimestamp(),
            });
            svFechar();
            toast('Sem visita registrada: ' + esc(l.nome));
        } catch (e) { erroDb(e); }
    }
    // ---- redefinir senha: e-mail, código, nova senha ----
    let rsEtapa = 1, rsEmail = '';
    function redefinirAbrir() { rsEtapa = 1; rsEmail = ''; rsDesenhar(); }
    function rsFechar() { const ov = document.getElementById('rs-ov'); if (ov) ov.remove(); }
    function rsDesenhar(msg) {
        let ov = document.getElementById('rs-ov');
        if (!ov) { ov = document.createElement('div'); ov.id = 'rs-ov'; ov.className = 'fixed inset-0 z-[96] bg-black/90 flex items-center justify-center p-4'; document.body.appendChild(ov); }
        const erro = msg ? `<p class="text-red-400 text-[11px] font-bold mt-3">${esc(msg)}</p>` : '';
        const campo = (id, rotulo, tipo = 'text', extra = '') => `<label class="block text-[10px] text-gray-400 font-bold uppercase mt-3">${rotulo}</label><input id="${id}" type="${tipo}" ${extra} class="w-full mt-1 rounded-xl bg-[#111827] border border-gray-800 text-white p-3 text-[14px] outline-none">`;
        let corpo = '';
        if (rsEtapa === 1) corpo = `<h2 class="text-white font-black italic uppercase text-lg">Redefinir senha</h2><p class="text-[12px] text-gray-400 mt-2">Digite o e-mail da sua conta. Vamos enviar um código.</p>${campo('rs-email', 'E-mail cadastrado', 'email', 'autocomplete="email"')}${erro}<button data-act="rsEnviar" class="btn-amarelo mt-4">ENVIAR CÓDIGO</button>`;
        else if (rsEtapa === 2) corpo = `<h2 class="text-white font-black italic uppercase text-lg">Digite o código</h2><p class="text-[12px] text-gray-400 mt-2">Enviamos um código de 6 letras e números para <b class="text-white">${esc(rsEmail)}</b>. Ele vale por 15 minutos.</p>${campo('rs-codigo', 'Código', 'text', 'maxlength="6" autocapitalize="characters" style="text-transform:uppercase"')}${erro}<button data-act="rsConfirmar" class="btn-amarelo mt-4">CONFIRMAR CÓDIGO</button><button data-act="rsEnviar" class="w-full py-2 mt-2 text-[10px] font-bold uppercase text-gray-500">Reenviar código</button>`;
        else corpo = `<h2 class="text-white font-black italic uppercase text-lg">Nova senha</h2>${campo('rs-senha', 'Nova senha (mínimo 6)', 'password')}${campo('rs-senha2', 'Confirmar nova senha', 'password')}${erro}<button data-act="rsSalvar" class="btn-amarelo mt-4">SALVAR NOVA SENHA</button>`;
        ov.innerHTML = `<div class="w-full max-w-sm card-app p-5">${corpo}<button data-act="rsFechar" class="w-full py-3 mt-2 text-[10px] font-black uppercase text-gray-500">Cancelar</button></div>`;
        setTimeout(() => { const f = ov.querySelector('input'); if (f) f.focus(); }, 50);
    }
    async function rsChamar(corpo) {
        const r = await fetch(API_BASE + '/api/redefinir-senha', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
        const j = await r.json().catch(() => ({}));
        return { ok: r.ok, erro: j.erro || '' };
    }
    const RS_MSG = { codigo: 'Código incorreto. Confira e tente de novo.', expirado: 'Este código expirou. Peça um novo.', tentativas: 'Muitas tentativas. Peça um novo código.', espere: 'Aguarde 1 minuto para pedir outro código.', 'senha-curta': 'A nova senha precisa ter pelo menos 6 caracteres.', falha: 'Não consegui agora. Verifique a internet e tente de novo.', email: 'Digite um e-mail válido.' };
    async function rsEnviar() {
        const el = document.getElementById('rs-email');
        const e = (el ? el.value : rsEmail).trim().toLowerCase();
        if (!e.includes('@')) { rsDesenhar(RS_MSG.email); return; }
        rsEmail = e;
        const r = await rsChamar({ acao: 'enviar', email: e });
        if (!r.ok) { rsDesenhar(RS_MSG[r.erro] || RS_MSG.falha); return; }
        rsEtapa = 2; rsDesenhar('Código enviado. Confira sua caixa de entrada e o spam.');
    }
    async function rsConfirmar() {
        const cod = document.getElementById('rs-codigo').value.trim().toUpperCase();
        if (cod.length !== 6) { rsDesenhar('Digite os 6 caracteres do código.'); return; }
        rsCodigo = cod;
        const r = await rsChamar({ acao: 'confirmar', email: rsEmail, codigo: cod });
        if (!r.ok) { rsDesenhar(RS_MSG[r.erro] || RS_MSG.falha); return; }
        rsEtapa = 3; rsDesenhar();
    }
    let rsCodigo = '';
    async function rsSalvar() {
        const s1 = document.getElementById('rs-senha').value, s2 = document.getElementById('rs-senha2').value;
        if (s1.length < 6) { rsDesenhar(RS_MSG['senha-curta']); return; }
        if (s1 !== s2) { rsDesenhar('As senhas não são iguais.'); return; }
        const r = await rsChamar({ acao: 'salvar', email: rsEmail, codigo: rsCodigo, novaSenha: s1 });
        if (!r.ok) { rsEtapa = r.erro === 'codigo' || r.erro === 'expirado' ? 1 : rsEtapa; rsDesenhar(RS_MSG[r.erro] || RS_MSG.falha); return; }
        rsFechar();
        aviso('Senha redefinida. Use a nova senha na próxima vez que entrar.', { soConfirmar: true });
    }
    // ---- planos ----
    const PRECO_MENSAL = 50;
    const fimTesteISO = () => { if (!criadaEm) return null; const d = new Date(criadaEm); d.setDate(d.getDate() + 60); return isoLocal(d); };
    const dataDeTs = (ts) => (ts && typeof ts.toDate === 'function') ? ts.toDate() : (ts ? new Date(ts) : null);
    const planoPago = () => (perfilAcesso.plano === 'mensal' || perfilAcesso.plano === 'anual') && typeof perfilAcesso.acessoAte === 'string';
    function mesesDesde(d) {
        if (!d) return 1;
        const h = new Date();
        return Math.max(1, (h.getFullYear() - d.getFullYear()) * 12 + (h.getMonth() - d.getMonth()) + 1);
    }
    function htmlPlano() {
        if (contaAntiga || perfilAcesso.gratis === true) {
            return `<div class="card-app p-4 mb-4"><div class="text-[9px] text-gray-500 font-black uppercase mb-1">Planos</div><p class="text-[12px] text-gray-300">Acesso livre.</p></div>`;
        }
        if (planoPago()) {
            const mensal = perfilAcesso.plano === 'mensal';
            const inicio = dataDeTs(perfilAcesso.assinaturaInicioEm || perfilAcesso.liberadoEm);
            const meses = mesesDesde(inicio);
            const cancelada = mensal && perfilAcesso.assinatura && perfilAcesso.assinatura.status === 'cancelada';
            return `<div class="card-app p-4 mb-4">
                <div class="text-[9px] text-gray-500 font-black uppercase mb-2">Assinatura</div>
                <p class="text-[12px] text-gray-300 leading-relaxed">Plano <b class="text-white">${mensal ? 'mensal' : 'anual'}</b><br>Valor: <b class="text-white">${mensal ? 'R$ ' + PRECO_MENSAL + ',00 por mês' : 'R$ ' + PRECO_ANUAL + ',00 pago de uma vez'}</b><br>Assinado em: <b class="text-white">${inicio ? inicio.toLocaleDateString('pt-BR') : '-'}</b><br>Tempo de uso: <b class="text-white">${meses} ${meses === 1 ? 'mês' : 'meses'}</b><br>Acesso até: <b class="text-white">${dataBR(perfilAcesso.acessoAte)}</b></p>
                ${mensal && !cancelada ? `<button data-act="cancelarAssinatura" class="mt-3 w-full py-3 rounded-xl border border-red-900/50 text-[10px] font-black uppercase text-red-500">Cancelar assinatura</button>` : ''}
                ${cancelada ? `<p class="mt-3 text-[11px] text-gray-500">Assinatura cancelada. O acesso segue até a data acima.</p>` : ''}
                <div class="mt-4 border-t border-gray-800 pt-3"><div class="text-[9px] text-gray-500 font-black uppercase mb-2">Recibos</div><div id="recibos-lista" class="text-[12px] text-gray-400">Carregando...</div></div>
            </div>`;
        }
        const fim = fimTesteISO();
        const dias = fim ? diasAte(fim) : -1;
        const texto = dias >= 0
            ? `Teste grátis até <b class="text-white">${dataBR(fim)}</b> · <span class="text-amber-500 font-black">${dias} ${dias === 1 ? 'dia restante' : 'dias restantes'}</span>`
            : 'Seu teste grátis terminou. Escolha um plano para continuar.';
        return `<div class="card-app p-4 mb-4">
            <div class="text-[9px] text-gray-500 font-black uppercase mb-2">Planos</div>
            <p class="text-[12px] text-gray-300 mb-3">${texto}</p>
            <button data-act="verPlanos" class="w-full py-3 rounded-xl border border-amber-500 text-[10px] font-black uppercase text-amber-500">Ver planos</button>
        </div>`;
    }
    // Opções de plano (usadas no pop-up e na tela de bloqueio)
    function htmlOpcoesPlano() {
        return `
            <div class="card-app p-4 mb-3">
                <div class="text-[9px] text-gray-500 font-black uppercase mb-1">Plano mensal</div>
                <div class="text-3xl font-black text-white">R$ ${PRECO_MENSAL},00<span class="text-xs text-gray-500"> /mês</span></div>
                <p class="text-[11px] text-gray-400 mt-1">Cartão de crédito. A cobrança é automática todo mês.</p>
                <button data-act="pagarPlano" data-plano="mensal" class="btn-amarelo mt-3">ASSINAR MENSAL</button>
            </div>
            <div class="card-app p-4 mb-3">
                <div class="text-[9px] text-gray-500 font-black uppercase mb-1">Plano anual · 15% de desconto</div>
                <div class="text-3xl font-black text-white">R$ ${PRECO_ANUAL},00<span class="text-xs text-gray-500"> /ano</span></div>
                <p class="text-[11px] text-gray-400 mt-1">Pix ou débito. Pagamento único, com 365 dias de acesso.</p>
                <button data-act="pagarPlano" data-plano="anual" class="btn-amarelo mt-3">PAGAR ANUAL</button>
            </div>`;
    }
    function abrirPlanos() {
        fecharPlanos();
        const ov = document.createElement('div');
        ov.id = 'planos-ov';
        ov.className = 'fixed inset-0 z-[95] bg-black/90 flex items-center justify-center p-4 overflow-y-auto';
        ov.innerHTML = `<div class="w-full max-w-sm">
            <div class="text-[9px] text-gray-500 font-black uppercase mb-3 text-center">Escolha seu plano</div>
            ${htmlOpcoesPlano()}
            <button data-act="fecharPlanos" class="w-full py-3 text-[10px] font-black uppercase text-gray-500">Fechar</button>
        </div>`;
        document.body.appendChild(ov);
        (window.lucide && lucide.createIcons());
    }
    function fecharPlanos() { const ov = document.getElementById('planos-ov'); if (ov) ov.remove(); }

    // Aviso na tela inicial quando faltam 7 dias ou menos
    function htmlBannerPlano() {
        if (contaAntiga || perfilAcesso.gratis === true) return '';
        const ate = perfilAcesso.acessoAte;
        if (typeof ate !== 'string') return '';
        const dias = diasAte(ate);
        if (dias < 0 || dias > 7) return '';
        return `<button data-act="tab" data-id="c" class="w-full mb-4 p-3 rounded-2xl border border-amber-500/60 text-left text-[11px] font-black text-amber-500 uppercase">${dias === 0 ? 'Seu acesso vence hoje.' : 'Seu acesso vence em ' + dias + ' dias.'} Toque para renovar.</button>`;
    }
    // ---- voucher de acesso grátis (30 dias) ----
    function htmlVoucher() {
        const fim = perfilAcesso.acessoAte;
        const prazo = typeof fim === 'string' ? addDiasISO(fim, 45) : null;
        const txt = `Seus dados ficam guardados por 45 dias após o fim do acesso${prazo ? ' (até ' + dataBR(prazo) + ')' : ''}. Pague nesse prazo para não perder nada. Depois desse prazo, a conta e todos os dados são excluídos.`;
        return `<div class="card-app p-4 mb-3">
            <div class="text-[9px] text-gray-500 font-black uppercase mb-2">Tem um voucher?</div>
            <p class="text-[11px] text-amber-500 font-bold leading-snug mb-3">${txt}</p>
            <div class="flex gap-2"><input id="vc-codigo" class="input-custom flex-1" maxlength="30" placeholder="CÓDIGO" autocomplete="off" style="text-transform:uppercase"><button data-act="resgatarVoucher" class="px-4 rounded-xl border border-amber-500 text-[10px] font-black uppercase text-amber-500">Ativar</button></div>
            <p id="vc-status" class="text-[11px] font-bold mt-2" role="status"></p>
        </div>`;
    }
    async function resgatarVoucher() {
        const st = $('#vc-status');
        const cod = ($('#vc-codigo').value || '').trim().toUpperCase();
        const erro = (t) => { st.textContent = t; st.className = 'text-red-500 text-[11px] font-bold mt-2'; };
        if (!cod) return erro('Digite o código.');
        if (!navigator.onLine) return erro('Sem internet. Conecte-se e tente de novo.');
        st.textContent = 'Verificando...'; st.className = 'text-gray-400 text-[11px] font-bold mt-2';
        try {
            const token = await auth.currentUser.getIdToken();
            const r = await fetch(API_BASE + '/api/resgatar-voucher', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ codigo: cod }) });
            const j = await r.json().catch(() => ({}));
            if (r.ok && j.ok) { st.textContent = 'Voucher ativado! Acesso até ' + dataBR(j.acessoAte) + '.'; st.className = 'text-green-500 text-[11px] font-bold mt-2'; return; }
            const msgs = { 'codigo-invalido': 'Código inválido.', 'ja-usado': 'Este voucher já foi usado nesta conta.', 'ja-tem-acesso': 'Sua conta já tem acesso ativo.' };
            erro(msgs[j.erro] || 'Não foi possível ativar agora.');
        } catch (e) { console.error('voucher:', e); erro('Não foi possível ativar agora. Tente de novo.'); }
    }
    // ---- feedback após 30 dias de uso (9) ----
    function htmlFeedback() {
        if (!criadaEm || perfilAcesso.feedbackEm || (Date.now() - criadaEm.getTime()) < 30 * 86400000) return '';
        return `<div class="card-app p-4 mb-4"><div class="text-[9px] text-gray-500 font-black uppercase mb-2">Como está o Promotor Ajudante? (1 a 5)</div>
            <div class="flex justify-between gap-2">${[1, 2, 3, 4, 5].map(n => `<button data-act="enviarFeedback" data-nota="${n}" class="flex-1 h-10 rounded-xl border border-amber-500/50 text-amber-500 font-black">${n}</button>`).join('')}</div></div>`;
    }
    async function enviarFeedback(nota) {
        try {
            await addDoc(collection(db, 'feedback'), { uid, nota: Number(nota), criadoEm: serverTimestamp() });
            await setDoc(doc(db, 'users', uid), { feedbackEm: serverTimestamp() }, { merge: true });
            aviso('Obrigado pela sua avaliação!', { soConfirmar: true });
        } catch (e) { erroDb(e); }
    }
    // ---- dia de visita e lojas de hoje (6) ----
    function htmlLojasHoje() {
        const hoje = new Date().getDay();
        const lista = lojas.filter(l => diasDaLoja(l).includes(hoje));
        if (!lista.length) return '';
        return `<div class="card-app p-4 mb-4"><div class="text-[9px] text-gray-500 font-black uppercase mb-2">Lojas de hoje · ${DIAS_SEMANA[hoje]}</div>${lista.map(l => `<button data-act="verLoja" data-id="${esc(l.id)}" class="w-full text-left text-[12px] font-black text-white uppercase py-1">${esc(l.nome)}</button>`).join('')}</div>`;
    }
    // ---- alto contraste (8) ----
    function aplicarContraste() { document.documentElement.classList.toggle('alto-contraste', localStorage.getItem('altoContraste') === '1'); }
    // ---- busca global (7) ----
    function buscaAbrir() { const b = $('#busca'); b.classList.remove('hidden'); b.classList.add('flex'); $('#busca-q').value = ''; buscaResultados(); setTimeout(() => $('#busca-q').focus(), 50); }
    function buscaFechar() { const b = $('#busca'); b.classList.add('hidden'); b.classList.remove('flex'); }
    // aviso verde que some sozinho (não bloqueia a tela)
    function toast(msg) {
        const t = document.createElement('div');
        t.innerHTML = msg;
        t.className = 'fixed left-4 right-4 top-4 mx-auto max-w-sm z-[120] rounded-2xl px-4 py-3 text-[12px] font-bold text-gray-950 shadow-lg';
        t.style.background = '#22c55e';
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3200);
    }
    // distância de edição (para aceitar pequenos erros de digitação na busca)
    function buscaResultados() {
        const q = ($('#busca-q').value || '').trim().toLowerCase();
        if (q.length < 2) { $('#busca-res').innerHTML = '<p class="text-gray-500 text-[11px]">Digite pelo menos 2 letras.</p>'; buscaHits = []; return; }
        const hits = [];
        lojas.forEach(l => { if ((l.nome || '').toLowerCase().includes(q)) hits.push({ t: 'Loja', n: l.nome, lojaId: l.id, marcaId: null }); });
        produtos.forEach(p => { if ((p.nome || '').toLowerCase().includes(q) || (p.codigo && p.codigo === q)) hits.push({ t: 'Produto', n: p.nome, sub: nomeLoja(p.lojaId), lojaId: p.lojaId, marcaId: p.marcaId || null }); });
        if (!hits.length && q.length >= 3) {
            const tol = q.length > 5 ? 2 : 1;
            const norm = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            produtos.forEach(p => {
                const palavras = norm(p.nome).split(/\s+/);
                if (palavras.some(w => distancia(w.slice(0, norm(q).length), norm(q)) <= tol)) hits.push({ t: 'Produto', n: p.nome, sub: nomeLoja(p.lojaId), lojaId: p.lojaId, marcaId: p.marcaId });
            });
        }
        buscaHits = hits.slice(0, 40);
        $('#busca-res').innerHTML = buscaHits.map((h, i) => `<button data-act="buscaIr" data-i="${i}" class="w-full text-left p-3 rounded-xl border border-gray-800 mb-2"><div class="text-[9px] text-gray-500 font-black uppercase">${h.t}${h.sub ? ' · ' + esc(h.sub) : ''}</div><div class="text-sm font-bold text-white">${esc(h.n)}</div></button>`).join('') || '<p class="text-gray-500 text-[11px]">Nada encontrado.</p>';
    }
    function buscaIr(i) {
        const h = buscaHits[i]; if (!h) return;
        buscaFechar();
        view.tab = 'l'; view.lojaId = h.lojaId; view.marcaId = h.marcaId;
        desenhar(true);
    }
    function toggleContraste() {
        const ligado = localStorage.getItem('altoContraste') === '1';
        localStorage.setItem('altoContraste', ligado ? '0' : '1');
        aplicarContraste(); desenhar(false);
    }
    // Marca ou desmarca um dia de visita da loja
    function diaLoja(d) {
        const l = lojas.find(x => x.id === d.loja); if (!l) return;
        const dia = Number(d.dia), atual = diasDaLoja(l);
        const novo = atual.includes(dia) ? atual.filter(x => x !== dia) : [...atual, dia].sort((a, b) => a - b);
        if (temAprovador()) { pedirAprovacao('dias', l.id, l.nome, { dias: novo }).catch(erroDb); return; }
        updateDoc(doc(colLojas(), l.id), { diasVisita: novo, diaVisita: null }).catch(erroDb);
    }
    // Tabela de códigos cadastrados: produto, marca, imagem do código e número (ordem alfabética)
    function codigosAbrir() {
        const b = $('#codigos'); b.classList.remove('hidden'); b.classList.add('flex'); b.style.display = 'flex';
        $('#codigos-tab').innerHTML = htmlCodigos();
        (window.lucide && lucide.createIcons());
    }
    function codigosFechar() { const b = $('#codigos'); b.classList.add('hidden'); b.classList.remove('flex'); b.style.display = 'none'; }
    // Desenha o código de barras EAN-13 (ou UPC-A/EAN-8 convertidos) a partir do número, para itens sem foto
    function gerarBarrasSvg(codigo) {
        let c = String(codigo || '').replace(/\D/g, '');
        if (c.length === 12) c = '0' + c;
        if (c.length !== 13) return null;
        const d = c.split('').map(Number);
        const L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
        const G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];
        const R = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'];
        const PAR = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];
        let bits = '101';
        const p = PAR[d[0]];
        for (let i = 1; i <= 6; i++) bits += (p[i - 1] === 'L' ? L : G)[d[i]];
        bits += '01010';
        for (let i = 7; i <= 12; i++) bits += R[d[i]];
        bits += '101';
        let rects = '';
        for (let i = 0; i < bits.length; i++) {
            if (bits[i] !== '1') continue;
            const guarda = i < 3 || (i >= 45 && i < 50) || i >= 92;
            rects += `<rect x="${i}" y="0" width="1" height="${guarda ? 84 : 78}"/>`;
        }
        return `<svg viewBox="-4 -4 103 104" xmlns="http://www.w3.org/2000/svg" class="w-full"><g fill="#000">${rects}</g><text x="51" y="95" text-anchor="middle" font-size="9" font-family="monospace" fill="#000">${c}</text></svg>`;
    }
    function htmlCodigos() {
        // um código por linha (sem repetir)
        const porCodigo = new Map();
        produtos.filter(p => p.codigo).forEach(p => {
            const atual = porCodigo.get(p.codigo);
            if (!atual || (p.fotoCodigo && !atual.fotoCodigo)) porCodigo.set(p.codigo, p);
        });
        const marcaDe = (p) => { const l = lojas.find(x => x.id === p.lojaId); const m = l && (l.marcas || []).find(x => x.id === p.marcaId); return m ? String(m.nome).trim() : '-'; };
        // 'PAO NINO', 'Pão Nino' e 'pao nino' são a mesma marca (sem acento e sem diferença de maiúscula)
        const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
        // ordem: marca (alfabética) e, dentro da marca, nome (alfabética)
        const lista = [...porCodigo.values()].sort((a, b) => norm(marcaDe(a)).localeCompare(norm(marcaDe(b)), 'pt-BR') || norm(a.nome).localeCompare(norm(b.nome), 'pt-BR'));
        if (!lista.length) return '<p class="text-gray-500 text-[11px]">Nenhum código cadastrado ainda.</p>';
        let html = '<table class="w-full text-[11px]"><thead><tr class="text-left text-gray-500 uppercase text-[9px]"><th class="py-2 pr-2">Produto</th><th class="pr-2">Marca</th><th class="text-center pr-2">Imagem</th><th>Código</th></tr></thead><tbody>';
        let marcaAtual = null;
        for (const p of lista) {
            const m = marcaDe(p), chave = norm(m);
            if (chave !== marcaAtual) {
                marcaAtual = chave;
                html += `<tr><td colspan="4" class="pt-5 pb-2 text-amber-500 font-black uppercase tracking-wider text-[11px] border-b border-amber-500/40">${esc(m)}</td></tr>`;
            }
            html += `<tr class="border-t border-gray-800"><td class="py-2 pr-2 text-white font-bold">${esc(p.nome)}</td><td class="pr-2 text-gray-400">${esc(m)}</td><td class="text-center pr-2"><button data-act="verFotoCodigo" data-id="${esc(p.id)}" class="text-amber-500" aria-label="Ver imagem do código"><i data-lucide="image" class="w-4 h-4"></i></button></td><td class="text-gray-400">${esc(p.codigo)}</td></tr>`;
        }
        return html + '</tbody></table>';
    }
    function verFotoCodigo(d) {
        const p = produtos.find(x => x.id === d.id);
        if (!p || !p.codigo) return;
        // mesmo desenho para todos os itens: código de barras gerado a partir do número
        const corpo = `<div class="bg-white rounded-xl p-3">${gerarBarrasSvg(p.codigo) || `<p class="text-black text-center">${esc(p.codigo)}</p>`}</div>`;
        aviso(corpo, { titulo: String(p.codigo), soConfirmar: true });
    }
    // ---- avaliação do app (fica nas Configurações e pode ser alterada a qualquer momento) ----
    function htmlAvaliacao() {
        const salva = perfilAcesso.avaliacao && perfilAcesso.avaliacao.nota;
        const marcada = avalPendente || salva;
        const botoes = [1, 2, 3, 4, 5].map(n => `<button data-act="avaliarApp" data-nota="${n}" class="flex-1 h-10 rounded-xl border font-black ${marcada === n ? 'bg-amber-500 border-amber-500 text-gray-950' : 'border-amber-500/50 text-amber-500'}">${n}</button>`).join('');
        const pergunta = avalPendente !== null && avalPendente <= 2 ? 'O que podemos melhorar?' : 'O que falta para ser 5 estrelas?';
        const caixa = avalPendente !== null ? `<div class="mt-3"><p class="text-[11px] text-gray-400 mb-2">${pergunta}</p>
            <textarea id="aval-texto" rows="3" maxlength="500" class="input-custom w-full"></textarea>
            <button data-act="avaliarEnviar" class="btn-amarelo mt-2">Enviar avaliação</button></div>` : '';
        return `<div class="card-app p-4 mb-3"><div class="text-[9px] text-gray-500 font-black uppercase mb-2">Avaliação do app</div>
            <div class="flex gap-2">${botoes}</div>${caixa}</div>`;
    }
    async function avaliarApp(n) {
        n = Number(n);
        if (n === 5) {
            avalPendente = null;                 // cancela qualquer resposta de 1 a 4 que ainda estava aberta
            await salvarAvaliacao(5, '');
            desenhar(false);                     // atualiza o destaque para o 5
            confete();
            aviso('Muito obrigado pela avaliação!', { soConfirmar: true });
            return;
        }
        avalPendente = n;
        desenhar(false);
    }
    async function avaliarEnviar() {
        const texto = ($('#aval-texto').value || '').trim();
        if (!texto) return aviso('Escreva uma resposta, por favor.', { soConfirmar: true });
        await salvarAvaliacao(avalPendente, texto);
        avalPendente = null;
        desenhar(false);
        aviso('Muito obrigado pela avaliação!', { soConfirmar: true });
    }
    async function salvarAvaliacao(nota, texto) {
        try {
            await setDoc(doc(db, 'users', uid), { avaliacao: { nota, texto, atualizadoEm: serverTimestamp() } }, { merge: true });
            await enviarEmailAvaliacao(nota, texto);
        } catch (e) { erroDb(e); }
    }
    async function enviarEmailAvaliacao(nota, texto) {
        const nome = (userInfo && userInfo.displayName) || '-', emailConta = (userInfo && userInfo.email) || '-';
        const pergunta = nota === 5 ? '' : (nota <= 2 ? 'O que podemos melhorar?' : 'O que falta para ser 5 estrelas?');
        const corpo = `Nota: ${nota}/5\nUsuário: ${nome}\nE-mail: ${emailConta}\nID: ${uid}\nVersão do app: ${VERSAO_APP}\n` +
            (pergunta ? `${pergunta}\n` : '') + `Resposta: ${texto || '(sem texto)'}`;
        const chave = window.CAP_WEB3FORMS_KEY || CAP_WEB3FORMS_KEY;
        const r = await fetch('https://api.web3forms.com/submit', {
            method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ access_key: chave, subject: 'Avaliação app promotor', from_name: 'Promotor Ajudante - ' + nome, email: emailConta !== '-' ? emailConta : undefined, message: corpo }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j.success) console.warn('avaliação não enviada por e-mail', j);
    }
    // confete animado (sem arquivo externo)
    function confete() {
        const c = document.createElement('canvas'); c.width = innerWidth; c.height = innerHeight;
        c.style.cssText = 'position:fixed;inset:0;z-index:99;pointer-events:none';
        document.body.appendChild(c);
        const g = c.getContext('2d');
        const cores = ['#f59e0b', '#fbbf24', '#ef4444', '#22c55e', '#3b82f6', '#a855f7'];
        const pecas = Array.from({ length: 140 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.3, vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4, r: Math.random() * 6 + 4, cor: cores[Math.floor(Math.random() * cores.length)], rot: Math.random() * 6 }));
        const t0 = Date.now();
        (function quadro() {
            g.clearRect(0, 0, c.width, c.height);
            pecas.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.rot += 0.1; g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = p.cor; g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); g.restore(); });
            if (Date.now() - t0 < 3000) requestAnimationFrame(quadro); else c.remove();
        })();
    }
    /* ---- planograma das lojas ---- */
    function planogramaAbrir() { const b = $('#planograma'); b.classList.remove('hidden'); b.classList.add('flex'); planoLoja = null; planogramaRender(); }
    function planogramaFechar() { const b = $('#planograma'); b.classList.add('hidden'); b.classList.remove('flex'); }
    function planogramaVoltar() { planoLoja = null; planogramaRender(); }
    function planogramaRender() {
        const t = $('#planograma-corpo');
        if (!planoLoja) {
            t.innerHTML = lojas.length
                ? [...lojas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map(l => `<button data-act="planogramaLoja" data-id="${esc(l.id)}" class="card-app w-full p-4 mb-3 text-left"><div class="text-white font-black italic uppercase text-sm">${esc(l.nome)}</div></button>`).join('')
                : '<p class="text-gray-500 text-[11px]">Nenhuma loja cadastrada.</p>';
            return;
        }
        const l = lojas.find(x => x.id === planoLoja);
        t.innerHTML = `<div class="flex items-center justify-between mb-3">
                <button data-act="planogramaVoltar" class="text-amber-500 font-black text-[11px] uppercase">← Lojas</button>
                <button data-act="planogramaCamera" class="flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500 text-amber-500 text-[10px] font-black uppercase"><i data-lucide="camera" class="w-4 h-4"></i> Foto</button></div>
            <div class="text-white font-black italic uppercase text-sm mb-3">${esc(l ? l.nome : '')}</div>
            <div id="planograma-fotos" class="grid grid-cols-2 gap-3 text-[11px] text-gray-500">Carregando...</div>`;
        (window.lucide && lucide.createIcons());
        planogramaCarregarFotos();
    }
    async function planogramaCarregarFotos() {
        const box = $('#planograma-fotos');
        if (!box) return;
        try {
            const snap = await getDocs(query(collection(db, 'users', uid, 'planogramas'), where('lojaId', '==', planoLoja)));
            box.innerHTML = snap.docs.length
                ? snap.docs.map(d => `<div class="relative card-app p-1"><img src="${d.data().dataUrl}" data-act="planogramaVer" data-id="${esc(d.id)}" class="w-full rounded-lg cursor-pointer" alt="Planograma">
                    <button data-act="planogramaExcluir" data-id="${esc(d.id)}" class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 text-red-500 font-black" aria-label="Excluir foto">✕</button></div>`).join('')
                : '<p class="col-span-2">Nenhuma foto de planograma ainda. Toque em Foto para cadastrar.</p>';
        } catch (e) { erroDb(e); }
    }
    function imagemComprimida(arq, maxLado, qualidade) {
        return new Promise((ok, erro) => {
            const url = URL.createObjectURL(arq), img = new Image();
            img.onload = () => {
                const f = Math.min(1, maxLado / Math.max(img.width, img.height));
                const c = document.createElement('canvas'); c.width = Math.round(img.width * f); c.height = Math.round(img.height * f);
                c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', qualidade));
            };
            img.onerror = () => erro(new Error('imagem inválida'));
            img.src = url;
        });
    }
    async function planogramaSalvarFoto(arq) {
        if (!arq || !planoLoja) return;
        try {
            const dataUrl = await imagemComprimida(arq, 1000, 0.7);
            await addDoc(collection(db, 'users', uid, 'planogramas'), { lojaId: planoLoja, dataUrl, criadoEm: serverTimestamp() });
            $('#plan-file').value = '';
            planogramaCarregarFotos();
        } catch (e) { erroDb(e); }
    }
    function planogramaVer(d) {
        const img = document.querySelector(`#planograma-fotos img[data-id="${d.id}"]`);
        if (img) aviso(`<img src="${img.src}" class="w-full rounded-xl" alt="Planograma">`, { titulo: 'PLANOGRAMA', soConfirmar: true });
    }
    function planogramaExcluir(d) {
        aviso('Excluir esta foto do planograma?', { ok: () => deleteDoc(doc(db, 'users', uid, 'planogramas', d.id)).then(planogramaCarregarFotos).catch(erroDb) });
    }
    /* ---- cadastro por voz ---- */
    function vozAbrir() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return aviso('Este navegador não tem comando de voz. Use o Chrome.', { soConfirmar: true });
        const r = new SR(); r.lang = 'pt-BR'; r.interimResults = false; r.maxAlternatives = 1;
        r.onresult = (e) => vozProcessar(e.results[0][0].transcript);
        r.onerror = () => aviso('Não consegui ouvir. Tente de novo, falando devagar.', { soConfirmar: true });
        try { r.start(); } catch (e) { aviso('Não consegui iniciar o microfone.', { soConfirmar: true }); }
    }
    function vozProcessar(texto) {
        const t = String(texto || '').trim();
        const m = t.match(/^(.*?)[,\s]+em\s+(?:a\s+)?loja\s+(.+?)[,\s]+(?:com\s+)?validade\s+(?:de\s+|para\s+)?(.+)$/i);
        if (!m) return aviso(`Não entendi: <b>${esc(t)}</b>.<br><br>Diga assim: <b>produto, em loja 11, validade dia 20 de novembro</b>.`, { soConfirmar: true });
        const nome = m[1].trim().slice(0, 120), lojaFala = normaliza(m[2]).replace(/^loja\s+/, ''), data = parseValidade(m[3], isoLocal(new Date()));
        if (!nome) return aviso('Diga o nome do produto.', { soConfirmar: true });
        if (!data) return aviso(`Não entendi a validade: <b>${esc(m[3])}</b>.`, { soConfirmar: true });
        const padrao = new RegExp('(^|\\s)' + lojaFala.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\s|$)');
        const achadas = lojas.filter(l => padrao.test(normaliza(l.nome)));
        if (!achadas.length) return aviso(`Não encontrei a loja <b>${esc(m[2])}</b>.`, { soConfirmar: true });
        if (achadas.length > 1) return aviso(`Mais de uma loja combina com <b>${esc(m[2])}</b>. Fale o nome completo.`, { soConfirmar: true });
        const loja = achadas[0], marcas = loja.marcas || [];
        let marcaId = marcas.length === 1 ? marcas[0].id : null;
        if (!marcaId) { const igual = produtos.find(x => x.lojaId === loja.id && normaliza(x.nome) === normaliza(nome)); marcaId = igual ? igual.marcaId : null; }
        if (!marcaId) return aviso('Esta loja tem mais de uma marca. Cadastre este produto pelo botão + para escolher a marca.', { soConfirmar: true });
        if (produtos.find(x => x.lojaId === loja.id && x.data === data && normaliza(x.nome) === normaliza(nome))) return aviso(`Este produto já está cadastrado nesta loja com validade em ${dataBR(data)}.`, { soConfirmar: true });
        aviso(`Cadastrar <b>${esc(nome)}</b> em <b>${esc(loja.nome)}</b>, com validade em <b>${dataBR(data)}</b>?`, {
            titulo: 'CONFIRMAR CADASTRO', okTexto: 'Cadastrar',
            ok: () => salvarProdutoVoz({ nome, data, lojaId: loja.id, marcaId }),
        });
    }
    function salvarProdutoVoz(p) {
        const dados = { nome: p.nome, qtd: null, semQtd: true, data: p.data, lojaId: p.lojaId, marcaId: p.marcaId, setor: null, codigo: null, fotoCodigo: null };
        addDoc(colProd(), { ...dados, criadoEm: serverTimestamp() })
            .then(r => { ultimoRegistro = { colecao: 'produtos', id: r.id, nome: p.nome }; registrarVisitaAuto(p.lojaId); toast(`Produto cadastrado: <b>${esc(p.nome)}</b>.`); })
            .catch(erroDb);
    }

    /* ---- desfazer último cadastro ---- */
    function desfazerUltimo() {
        if (!ultimoRegistro) return aviso('Nenhum cadastro para desfazer nesta sessão.', { soConfirmar: true });
        const r = ultimoRegistro;
        aviso(`Desfazer o cadastro de <b>${esc(r.nome || 'produto')}</b>?`, {
            titulo: 'DESFAZER', okTexto: 'Desfazer',
            ok: () => deleteDoc(doc(db, 'users', uid, r.colecao, r.id))
                .then(() => { ultimoRegistro = null; aviso('Cadastro desfeito.', { soConfirmar: true }); })
                .catch(erroDb),
        });
    }

    /* ---- salvar e cadastrar outro (vencido) ---- */
    function limparFormVenc() {
        ['#pn', '#pcod', '#pd', '#pq', '#pmotivo'].forEach(sel => { const el = $(sel); if (el) el.value = ''; });
        marcaPendente = null;
        const pn = $('#pn'); if (pn) pn.focus();
    }

    /* ---- resumo do dia (calendário) ---- */
    let resumoMes = new Date();
    function resumoAbrir() { const b = $('#resumo'); b.classList.remove('hidden'); b.classList.add('flex'); resumoMes = new Date(); resumoRender(null); }
    function resumoFechar() { const b = $('#resumo'); b.classList.add('hidden'); b.classList.remove('flex'); }
    function resumoMudarMes(n) { resumoMes = new Date(resumoMes.getFullYear(), resumoMes.getMonth() + n, 1); resumoRender(null); }
    function diaDoCadastro(p) { return p.criadoEm && p.criadoEm.toDate ? isoLocal(p.criadoEm.toDate()) : null; }
    function resumoRender(diaSel) {
        const ativos = new Set();
        vencidos.forEach(v => { if (v.dataRetirada) ativos.add(v.dataRetirada); });
        produtos.forEach(p => { const d = diaDoCadastro(p); if (d) ativos.add(d); });
        visitas.forEach(v => { if (v.data) ativos.add(v.data); });
        const ano = resumoMes.getFullYear(), mes = resumoMes.getMonth();
        const primeiro = new Date(ano, mes, 1).getDay(), total = new Date(ano, mes + 1, 0).getDate();
        const nomeMes = resumoMes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        let celulas = '';
        for (let i = 0; i < primeiro; i++) celulas += '<div></div>';
        for (let d = 1; d <= total; d++) {
            const iso = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const cl = iso === diaSel ? 'bg-amber-500 text-gray-950' : ativos.has(iso) ? 'border border-amber-500 text-amber-500' : 'text-gray-500';
            celulas += `<button data-act="resumoDia" data-dia="${iso}" class="h-10 rounded-lg text-[11px] font-black ${cl}">${d}</button>`;
        }
        let detalhe = '';
        if (diaSel) {
            const rets = vencidos.filter(v => v.dataRetirada === diaSel);
            const cads = produtos.filter(p => diaDoCadastro(p) === diaSel);
            const vis = visitas.filter(v => v.data === diaSel);
            const linha = (t, s2) => `<div class="card-app p-3 mb-2"><div class="text-white font-bold text-[12px]">${esc(t)}</div><div class="text-gray-500 text-[10px]">${esc(s2)}</div></div>`;
            detalhe = `<div class="mt-4"><div class="text-[9px] text-gray-500 font-black uppercase mb-2">${dataBR(diaSel)}</div>
                ${rets.map(v => linha(`Retirada: ${v.nome} · ${v.qtd} un`, `${nomeLoja(v.lojaId)} · validade ${dataBR(v.dataVenc)}${v.motivo ? ' · ' + v.motivo : ''}`)).join('')}
                ${vis.map(v => linha(`Visita: ${v.lojaNome}`, `às ${v.hora}`)).join('')}
                ${cads.map(p => linha(`Cadastro: ${p.nome}`, `${nomeLoja(p.lojaId)} · validade ${dataBR(p.data)}`)).join('')}
                ${!rets.length && !cads.length && !vis.length ? '<p class="text-gray-500 text-[11px]">Nada registrado neste dia.</p>' : ''}</div>`;
        }
        $('#resumo-corpo').innerHTML = `<div class="flex items-center justify-between mb-3">
                <button data-act="resumoMes" data-n="-1" class="text-amber-500 font-black px-3 text-lg">‹</button>
                <div class="text-white font-black italic uppercase text-sm">${esc(nomeMes)}</div>
                <button data-act="resumoMes" data-n="1" class="text-amber-500 font-black px-3 text-lg">›</button></div>
            <div class="grid grid-cols-7 gap-1 text-center text-[9px] text-gray-600 font-black mb-1">${['D','S','T','Q','Q','S','S'].map(x => `<div>${x}</div>`).join('')}</div>
            <div class="grid grid-cols-7 gap-1">${celulas}</div>${detalhe}`;
    }
    /* ---- superiores e relatório semanal ---- */
    const marcasUnicas = () => {
        const mapa = new Map();
        lojas.flatMap(l => l.marcas || []).forEach(m => { const n = String(m.nome || '').trim(); if (n && !mapa.has(n.toLowerCase())) mapa.set(n.toLowerCase(), n); });
        return [...mapa.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    };
    const DIAS_RELATORIO = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    function superioresAbrir() { const b = $('#superiores'); b.classList.remove('hidden'); b.classList.add('flex'); supEdit = null; superioresRender(); }
    function superioresFechar() { const b = $('#superiores'); b.classList.add('hidden'); b.classList.remove('flex'); }
    function superioresRender() {
        const corpo = $('#superiores-corpo');
        if (supEdit !== null) {
            const s = supEdit === 'novo' ? {} : (superiores.find(x => x.id === supEdit) || {});
            const sel = (s.marcas || []).map(x => x.toLowerCase());
            const marcas = marcasUnicas();
            corpo.innerHTML = `<button data-act="superiorCancelar" class="text-amber-500 font-black text-[11px] uppercase mb-3">← Voltar</button>
                <div class="card-app p-4 mb-3">
                    <label class="text-[9px] text-gray-500 font-black uppercase">Nome do superior</label><input id="sup-nome" class="input-custom w-full mb-3" value="${esc(s.nome || '')}">
                    <label class="text-[9px] text-gray-500 font-black uppercase">E-mail</label><input id="sup-email" type="email" class="input-custom w-full mb-3" value="${esc(s.email || '')}">
                    <label class="text-[9px] text-gray-500 font-black uppercase">WhatsApp (opcional)</label><input id="sup-whats" inputmode="tel" class="input-custom w-full mb-3" value="${esc(s.whatsapp || '')}">
                    <div class="text-[9px] text-gray-500 font-black uppercase mb-2">Marcas que ele acompanha</div>
                    ${marcas.length ? marcas.map(m => `<label class="flex items-center gap-2 text-[11px] font-bold text-gray-300 mb-2"><input type="checkbox" class="accent-amber-500 sup-marca" value="${esc(m)}" ${sel.includes(m.toLowerCase()) ? 'checked' : ''}> ${esc(m)}</label>`).join('') : '<p class="text-[11px] text-gray-500">Nenhuma marca cadastrada ainda.</p>'}
                    <p class="text-[10px] text-gray-500 mt-2">Se houver só um superior cadastrado, ele recebe todas as marcas.</p>
                    <button data-act="superiorSalvar" class="btn-amarelo mt-3">Salvar superior</button>
                </div>`;
            return;
        }
        const rel = perfilAcesso.relatorio || { dia: 5, hora: 18 };
        corpo.innerHTML = `<div class="card-app p-4 mb-3">
                <div class="text-[9px] text-gray-500 font-black uppercase mb-2">Envio automático do relatório semanal</div>
                <div class="flex gap-2">
                    <select id="rel-dia" class="input-custom flex-1">${DIAS_RELATORIO.map((n, i) => `<option value="${i}" ${rel.dia === i ? 'selected' : ''}>${n}</option>`).join('')}</select>
                    <select id="rel-hora" class="input-custom w-24">${Array.from({ length: 24 }, (_, h) => `<option value="${h}" ${rel.hora === h ? 'selected' : ''}>${String(h).padStart(2, '0')}:00</option>`).join('')}</select>
                </div>
                <button data-act="relatorioSalvar" class="btn-amarelo mt-2">Salvar horário</button>
                <button data-act="relatorioEnviarAgora" class="w-full py-3 mt-2 rounded-xl border border-amber-500 text-[10px] font-black uppercase text-amber-500">Enviar relatório agora</button>
                <p class="text-[10px] text-gray-500 mt-2">O relatório dos últimos 7 dias vai por e-mail para cada superior cadastrado.</p>
            </div>
            <button data-act="superiorNovo" class="btn-amarelo mb-3">+ Novo superior</button>
            ${superiores.length ? superiores.map(s => `<div class="card-app p-4 mb-3 flex items-center justify-between gap-2">
                    <button data-act="superiorEditar" data-id="${esc(s.id)}" class="text-left flex-1">
                        <div class="text-white font-black italic uppercase text-sm">${esc(s.nome)}</div>
                        <div class="text-gray-500 text-[11px]">${esc(s.email)}</div>
                        <div class="text-gray-600 text-[10px]">${(s.marcas || []).length ? esc(s.marcas.join(', ')) : 'Todas as marcas'}</div>
                    </button>
                    <button data-act="superiorExcluir" data-id="${esc(s.id)}" class="text-red-500 p-2" aria-label="Excluir">✕</button>
                </div>`).join('') : '<p class="text-gray-500 text-[11px]">Nenhum superior cadastrado.</p>'}`;
    }
    async function superiorSalvar() {
        const nome = $('#sup-nome').value.trim(), email = $('#sup-email').value.trim(), whatsapp = $('#sup-whats').value.trim();
        const marcas = [...document.querySelectorAll('.sup-marca:checked')].map(c => c.value);
        if (!nome) return aviso('Informe o nome do superior.', { soConfirmar: true });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return aviso('E-mail inválido.', { soConfirmar: true });
        const total = superiores.filter(x => x.id !== supEdit).length + 1;
        if (total > 1 && !marcas.length && marcasUnicas().length) return aviso('Com mais de um superior, escolha pelo menos uma marca para ele.', { soConfirmar: true });
        const dados = { nome: nome.slice(0, 80), email: email.slice(0, 120), whatsapp: whatsapp.slice(0, 30), marcas };
        try {
            if (supEdit === 'novo') await addDoc(collection(db, 'users', uid, 'superiores'), dados);
            else await setDoc(doc(db, 'users', uid, 'superiores', supEdit), dados, { merge: true });
            // se trocou o e-mail do superior, o vínculo antigo sai
            const antigo = supEdit !== 'novo' ? superiores.find(x => x.id === supEdit) : null;
            if (antigo && antigo.email && antigo.email.toLowerCase() !== dados.email.toLowerCase()) {
                await deleteDoc(doc(db, 'vinculos', antigo.email.toLowerCase(), 'promotores', uid)).catch(() => {});
            }
            await sincronizarVinculo(dados.email, total === 1 ? marcasUnicas() : marcas);
            supEdit = null;
            superioresRender();
        } catch (e) { erroDb(e); }
    }
    function superiorExcluir(id) {
        const sup = superiores.find(x => x.id === id);
        aviso('Excluir este superior? Ele deixa de receber o relatório.', {
            ok: () => deleteDoc(doc(db, 'users', uid, 'superiores', id))
                .then(() => (sup && sup.email ? deleteDoc(doc(db, 'vinculos', sup.email.toLowerCase(), 'promotores', uid)) : null))
                .catch(erroDb),
        });
    }
    // vínculo do promotor com o e-mail do superior (a agência lê por este caminho)
    async function sincronizarVinculo(email, marcasEscolhidas) {
        const id = String(email).trim().toLowerCase();
        const nome = (perfilAcesso && perfilAcesso.nome) || (userInfo && userInfo.displayName) || (userInfo && userInfo.email) || 'Promotor';
        await setDoc(doc(db, 'vinculos', id, 'promotores', uid), { nome, marcas: marcasEscolhidas, atualizadoEm: serverTimestamp() }, { merge: true });
    }
    function relatorioSalvar() {
        const dia = Number($('#rel-dia').value), hora = Number($('#rel-hora').value);
        setDoc(doc(db, 'users', uid), { relatorio: { dia, hora } }, { merge: true })
            .then(() => aviso(`Relatório programado para ${DIAS_RELATORIO[dia]} às ${String(hora).padStart(2, '0')}:00.`, { soConfirmar: true }))
            .catch(erroDb);
    }
    /* ---- registro de visita ---- */
    async function visitaRegistrar(lojaId) {
        const l = lojas.find(x => x.id === lojaId);
        if (!l) return;
        if (!infoDiaLoja(l).atendeHoje) return aviso('Hoje não é dia de atendimento desta loja.', { soConfirmar: true });
        const agora = new Date(), data = isoLocal(agora), hora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
        const gravar = () => addDoc(collection(db, 'users', uid, 'visitas'), { lojaId, lojaNome: l.nome, data, hora, criadoEm: serverTimestamp() })
            .then(() => aviso(`Visita registrada em <b>${esc(l.nome)}</b> às ${hora}.`, { soConfirmar: true }))
            .catch(erroDb);
        if (visitas.some(v => v.lojaId === lojaId && v.data === data && !v.semVisita && !v.extra)) {
            return aviso(`Você já registrou visita nesta loja hoje. Registrar outra?`, { titulo: 'VISITA', okTexto: 'Registrar', ok: gravar });
        }
        gravar();
    }
    // Situação da loja no dia: se já foi visitada hoje e se hoje é dia de atendimento
    function proximaVisitaTxt(l) {
        const dias = diasDaLoja(l), nomes = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
        const hoje = new Date(), hojeISO = isoLocal(hoje);
        const jaTratadaHoje = visitas.some(v => v.lojaId === l.id && v.data === hojeISO && !v.extra);
        for (let k = 0; k < 8; k++) {
            if (k === 0 && jaTratadaHoje) continue;
            const d = new Date(hoje); d.setDate(hoje.getDate() + k);
            if (dias.includes(d.getDay())) return `Próxima visita: <b class="text-gray-200">${k === 0 ? 'hoje' : nomes[d.getDay()]}</b>`;
        }
        return 'Sem dia de visita definido';
    }
    function infoDiaLoja(l) {
        const hoje = isoLocal(new Date()), dias = diasDaLoja(l), diaSemana = new Date().getDay();
        const nomes = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
        const atendeHoje = dias.includes(diaSemana) || visitas.some(v => v.extra && v.lojaId === l.id && v.data === hoje);
        const visitouHoje = atendeHoje ? visitas.filter(v => v.lojaId === l.id && v.data === hoje && !v.semVisita && !v.extra).sort((x, y) => x.hora.localeCompare(y.hora))[0] : undefined;
        const semHoje = visitas.some(v => v.lojaId === l.id && v.data === hoje && v.semVisita);
        let proximo = null;
        if (dias.length) for (let k = 1; k <= 7; k++) { const d = (diaSemana + k) % 7; if (dias.includes(d)) { proximo = { k, d }; break; } }
        return { visitouHoje, semHoje, atendeHoje, dias, proximo, nomes };
    }
    /* ---- endereço da loja: sugestões do Google Maps enquanto digita ---- */
    const MAPS_KEY = 'COLE_A_CHAVE_DO_GOOGLE_MAPS_AQUI';
    let enderecoEditando = null;   // loja cujo endereço está aberto para edição
    let mapsPronto = null, sessaoPlaces = null, sugestoesAtuais = [], enderecoEscolhido = null, timerSug = null;
    function carregarMaps() {
        if (mapsPronto) return mapsPronto;
        mapsPronto = new Promise((ok, erro) => {
            const s = document.createElement('script');
            s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&v=weekly`;
            s.async = true;
            s.onload = () => ok();
            s.onerror = () => { mapsPronto = null; erro(new Error('mapas indisponíveis')); };
            document.head.appendChild(s);
        });
        return mapsPronto;
    }
    function agendarSugestoes(texto) {
        clearTimeout(timerSug);
        timerSug = setTimeout(() => buscarSugestoes(texto), 300);
    }
    async function buscarSugestoes(texto) {
        const box = $('#l-sugestoes'); if (!box) return;
        const t = String(texto || '').trim();
        // sem chave do Google Maps, as sugestões ficam desligadas (o endereço é digitado normalmente)
        if (MAPS_KEY.startsWith('COLE') || t.length < 3) { box.innerHTML = ''; sugestoesAtuais = []; return; }
        try {
            await carregarMaps();
            const { AutocompleteSuggestion, AutocompleteSessionToken } = await google.maps.importLibrary('places');
            if (!sessaoPlaces) sessaoPlaces = new AutocompleteSessionToken();
            const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
                input: t, includedRegionCodes: ['br'], language: 'pt-BR', sessionToken: sessaoPlaces,
            });
            sugestoesAtuais = suggestions.filter(x => x.placePrediction).map(x => x.placePrediction);
            box.innerHTML = sugestoesAtuais.map((p, i) => `<button data-act="enderecoEscolher" data-i="${i}" class="w-full text-left p-3 rounded-xl border border-gray-800 bg-[#111827] text-xs text-gray-200">${esc(p.text.toString())}</button>`).join('')
                || '<div class="text-[10px] text-gray-500 p-2">Nenhuma sugestão encontrada.</div>';
        } catch (e) {
            console.error('sugestões de endereço:', e);
            box.innerHTML = '<div class="text-[10px] text-amber-500 p-2">Não consegui buscar sugestões agora. Você pode digitar o endereço completo.</div>';
        }
    }
    async function escolherSugestao(i) {
        const pred = sugestoesAtuais[i]; if (!pred) return;
        try {
            const lugar = pred.toPlace();
            await lugar.fetchFields({ fields: ['formattedAddress', 'location'] });
            const texto = lugar.formattedAddress || pred.text.toString();
            const loc = lugar.location;
            enderecoEscolhido = { texto, lat: loc.lat(), lng: loc.lng() };
            $('#l-endereco').value = texto;
            $('#l-sugestoes').innerHTML = '';
            sessaoPlaces = null;   // a sessão de busca termina ao escolher
            toast('Endereço selecionado. Toque em Salvar endereço.');
        } catch (e) {
            console.error('escolher endereço:', e);
            aviso('Não consegui pegar esse endereço. Tente de novo.', { soConfirmar: true });
        }
    }
    /* ---- aprovação da agência/superior ---- */
    const aprovadoresDoPromotor = () => {
        const e = new Set();
        convitesRecebidos.filter(c => c.status === 'aceito' && c.agenciaEmail).forEach(c => e.add(c.agenciaEmail.toLowerCase()));
        superiores.forEach(s => s.email && e.add(s.email.toLowerCase()));
        return [...e];
    };
    const temAprovador = () => aprovadoresDoPromotor().length > 0;
    const solicitacaoPendente = (lojaId, tipo) => solicitacoes.some(s => s.status === 'pendente' && s.lojaId === lojaId && (!tipo || s.tipo === tipo));
    async function pedirAprovacao(tipo, lojaId, lojaNome, payload) {
        const ref = await addDoc(collection(db, 'solicitacoes'), {
            tipo, lojaId, lojaNome, payload,
            promotorUid: uid, promotorNome: (userInfo && userInfo.displayName) || '',
            aprovadores: aprovadoresDoPromotor(), status: 'pendente', applied: false,
            criadoEm: serverTimestamp(),
        });
        toast('Enviado para aprovação da agência.');
        notificarAprovadores(ref.id);
    }
    async function notificarAprovadores(id) {
        try {
            const t = await auth.currentUser.getIdToken();
            await fetch('/api/notificar-aprovador', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }, body: JSON.stringify({ id }) });
        } catch (e) { console.warn('aviso ao aprovador:', e); }
    }
    // Aplica no promotor o que a agência aprovou (ou só marca como lido, se recusou)
    const solicitacoesAplicando = new Set();
    async function aplicarSolicitacoes() {
        for (const s of solicitacoes) {
            if (s.applied || s.status === 'pendente' || solicitacoesAplicando.has(s.id)) continue;
            solicitacoesAplicando.add(s.id);
            try {
                const pl = s.payload || {};
                if (s.status === 'aprovada') {
                    if (s.tipo === 'sem_visita') {
                        await addDoc(collection(db, 'users', uid, 'visitas'), { lojaId: s.lojaId, lojaNome: s.lojaNome, data: pl.data, hora: pl.hora, semVisita: true, motivo: pl.motivo, criadoEm: serverTimestamp() });
                    } else if (s.tipo === 'adiar') {
                        await addDoc(collection(db, 'users', uid, 'visitas'), { lojaId: s.lojaId, lojaNome: s.lojaNome, data: pl.de, hora: '', semVisita: true, motivo: 'Visita adiada para ' + fmtBR(pl.para), adiadaPara: pl.para, criadoEm: serverTimestamp() });
                        await addDoc(collection(db, 'users', uid, 'visitas'), { lojaId: s.lojaId, lojaNome: s.lojaNome, data: pl.para, hora: '', semVisita: false, extra: true, adiadaDe: pl.de, criadoEm: serverTimestamp() });
                    } else if (s.tipo === 'dias') {
                        const l = lojas.find(x => x.id === s.lojaId);
                        if (l) await updateDoc(doc(colLojas(), l.id), { diasVisita: pl.dias, diaVisita: null });
                    }
                    toast('Aprovado pela agência: ' + (s.lojaNome || ''));
                } else if (s.status === 'recusada') {
                    toast('Recusado pela agência: ' + (s.lojaNome || ''));
                }
                await updateDoc(doc(db, 'solicitacoes', s.id), { applied: true });
            } catch (e) { console.error('solicitação:', e); }
            finally { solicitacoesAplicando.delete(s.id); }
        }
    }

    /* ---- convites de agência ---- */
    function convitePendente(c) {
        if (c.status !== 'pendente') return false;
        const exp = c.expiraEm && c.expiraEm.toDate ? c.expiraEm.toDate() : null;
        return !exp || exp > new Date();
    }
    function convitesPendentes() { return convitesRecebidos.filter(convitePendente); }
    function htmlConvites() {
        const lista = convitesPendentes();
        if (!lista.length) return '';
        return `<div class="card-app p-4 mb-3">
            <div class="text-[9px] text-gray-500 font-black uppercase mb-3">Convites de agência</div>
            ${lista.map(c => `<div class="mb-3">
                <div class="text-white font-bold text-sm">${esc(c.agenciaNome || 'Agência')}</div>
                <div class="text-gray-500 text-[11px] mb-2">${esc(c.agenciaEmail || '')}</div>
                <div class="grid grid-cols-2 gap-2">
                    <button data-act="conviteAceitar" data-agencia="${esc(c.agenciaUid)}" class="py-2 rounded-xl bg-amber-500 text-black text-[10px] font-black uppercase">Aceitar</button>
                    <button data-act="conviteRecusar" data-agencia="${esc(c.agenciaUid)}" class="py-2 rounded-xl border border-gray-700 text-gray-300 text-[10px] font-black uppercase">Recusar</button>
                </div></div>`).join('')}
        </div>`;
    }
    function nomeDoPromotor() {
        return (perfilAcesso && perfilAcesso.nome) || (userInfo && userInfo.displayName) || (userInfo && userInfo.email) || 'Promotor';
    }
    async function conviteResponder(agenciaUid, status) {
        const c = convitesRecebidos.find(x => x.agenciaUid === agenciaUid && convitePendente(x));
        if (!c) return;
        const emailProm = (userInfo.email || '').toLowerCase();
        try {
            if (status === 'aceito') {
                // o promotor cria o vínculo com o e-mail da agência, e a agência passa a vê-lo
                await setDoc(doc(db, 'vinculos', c.agenciaEmail.toLowerCase(), 'promotores', uid),
                    { nome: nomeDoPromotor(), marcas: marcasUnicas(), atualizadoEm: serverTimestamp() }, { merge: true });
            }
            await updateDoc(doc(db, 'convites', emailProm, 'pedidos', agenciaUid), { status, respondidoEm: serverTimestamp() });
            await updateDoc(doc(db, 'agencias', agenciaUid, 'convites', emailProm), { status, respondidoEm: serverTimestamp() }).catch(() => {});
            toast(status === 'aceito' ? 'Convite aceito. A agência já pode ver você.' : 'Convite recusado.');
        } catch (e) { console.error(e); toast('Não consegui responder ao convite.'); }
    }
    // linha por baixo do menu: percorre a borda inferior e sobe um pouco sob o item selecionado
    function moverCurvaMenu() {
        const path = document.getElementById('menu-linha-path');
        const svg = document.getElementById('menu-linha');
        const ativo = document.querySelector('.menu-item.ativa');
        const bar = document.querySelector('#menu-inferior > div');
        if (!path || !svg || !ativo || !bar) return;
        const r = ativo.getBoundingClientRect(), b = bar.getBoundingClientRect();
        const W = b.width - 48, x = r.left - b.left - 24 + r.width / 2;
        const base = 7, topo = 1, ramp = 26;   // altura do SVG = 8 px
        path.setAttribute('d', `M0 ${base} H${Math.max(0, x - ramp - 14)} C${x - ramp} ${base} ${x - ramp} ${topo} ${x} ${topo} C${x + ramp} ${topo} ${x + ramp} ${base} ${x + ramp + 14} ${base} H${W}`);
        svg.setAttribute('viewBox', `0 0 ${W} 8`);
    }
    window.addEventListener('resize', moverCurvaMenu);
    function fecharLegal() { const box = $('#legal'); box.classList.add('hidden'); box.classList.remove('flex'); }

    /* ---- cobrança: acesso anual ---- */
    const PAGAMENTO_LINK = 'https://mpago.la/1Vi3SVH';
    const PRECO_ANUAL = 510;   // valor do plano anual (15% de desconto sobre 12 × R$ 50,00)
    const DATA_CORTE = new Date('2026-11-07T18:00:00-03:00');   // contas criadas ANTES desta data continuam grátis
    let contaAntiga = false, perfilAcesso = {}, appAberto = false;
    let diasAviso = [2, 3, 5];   // dias antes do vencimento em que o promotor quer ser avisado (1 a 5)
    let vencErro = '';      // preenchido se as regras do Firebase ainda não liberam 'vencidos'
    let filtroVenc = '';    // filtro de marca na tela Relatório de vencidos
    let unsubs = [];
    const pendentes = { lojas: false, produtos: false, vencidos: false };   // alterações ainda não enviadas ao servidor
    let prontoProd = false;
    let view = { tab: 'h', lojaId: null, marcaId: null, prod: null, preLoja: null, preMarca: '', origem: null, origemMarca: null, busca: '' };
    let modoCriar = false;
    const ignorados = new Set(JSON.parse(sessionStorage.getItem('ign_venc') || '[]'));

    const colLojas = () => collection(db, 'users', uid, 'lojas');
    const colProd  = () => collection(db, 'users', uid, 'produtos');
    const refLoja  = (id) => doc(db, 'users', uid, 'lojas', id);
    const refProd  = (id) => doc(db, 'users', uid, 'produtos', id);
    const colVenc  = () => collection(db, 'users', uid, 'vencidos');
    const refVenc  = (id) => doc(db, 'users', uid, 'vencidos', id);
    const nomeLoja = (id) => (lojas.find(l => l.id === id) || {}).nome || '-';
    // As marcas ficam dentro do documento da loja: loja.marcas = [{ id, nome }]
    const marcasDe = (lojaId) => ((lojas.find(l => l.id === lojaId) || {}).marcas) || [];
    const nomeMarca = (lojaId, marcaId) => (marcasDe(lojaId).find(m => m.id === marcaId) || {}).nome || '';
    const doMarca = (p, marcaId) => marcaId === '_sem' ? !p.marcaId : p.marcaId === marcaId;
    const rotuloLoja = (p) => esc(nomeLoja(p.lojaId)) + (p.marcaId && nomeMarca(p.lojaId, p.marcaId) ? ' · ' + esc(nomeMarca(p.lojaId, p.marcaId)) : '');
    const norm = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let ultimaMarca = '';
    // Campo "Marca" do formulário: sem marcas na loja vira um botão "Cadastrar marca";
    // com marcas vira uma lista, e "+ Cadastrar marca" é sempre a última opção.
    function campoMarca(lojaId, sel, extras = []) {
        ultimaMarca = sel || '';
        const lista = [...marcasDe(lojaId)];
        extras.forEach(x => { if (!lista.some(m => m.id === x.id)) lista.push(x); });
        if (!lista.length) {
            return `<button type="button" data-act="novaMarcaForm" class="input-custom text-left text-amber-500 font-bold uppercase text-[10px]">+ Cadastrar marca</button>`;
        }
        return `<select id="pm" class="input-custom"><option value="">Selecione a marca...</option>` +
            lista.map(m => `<option value="${esc(m.id)}" ${m.id === sel ? 'selected' : ''}>${esc(m.nome)}</option>`).join('') +
            `<option value="__nova">+ Cadastrar marca</option></select>`;
    }
    function refreshCampoMarca(lojaId, sel, extras) {
        const c = $('#campo-marca'); if (c) c.innerHTML = campoMarca(lojaId, sel, extras);
        if (view.tab === 'v') atualizarDicaBaixa();
    }
    // Sugestões de nomes de produtos já cadastrados (ignora maiúsculas e acentos)
    function sugestoes(texto) {
        const q = norm(texto);
        if (!q) return [];
        const vistos = new Map();
        [...produtos, ...vencidos].forEach(p => { const k = norm(p.nome); if (k && !vistos.has(k)) vistos.set(k, p.nome.trim()); });
        return [...vistos.entries()]
            .filter(([k]) => k.includes(q) && k !== q)
            .sort((a, b) => (b[0].startsWith(q) - a[0].startsWith(q)) || a[0].localeCompare(b[0]))
            .slice(0, 6).map(e => e[1]);
    }
    function mostrarSugestoes() {
        const box = $('#sug'), inp = $('#pn'); if (!box || !inp) return;
        const lista = sugestoes(inp.value);
        if (!lista.length) { box.classList.add('hidden'); box.innerHTML = ''; return; }
        box.innerHTML = lista.map(n => `<button type="button" data-act="pickSug" data-nome="${esc(n)}" class="w-full text-left px-3 py-3 text-xs font-black italic uppercase text-white border-b border-white/5 active:bg-amber-500 active:text-gray-950">${esc(n)}</button>`).join('');
        box.classList.remove('hidden');
    }

    function erroVenc(e) {
        console.error(e);
        if (e && e.code === 'permission-denied') {
            vencErro = 'permission-denied';
            return aviso('SEM PERMISSÃO PARA SALVAR OS VENCIDOS. As regras do Firebase ainda precisam ser atualizadas.', { soConfirmar: true });
        }
        erroDb(e);
    }
    function erroDb(e) {
        console.error(e);
        const cod = e && e.code ? String(e.code) : '';
        const msg = cod === 'permission-denied' ? 'Sem permissão para salvar. Saia e entre novamente.'
            : cod === 'unauthenticated' ? 'Sua sessão expirou. Entre novamente.'
            : cod === 'resource-exhausted' ? 'Limite de uso atingido por hoje. Tente amanhã.'
            : cod === 'unavailable' || cod === 'deadline-exceeded' ? 'Sem conexão no momento. Os dados ficam no celular e são enviados quando a internet voltar.'
            : cod === 'not-found' ? 'Este item não existe mais. Atualize a tela.'
            : cod === 'already-exists' ? 'Este item já existe.'
            : 'Não foi possível salvar. Tente de novo em instantes.';
        aviso(msg, { soConfirmar: true });
    }

    /* ================= conexão / modo offline ================= */
    function atualizarFaixaConexao() {
        const f = $('#faixa-conexao'); if (!f) return;
        const base = 'px-4 py-2 text-[10px] font-black uppercase tracking-wide text-center ';
        if (!navigator.onLine) {
            f.className = base + 'bg-amber-500 text-gray-950';
            f.textContent = 'Sem internet · pode continuar usando. Tudo será enviado quando a conexão voltar.';
        } else if (pendentes.lojas || pendentes.produtos || pendentes.vencidos) {
            f.className = base + 'bg-gray-800 text-amber-500';
            const n = (pendentes.lojas || 0) + (pendentes.produtos || 0) + (pendentes.vencidos || 0);
            f.textContent = n + (n === 1 ? ' alteração aguardando envio' : ' alterações aguardando envio');
        } else { f.className = 'hidden'; f.textContent = ''; }
    }
    window.addEventListener('online', atualizarFaixaConexao);
    window.addEventListener('offline', atualizarFaixaConexao);

    // Service worker: guarda o app no aparelho para abrir e funcionar sem internet
    const HOSTS_CACHE = ['cdn.tailwindcss.com', 'unpkg.com', 'www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'raw.githubusercontent.com'];
    async function aquecerCache(forcar) {
        if (!forcar && localStorage.getItem('sw_aquecido') === '1') return;
        const nomes = [location.href, ...performance.getEntriesByType('resource').map(r => r.name)];
        const urls = [...new Set(nomes)].filter(u => { try { const x = new URL(u); return x.origin === location.origin || HOSTS_CACHE.includes(x.hostname); } catch (_) { return false; } });
        await Promise.all(urls.map(u => fetch(u).catch(() => fetch(u, { mode: 'no-cors' }).catch(() => {}))));
        localStorage.setItem('sw_aquecido', '1');
    }
    function registrarSW() {
        if (!('serviceWorker' in navigator)) return;
        // quando o service worker novo assume, a página recarrega as bibliotecas por ele para guardá-las no aparelho
        navigator.serviceWorker.addEventListener('message', (e) => { if (e.data === 'sw-ativo-v1') aquecerCache(true); });
        navigator.serviceWorker.register('firebase-messaging-sw.js')
            .then(() => navigator.serviceWorker.ready)
            .then(() => { if (navigator.serviceWorker.controller) aquecerCache(false); })
            .catch(e => console.warn('SW:', e));
    }

    /* ================= modal ================= */
    const modal = $('#modal-container');
    function fecharModal() { modal.style.display = 'none'; }
    function aviso(msg, o = {}) {
        $('#modal-titulo').textContent = o.titulo || 'SISTEMA';
        $('#modal-subtext').innerHTML = msg; // quem chama escapa o conteúdo dinâmico
        const inp = $('#modal-input');
        const temInput = o.input !== undefined && o.input !== null;
        $('#modal-input-area').style.display = temInput ? 'block' : 'none';
        if (temInput) inp.value = o.input;
        $('#btn-cancelar').style.display = o.soConfirmar ? 'none' : 'block';
        $('#modal-confirm').textContent = o.okTexto || 'Confirmar';
        modal.style.display = 'flex';
        $('#btn-cancelar').onclick = () => { fecharModal(); if (o.cancel) o.cancel(); };
        $('#modal-confirm').onclick = () => { const v = temInput ? inp.value.trim() : true; fecharModal(); if (o.ok) o.ok(v); };
        setTimeout(() => (temInput ? inp : $('#modal-confirm')).focus(), 50);
    }
    document.addEventListener('keydown', (e) => {
        if (modal.style.display !== 'flex') {
            if (e.key === 'Enter' && $('#tela-auth').classList.contains('ativa') && /^a-(email|senha|nome)$/.test(e.target.id)) acoes.authSubmit();
            return;
        }
        if (e.key === 'Escape') { ($('#btn-cancelar').style.display !== 'none' ? $('#btn-cancelar') : $('#modal-confirm')).click(); }
        if (e.key === 'Enter' && e.target.id === 'modal-input') $('#modal-confirm').click();
    });

    /* ================= telas ================= */
    function mostrar(nome) {
        if (nome !== 'carregando') window.__appOk = true;
        ['carregando', 'auth', 'pagamento', 'app'].forEach(n => $('#tela-' + n).classList.toggle('ativa', n === nome));
        if (nome === 'app' || nome === 'pagamento') (window.lucide && lucide.createIcons());
    }

    function ir(tab, extra = {}) {
        if (!['p', 'v'].includes(tab)) scanPendente = null;
        if (tab === 'c') setTimeout(carregarRecibos, 80);
        view = { tab, lojaId: null, marcaId: null, prod: null, preLoja: null, preMarca: '', origem: null, origemMarca: null, busca: '', ...extra };
        desenhar(true);
        if (tab !== 'p' && tab !== 'c' && tab !== 'v' && tab !== 'cap') setTimeout(verificarVencidos, 300);
    }

    // Redesenha após mudanças vindas do banco, sem atrapalhar formulários abertos
    function atualizar() {
        if (!uid) return;
        if (view.tab === 'p' || view.tab === 'c' || view.tab === 'v' || view.tab === 'cap') return;
        if (document.activeElement && document.activeElement.id === 'busca') { atualizarBusca(); return; }
        desenhar(false);
    }

    function desenhar(topo) {
        document.querySelectorAll('.nav-aba, .menu-item').forEach(b => b.classList.toggle('ativa', b.dataset.id === view.tab));
        moverCurvaMenu();
        const naConta = view.tab === 'c' || view.tab === 'r' || view.tab === 'cap';
        const bc = $('#btn-conta'); if (bc) { bc.classList.toggle('text-amber-500', naConta); bc.classList.toggle('text-gray-500', !naConta); }
        const m = $('#corpo');
        const st = m.scrollTop;
        let html = '';
        if (view.tab === 'h') html = htmlHome();
        else if (view.tab === 'l') html = view.lojaId ? (view.marcaId ? htmlMarca(view.lojaId, view.marcaId) : htmlLoja(view.lojaId)) : htmlLojas();
        else if (view.tab === 'p') html = barraCadastro('p') + htmlForm();
        else if (view.tab === 'v') html = barraCadastro('v') + htmlVencForm();
        else if (view.tab === 'r') html = htmlRelVenc();
        else if (view.tab === 'cap') html = htmlCap();
        else html = htmlConta();
        m.innerHTML = html;
        m.scrollTop = topo ? 0 : st;
        (window.lucide && lucide.createIcons());
        if (view.busca) atualizarBusca();
    }

    /* ================= busca de produtos (lupa) na tela da marca ================= */
    function htmlBusca() {
        return `
            <div class="relative mb-4">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none"><i data-lucide="search" class="w-4 h-4"></i></span>
                <input id="busca" type="search" class="input-custom" style="padding-left:2.6rem;padding-right:2.8rem" placeholder="Buscar produto..." autocomplete="off" autocapitalize="off" value="${esc(view.busca || '')}">
                <button id="busca-x" data-act="limparBusca" class="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-gray-500 ${view.busca ? '' : 'hidden'}" aria-label="Limpar busca"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>`;
    }
    // Mostra só os produtos cujo nome contém o texto (ignora maiúsculas e acentos); cada produto mantém todas as suas datas
    function atualizarBusca() {
        const inp = $('#busca'); if (!inp) return;
        view.busca = inp.value;
        const q = norm(inp.value);
        let visiveis = 0;
        document.querySelectorAll('#lista-prod [data-nome]').forEach(g => {
            const ok = !q || g.dataset.nome.includes(q);
            g.hidden = !ok; if (ok) visiveis++;
        });
        const x = $('#busca-x'); if (x) x.classList.toggle('hidden', !inp.value);
        const vazio = $('#busca-vazio'); if (vazio) vazio.classList.toggle('hidden', !(q && visiveis === 0));
    }

    // Ordem da lista de vencimentos: lojas que atendem hoje primeiro; depois, as de menor frequência de visita
    function ordemLoja(lojaId) {
        const l = lojas.find(x => x.id === lojaId);
        const dias = l ? diasDaLoja(l) : [];
        return [dias.includes(new Date().getDay()) ? 0 : 1, dias.length || 99, l ? l.nome : ''];
    }
    function cmpAlerta(a, b) {
        const ka = ordemLoja(a.lojaId), kb = ordemLoja(b.lojaId);
        return ka[0] - kb[0] || ka[1] - kb[1] || ka[2].localeCompare(kb[2], 'pt-BR') || a.nome.localeCompare(b.nome, 'pt-BR');
    }
    // cartão da tela inicial (foto 4): vencimento, visitas do dia e a linha com as lojas (caixas) até a casa
    function htmlResumoTopo() {
        const hoje = isoLocal(new Date()), dia = new Date().getDay();
        const futuros = produtos.filter(p => p.data && p.data >= hoje).sort((a, b) => a.data.localeCompare(b.data));
        const prox = futuros[0];
        const dias = prox ? Math.round((Date.parse(prox.data + 'T00:00:00Z') - Date.parse(hoje + 'T00:00:00Z')) / 86400000) : null;
        const qtdProx = prox ? futuros.filter(p => p.data === prox.data).length : 0;
        const rotulo = dias === null ? '-' : dias === 0 ? 'HOJE' : dias === 1 ? 'AMANHÃ' : `${dias} DIAS`;
        const previstas = previstasDoDia(hoje).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        const semIds = new Set(previstas.filter(l => visitas.some(v => v.lojaId === l.id && v.data === hoje && v.semVisita)).map(l => l.id));
        const ativas = previstas.filter(l => !semIds.has(l.id));
        const feitasIds = new Set(ativas.filter(l => visitas.some(v => v.lojaId === l.id && v.data === hoje && !v.semVisita && !v.extra)).map(l => l.id));
        const n = ativas.length, feitas = feitasIds.size, faltam = n - feitas;
        const total = previstas.length;
        const pos = (i) => ((i + 1) / (total + 1)) * 100;
        // sequência fixa: primeiro as lojas que ainda vão ser visitadas, depois as lojas sem visita (vermelho)
        const seq = [...ativas, ...previstas.filter(l => semIds.has(l.id))];
        // quadros acendem em ordem: a 1ª visita feita acende o 1º quadro, a 2ª acende o 2º, e assim por diante
        const progresso = n === 0 ? 0 : feitas === n ? 100 : (feitas > 0 ? pos(feitas - 1) : 0);
        const caixas = seq.map((l, i) => {
            if (semIds.has(l.id)) return `<div class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-[3px] bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]" style="left:${pos(i)}%" title="Sem visita"></div>`;
            const acesa = i < feitas;
            return `<div class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-[3px] ${acesa ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-gray-800 border border-gray-600'}" style="left:${pos(i)}%"></div>`;
        }).join('');
        return `<div class="card-app mb-4 p-4 rounded-[22px]">
            <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                    <div class="w-11 rounded-lg bg-gray-100 overflow-hidden text-center">
                        <div class="bg-gray-600 text-[7px] font-black text-white py-0.5 uppercase">${rotulo}</div>
                        <div class="text-gray-700 text-[7px] font-black uppercase py-1">vence</div>
                    </div>
                    <div>
                        <div class="text-3xl font-black text-amber-500 leading-none">${qtdProx}</div>
                        <div class="text-[9px] text-gray-500">produtos</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="flex items-baseline justify-end gap-2 leading-none">
                        <span class="text-3xl font-black text-amber-500">${feitas}</span>
                        <span class="text-3xl font-black text-gray-700">${faltam}</span>
                    </div>
                    <div class="text-[9px] text-gray-500 mt-1">visitas realizadas de ${n} metas</div>
                </div>
            </div>
            <div class="relative h-10 mt-4 mb-4">
                <div class="absolute left-0 right-8 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-800"></div>
                <div class="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-amber-500 transition-all duration-500" style="width:${progresso}%"></div>
                ${caixas}
                <div class="absolute right-0 top-1/2 -translate-y-1/2 ${n > 0 && feitas === n ? 'text-amber-500' : 'text-gray-600'}"><i data-lucide="house" class="w-6 h-6"></i></div>
                <div class="absolute -bottom-4 right-0 text-[9px] text-gray-500">Meta: ${feitas}</div>
            </div>
        </div>`;
    }
    // Um card por produto; dentro, as lojas que têm esse vencimento
    function agruparPorNome(lista) {
        const mapa = new Map();
        lista.forEach(a => {
            const k = String(a.nome || '').trim().toLowerCase();
            if (!mapa.has(k)) mapa.set(k, { nome: a.nome, itens: [] });
            mapa.get(k).itens.push(a);
        });
        return [...mapa.values()];
    }
    // ---- remoção com Desfazer: remove na hora e deixa um aviso por alguns segundos para voltar atrás ----
    let remocaoDesfazer = null, remocaoTimer = null;
    function avisoRemocao(texto, desfazer) {
        clearTimeout(remocaoTimer);
        const antigo = document.getElementById('remocao-ban'); if (antigo) antigo.remove();
        remocaoDesfazer = desfazer;
        const b = document.createElement('div');
        b.id = 'remocao-ban';
        b.className = 'fixed left-4 right-4 mx-auto max-w-md z-[92] card-app p-3 flex items-center justify-between gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.7)]';
        b.style.bottom = 'calc(96px + env(safe-area-inset-bottom))';
        b.innerHTML = `<span class="text-white text-[12px] font-bold">${esc(texto)}</span><button data-act="remocaoDesfazer" class="text-amber-500 font-black uppercase text-[11px] px-2 py-1">Desfazer</button>`;
        document.body.appendChild(b);
        remocaoTimer = setTimeout(() => { remocaoDesfazer = null; b.remove(); }, 6000);
    }
    async function remocaoDesfazerAgora() {
        const f = remocaoDesfazer; remocaoDesfazer = null;
        clearTimeout(remocaoTimer);
        const b = document.getElementById('remocao-ban'); if (b) b.remove();
        if (f) { try { await f(); } catch (e) { erroDb(e); } }
    }
    // ---- indicador de sincronização no topo ----
    function sincronizacaoAtualizar(estado) {
        const el = document.getElementById('sync-ind'); if (!el) return;
        const cores = { ok: 'bg-emerald-500', fila: 'bg-amber-500', sem: 'bg-red-500' };
        const textos = { ok: 'Tudo salvo', fila: 'Enviando cadastros...', sem: 'Sem internet: os cadastros ficam no celular' };
        el.querySelector('i').className = 'inline-block w-2 h-2 rounded-full ' + cores[estado];
        el.querySelector('span').textContent = textos[estado];
        el.classList.toggle('hidden', estado === 'ok');
    }
    async function sincronizacaoVerificar() {
        if (!navigator.onLine) { sincronizacaoAtualizar('sem'); return; }
        if (!uid) { sincronizacaoAtualizar('ok'); return; }
        // se a espera pelos envios não termina logo, ainda há cadastros aguardando o servidor
        const pendente = await Promise.race([
            waitForPendingWrites(db).then(() => false),
            new Promise(r => setTimeout(() => r(true), 400)),
        ]);
        sincronizacaoAtualizar(pendente ? 'fila' : 'ok');
    }
    setInterval(sincronizacaoVerificar, 4000);
    window.addEventListener('online', sincronizacaoVerificar);
    window.addEventListener('offline', () => sincronizacaoAtualizar('sem'));
    // ---- tutorial de primeiro acesso: 3 telas, uma vez por conta ----
    const TUTORIAL_PASSOS = [
        ['Visitas e rota', 'Na tela inicial você vê as lojas do dia. Cada quadrado é uma visita: ele acende quando a visita é feita, e fica vermelho se a loja não tiver visita hoje.'],
        ['Cadastro rápido', 'Toque no botão de código no meio do menu para ler o código de barras. O produto já vem preenchido. Você só informa a validade e, se quiser, a quantidade.'],
        ['Vencidos e relatório', 'Os vencimentos aparecem agrupados por produto, com as lojas de cada um. Em Configurações você encontra o relatório, o bloco de notas e os planos.'],
    ];
    let tutorialPasso = 0;
    function tutorialAbrir() {
        tutorialPasso = 0;
        tutorialDesenhar();
    }
    function tutorialDesenhar() {
        let ov = document.getElementById('tutorial-ov');
        if (!ov) { ov = document.createElement('div'); ov.id = 'tutorial-ov'; ov.className = 'fixed inset-0 z-[97] bg-black/90 flex items-center justify-center p-4'; document.body.appendChild(ov); }
        const [titulo, texto] = TUTORIAL_PASSOS[tutorialPasso];
        const ultimo = tutorialPasso === TUTORIAL_PASSOS.length - 1;
        const pontos = TUTORIAL_PASSOS.map((_, i) => `<span class="inline-block w-2 h-2 rounded-full ${i === tutorialPasso ? 'bg-amber-500' : 'bg-gray-700'}"></span>`).join(' ');
        ov.innerHTML = `<div class="w-full max-w-sm card-app p-5">
            <div class="text-[9px] text-gray-500 font-black uppercase mb-1">${tutorialPasso + 1} de ${TUTORIAL_PASSOS.length}</div>
            <h2 class="text-white font-black italic uppercase text-lg mb-2">${esc(titulo)}</h2>
            <p class="text-[13px] text-gray-300 leading-relaxed">${esc(texto)}</p>
            <div class="flex justify-center gap-2 my-4">${pontos}</div>
            <button data-act="tutorialProximo" class="btn-amarelo">${ultimo ? 'COMEÇAR' : 'PRÓXIMO'}</button>
            <button data-act="tutorialFechar" class="w-full py-3 mt-2 text-[10px] font-black uppercase text-gray-500">Pular</button>
        </div>`;
    }
    function tutorialProximo() {
        if (tutorialPasso < TUTORIAL_PASSOS.length - 1) { tutorialPasso++; tutorialDesenhar(); }
        else tutorialFechar();
    }
    function tutorialFechar() {
        if (uid) localStorage.setItem('tutorial_visto_' + uid, '1');
        const ov = document.getElementById('tutorial-ov'); if (ov) ov.remove();
    }
    // ---- resumo do dia para compartilhar ----
    function textoResumoDoDia() {
        const hoje = isoLocal(new Date()), dia = new Date().getDay();
        const previstas = previstasDoDia(hoje);
        const semHoje = new Set(visitas.filter(v => v.data === hoje && v.semVisita).map(v => v.lojaId));
        const feitas = new Set(visitas.filter(v => v.data === hoje && !v.semVisita && !v.extra).map(v => v.lojaId));
        const ativas = previstas.filter(l => !semHoje.has(l.id));
        const feitasNaRota = ativas.filter(l => feitas.has(l.id)).length;
        const vencem = produtos.filter(p => p.data === hoje);
        const linhas = [
            `Resumo do dia ${fmtBR(hoje)} · ${userInfo && userInfo.displayName ? userInfo.displayName : 'Promotor'}`,
            `Visitas: ${feitasNaRota} de ${ativas.length} previstas` + (semHoje.size ? ` (${semHoje.size} sem visita)` : ''),
            `Vencimentos de hoje: ${vencem.length} produto(s)`,
        ];
        vencem.slice(0, 15).forEach(p => {
            const l = lojas.find(x => x.id === p.lojaId);
            linhas.push(`- ${p.nome} (${l ? l.nome : '-'}) ${p.qtd ? p.qtd + ' UN' : 'sem qtd'}`);
        });
        return linhas.join('\n');
    }
    async function compartilharResumo() {
        const texto = textoResumoDoDia();
        if (navigator.share) { try { await navigator.share({ title: 'Resumo do dia', text: texto }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
        try { await navigator.clipboard.writeText(texto); aviso('Resumo copiado. Cole no WhatsApp ou no e-mail.', { soConfirmar: true }); }
        catch (e) { aviso('Não consegui copiar o resumo. Tente de novo.', { soConfirmar: true }); }
    }
    // ---- recibos da assinatura: lidos uma vez e exibidos na tela de Configurações ----
    async function carregarRecibos() {
        const el = document.getElementById('recibos-lista'); if (!el || !uid) return;
        try {
            const snap = await getDocs(query(collection(db, 'users', uid, 'recibos'), orderBy('criadoEm', 'desc')));
            if (snap.empty) { el.textContent = 'Nenhum recibo ainda.'; return; }
            el.innerHTML = snap.docs.map(d => {
                const r = d.data(), dt = dataDeTs(r.criadoEm);
                return `<div class="flex justify-between py-1.5 border-b border-gray-800 last:border-0"><span>${dt ? dt.toLocaleDateString('pt-BR') : '-'} · ${r.tipo === 'mensal' ? 'Mensal' : 'Anual'}</span><b class="text-white">R$ ${Number(r.valor).toFixed(2).replace('.', ',')}</b></div>`;
            }).join('');
        } catch (e) { el.textContent = 'Não consegui carregar os recibos agora.'; console.warn('recibos:', e); }
    }
    // ---- envio manual do relatório aos superiores ----
    async function relatorioEnviarAgora() {
        if (!confirm('Enviar o relatório dos últimos 7 dias agora para todos os superiores com e-mail?')) return;
        try {
            const token = await auth.currentUser.getIdToken();
            const r = await fetch(API_BASE + '/api/enviar-relatorio', { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
            const j = await r.json().catch(() => ({}));
            if (r.status === 429) { aviso('Você já enviou há pouco. Aguarde 10 minutos para enviar de novo.', { soConfirmar: true }); return; }
            if (r.status === 400) { aviso('Cadastre um superior com e-mail antes de enviar.', { soConfirmar: true }); return; }
            if (!r.ok) throw new Error('api');
            aviso(`Relatório enviado para ${j.enviados} superior(es).`, { soConfirmar: true });
        } catch (e) { console.warn('relatorio manual:', e); aviso('Não consegui enviar agora. Verifique a internet e tente de novo.', { soConfirmar: true }); }
    }
    // lojas previstas de uma data: pelo dia da semana + as que foram adiadas para essa data
    function previstasDoDia(iso) {
        const dia = new Date(iso + 'T12:00:00').getDay();
        const base = lojas.filter(l => diasDaLoja(l).includes(dia));
        const extras = visitas.filter(v => v.extra && v.data === iso).map(v => lojas.find(l => l.id === v.lojaId)).filter(Boolean);
        const ids = new Set(base.map(l => l.id));
        return [...base, ...extras.filter(l => !ids.has(l.id))];
    }
    // Adiar visita: a loja fica sem visita hoje e aparece no dia escolhido (seg a sáb da mesma semana)
    function adiarAbrir(lojaId) {
        const l = lojas.find(x => x.id === lojaId); if (!l) return;
        const hoje = new Date(), w = hoje.getDay(), offset = w === 0 ? -6 : 1 - w;
        const dias = [];
        const hojeISO = isoLocal(hoje);
        for (let k = 0; k < 6; k++) { const d = new Date(hoje); d.setDate(hoje.getDate() + offset + k); const iso = isoLocal(d); dias.push({ iso, nome: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][k], passou: iso <= hojeISO }); }
        const ov = document.createElement('div');
        ov.id = 'adiar-ov'; ov.dataset.id = lojaId;
        ov.className = 'fixed inset-0 z-[95] bg-black/90 flex items-center justify-center p-4';
        ov.innerHTML = `<div class="w-full max-w-sm card-app p-5">
            <div class="text-[9px] text-gray-500 font-black uppercase mb-1">Adiar visita</div>
            <div class="text-white font-black italic uppercase text-lg mb-3">${esc(l.nome)}</div>
            <p class="text-[12px] text-gray-300 mb-3">Escolha o dia desta semana para transferir o atendimento.</p>
            <div class="grid grid-cols-3 gap-2">${dias.map(d => d.passou ? `<button disabled class="py-3 rounded-xl border border-gray-800 text-gray-600 text-[11px] font-black uppercase cursor-not-allowed">${d.nome} ${fmtBR(d.iso).slice(0, 5)}</button>` : `<button data-act="adiarEscolher" data-dia="${d.iso}" class="py-3 rounded-xl border border-amber-500/60 text-amber-500 text-[11px] font-black uppercase">${d.nome} ${fmtBR(d.iso).slice(0, 5)}</button>`).join('')}</div>
            <p class="text-[12px] font-black text-red-500 mt-4 leading-snug">O adiamento dessa loja é válido somente para essa semana. Ela retornará à rota normal na semana seguinte.</p>
            <button data-act="adiarFechar" class="w-full py-3 mt-3 text-[10px] font-black uppercase text-gray-500">Cancelar</button>
        </div>`;
        document.body.appendChild(ov);
    }
    function adiarFechar() { const ov = document.getElementById('adiar-ov'); if (ov) ov.remove(); }
    async function adiarEscolher(dia) {
        const ov = document.getElementById('adiar-ov'); if (!ov || !uid) return;
        const l = lojas.find(x => x.id === ov.dataset.id); if (!l) return;
        if (temAprovador()) {
            await pedirAprovacao('adiar', l.id, l.nome, { de: isoLocal(new Date()), para: dia });
            adiarFechar();
            return;
        }
        const hoje = isoLocal(new Date()), agora = new Date();
        const hora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
        try {
            await addDoc(collection(db, 'users', uid, 'visitas'), { lojaId: l.id, lojaNome: l.nome, data: hoje, hora, semVisita: true, motivo: 'Visita adiada para ' + fmtBR(dia), adiadaPara: dia, criadoEm: serverTimestamp() });
            await addDoc(collection(db, 'users', uid, 'visitas'), { lojaId: l.id, lojaNome: l.nome, data: dia, hora: '', semVisita: false, extra: true, adiadaDe: hoje, criadoEm: serverTimestamp() });
            adiarFechar();
            toast('Visita adiada para ' + fmtBR(dia) + '.');
        } catch (e) { erroDb(e); }
    }
    // Sem visita hoje: escolha entre registrar com motivo ou adiar a visita
    function semVisitaEscolha(lojaId) {
        const l = lojas.find(x => x.id === lojaId); if (!l) return;
        const antigo = document.getElementById('sv-escolha'); if (antigo) antigo.remove();
        const ov = document.createElement('div');
        ov.id = 'sv-escolha';
        ov.className = 'fixed inset-0 z-[95] bg-black/90 flex items-center justify-center p-4';
        ov.innerHTML = `<div class="w-full max-w-sm card-app p-5">
            <div class="text-[9px] text-gray-500 font-black uppercase mb-1">${esc(l.nome)}</div>
            <h2 class="text-white font-black italic uppercase text-lg mb-2">Esta loja não será visitada hoje</h2>
            <p class="text-[12px] text-gray-300 mb-4">Escolha uma opção:</p>
            <button data-act="semVisitaAbrir" data-id="${esc(l.id)}" class="w-full py-3 rounded-xl border border-red-600/60 text-red-400 text-[11px] font-black uppercase">Sem visita hoje (com motivo)</button>
            <button data-act="adiarAbrir" data-id="${esc(l.id)}" class="w-full py-3 mt-2 rounded-xl border border-amber-500/60 text-amber-500 text-[11px] font-black uppercase">Adiar visita</button>
            <button data-act="semVisitaEscolhaFechar" class="w-full py-3 mt-2 text-[10px] font-black uppercase text-gray-500">Cancelar</button>
        </div>`;
        document.body.appendChild(ov);
    }
    function semVisitaEscolhaFechar() { const ov = document.getElementById('sv-escolha'); if (ov) ov.remove(); }
    // ---- tamanho do texto (normal ou grande), escolhido nas Configurações ----
    function aplicarTamanhoTexto() {
        document.documentElement.style.fontSize = localStorage.getItem('texto_grande') === '1' ? '16px' : '14px';
        document.body.classList.toggle('compacto', localStorage.getItem('lista_compacta') === '1');
    }
    function compactoAlternar() { localStorage.setItem('lista_compacta', localStorage.getItem('lista_compacta') === '1' ? '0' : '1'); aplicarTamanhoTexto(); desenhar(); }
    function textoAlternar() { localStorage.setItem('texto_grande', localStorage.getItem('texto_grande') === '1' ? '0' : '1'); aplicarTamanhoTexto(); desenhar(); }
    // ---- instalar como app (Android): banner na parte de baixo, com botão Instalar e X ----
    let eventoInstalar = null;
    const INSTALAR_DIAS = 7;
    function jaInstalado() { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; }
    function instalarDispensado() { const t = Number(localStorage.getItem('instalar_fechado') || 0); return !!t && Date.now() - t < INSTALAR_DIAS * 86400000; }
    function mostrarBannerInstalar() {
        if (uid || document.getElementById('instalar-ban') || jaInstalado() || instalarDispensado()) return;
        const b = document.createElement('div');
        b.id = 'instalar-ban';
        b.className = 'fixed left-4 right-4 mx-auto max-w-md z-[90] card-app p-4 shadow-[0_12px_40px_rgba(0,0,0,0.7)]';
        b.style.bottom = 'calc(16px + env(safe-area-inset-bottom))';
        b.innerHTML = `
            <div class="flex items-start gap-3">
                <img src="robo.png" class="w-12 h-12 object-contain shrink-0" alt="">
                <div class="flex-1 min-w-0">
                    <div class="text-white font-black text-[12px] leading-tight">Instale o app</div>
                    <div class="text-gray-400 text-[10px] leading-snug mt-0.5">Acesse o Promotor Ajudante direto pela tela inicial do celular.</div>
                </div>
                <button data-act="instalarFechar" aria-label="Fechar" class="p-1 text-gray-500 shrink-0"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>
            <button data-act="instalarApp" class="mt-3 w-full py-2.5 rounded-xl bg-amber-500 text-gray-950 text-[11px] font-black uppercase">Instalar app</button>`;
        document.body.appendChild(b);
        (window.lucide && lucide.createIcons());
    }
    function instalarFechar() {
        localStorage.setItem('instalar_fechado', String(Date.now()));
        const b = document.getElementById('instalar-ban'); if (b) b.remove();
    }
    async function instalarApp() {
        if (eventoInstalar) {
            eventoInstalar.prompt();
            const r = await eventoInstalar.userChoice;
            eventoInstalar = null;
            if (r && r.outcome === 'accepted') { const b = document.getElementById('instalar-ban'); if (b) b.remove(); }
            return;
        }
        aviso('Para instalar: toque nos três pontinhos do Chrome e escolha "Instalar app" ou "Adicionar à tela inicial".', { soConfirmar: true });
    }
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); eventoInstalar = e; mostrarBannerInstalar(); });
    window.addEventListener('appinstalled', () => { const b = document.getElementById('instalar-ban'); if (b) b.remove(); });
    // Cabeçalho: some ao descer a página e volta ao subir
    function configurarCabecalhoRolagem() {
        const cab = document.querySelector('header');
        const corpo = document.getElementById('corpo');
        if (!cab || !corpo) return;
        cab.style.transition = 'margin-bottom .3s ease, opacity .3s ease';
        let ultimo = 0;
        const mostrar = () => { cab.style.marginBottom = '0px'; cab.style.opacity = '1'; cab.style.pointerEvents = ''; };
        const esconder = () => { cab.style.marginBottom = -cab.offsetHeight + 'px'; cab.style.opacity = '0'; cab.style.pointerEvents = 'none'; };
        corpo.addEventListener('scroll', () => {
            const y = corpo.scrollTop;
            if (y < 16) mostrar();
            else if (y > ultimo + 6) esconder();
            else if (y < ultimo - 6) mostrar();
            ultimo = y;
        }, { passive: true });
    }
    // ---- atalho de voz para a rota: "próxima loja" abre o endereço no Maps (ou no Waze) ----
    function proximaLojaDeHoje() {
        const hoje = isoLocal(new Date()), dia = new Date().getDay();
        const previstas = previstasDoDia(hoje).sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR'));
        const semHoje = new Set(visitas.filter(v => v.data === hoje && v.semVisita).map(v => v.lojaId));
        const feitas = new Set(visitas.filter(v => v.data === hoje && !v.semVisita && !v.extra).map(v => v.lojaId));
        return previstas.find(l => !semHoje.has(l.id) && !feitas.has(l.id)) || null;
    }
    function vozRota() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { aviso('Este navegador não aceita comando de voz. Use o Chrome do Android.', { soConfirmar: true }); return; }
        const r = new SR(); r.lang = 'pt-BR'; r.interimResults = false; r.maxAlternatives = 1;
        r.onresult = (e) => {
            const fala = String(e.results[0][0].transcript || '').toLowerCase();
            if (!/pr[oó]xima/.test(fala) || !/loja/.test(fala)) { aviso('Não entendi. Diga "próxima loja".', { soConfirmar: true }); return; }
            const l = proximaLojaDeHoje();
            if (!l) { aviso('Não há próxima loja na rota de hoje.', { soConfirmar: true }); return; }
            const end = l.endereco || l.nome;
            const url = /waze/.test(fala)
                ? `https://waze.com/ul?q=${encodeURIComponent(end)}&navigate=yes`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(end)}`;
            window.open(url, '_blank');
        };
        r.onerror = () => aviso('Não consegui ouvir. Tente de novo.', { soConfirmar: true });
        r.start();
    }
    // ---- filtro por marca na tela inicial ----
    let filtroMarcaHome = '';
    const marcaDoProduto = (p) => { const l = lojas.find(x => x.id === p.lojaId); const m = l && (l.marcas || []).find(x => x.id === p.marcaId); return m ? String(m.nome).trim() : ''; };
    function htmlChipsMarca() {
        const marcas = [...new Set(produtos.filter(p => diasAte(p.data) <= 5).map(marcaDoProduto).filter(Boolean))].sort((x, y) => x.localeCompare(y, 'pt-BR'));
        if (marcas.length < 2) return '';
        const chip = (nome, valor) => `<button data-act="filtroMarca" data-marca="${esc(valor)}" class="shrink-0 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase ${filtroMarcaHome === valor ? 'bg-amber-500 border-amber-500 text-gray-950' : 'border-gray-700 text-gray-400'}">${esc(nome)}</button>`;
        // centralizado quando cabe; quando há mais marcas, a faixa desliza para o lado
        return `<div class="overflow-x-auto no-scrollbar pb-3 mb-2"><div class="flex gap-2 w-max mx-auto px-1">${chip('Todas', '')}${marcas.map(m => chip(m, m)).join('')}</div></div>`;
    }
    function htmlHome() {
        const mes = isoLocal(new Date()).slice(0, 7);
        const n = vencidos.filter(v => (v.dataRetirada || '').startsWith(mes)).length;
        const contador = '';
        let aviso = '';
        const fim = fimTesteISO();
        if (!contaAntiga && perfilAcesso.gratis !== true && !planoPago() && fim) {
            const dias = diasAte(fim);
            if (dias >= 0 && dias <= 7) aviso = `<div class="card-app p-3 mb-3 text-[11px] text-amber-500 font-bold">Seu teste grátis termina em ${dias} ${dias === 1 ? 'dia' : 'dias'}. Escolha seu plano em Configurações.</div>`;
        }
        return aviso + contador + htmlChipsMarca() + htmlHomeBase();
    }
    function htmlHomeBase() {
        const alertas = produtos.filter(p => diasAte(p.data) <= 5 && (!filtroMarcaHome || marcaDoProduto(p) === filtroMarcaHome))
            .sort((a, b) => a.data.localeCompare(b.data) || a.nome.localeCompare(b.nome));
        const grupos = {};
        alertas.forEach(p => (grupos[p.data] = grupos[p.data] || []).push(p));
        const blocos = Object.keys(grupos).sort().map(data => {
            const d = diasAte(data), crit = d <= 0;
            const rot = d < 0 ? `VENCIDO HÁ ${-d} ${plural(-d, 'DIA', 'DIAS')}`
                : d === 0 ? 'VENCE HOJE' : d === 1 ? 'VENCE AMANHÃ' : `VENCE EM ${d} DIAS`;
            return `
            <div class="mb-6">
                <h3 class="text-[10px] font-black uppercase ${crit ? 'text-red-500 animate-pulse' : 'text-amber-500'} mb-2 italic flex items-center gap-2">
                    <i data-lucide="calendar" class="w-3 h-3"></i> ${rot}: ${fmt(data)}
                </h3>
                <div class="space-y-2">
                    ${agruparPorNome([...grupos[data]].sort(cmpAlerta)).map(g => `
                    <div class="card-app p-3 border-l-4 ${crit ? 'border-l-red-600' : 'border-l-amber-500'}">
                        <div class="text-white font-black uppercase text-sm truncate leading-tight mb-2">${esc(g.nome)}</div>
                        <div class="space-y-1">
                        ${g.itens.map(a => `
                            <div class="flex justify-between items-center gap-2 cursor-pointer" data-act="verLoja" data-id="${esc(a.lojaId)}">
                                <div class="flex-1 truncate">
                                    <span class="text-[8px] text-gray-500 font-bold uppercase">${rotuloLoja(a)}</span>
                                    <span class="${crit ? 'text-red-500' : 'text-amber-500'} font-bold text-[9px] uppercase ml-1">· ${a.semQtd ? 'SEM QTD' : esc(a.qtd) + ' UN'}</span>
                                </div>
                                <button data-act="resolver" data-id="${esc(a.id)}" class="p-1.5 bg-red-500/10 rounded-lg" aria-label="Remover (resolvido)"><i data-lucide="trash-2" class="w-3.5 h-3.5 text-red-500"></i></button>
                            </div>`).join('')}
                        </div>
                    </div>`).join('')}
                </div>
            </div>`;
        }).join('');
        return `
            ${htmlBannerPlano()}
            ${convitesPendentes().length ? `<button data-act="verConvites" class="w-full mb-3 p-3 rounded-2xl border border-amber-500 text-amber-500 text-[11px] font-black uppercase">Você tem ${convitesPendentes().length} convite(s) de agência · ver</button>` : ''}
            ${htmlResumoTopo()}
            <div class="grid grid-cols-2 gap-3 mb-6">
                <div class="bg-gray-900/50 p-3 rounded-2xl border border-gray-800 text-center">
                    <div class="text-xl font-black text-amber-500">${lojas.length}</div>
                    <div class="text-[8px] text-gray-500 font-bold uppercase">Lojas</div>
                </div>
                <div class="bg-gray-900/50 p-3 rounded-2xl border border-gray-800 text-center">
                    <div class="text-xl font-black text-red-500">${alertas.length}</div>
                    <div class="text-[8px] text-gray-500 font-bold uppercase">Alertas</div>
                </div>
            </div>
            ${blocos || '<div class="opacity-20 text-center py-10 uppercase font-black text-xs">Sem alertas</div>'}`;
    }

    function htmlLojas() {
        const itens = lojas.map(l => {
            const qtd = produtos.filter(p => p.lojaId === l.id).length;
            return `
            <div class="card-app p-3 mb-2 flex justify-between items-center">
                <div class="flex items-center gap-3 overflow-hidden">
                    <div class="flex flex-col gap-1.5 border-r border-gray-800 pr-3">
                        <button data-act="moverLoja" data-id="${esc(l.id)}" data-dir="-1" class="text-gray-600 active:text-amber-500" aria-label="Subir"><i data-lucide="circle-arrow-up" class="w-4 h-4"></i></button>
                        <button data-act="moverLoja" data-id="${esc(l.id)}" data-dir="1" class="text-gray-600 active:text-amber-500" aria-label="Descer"><i data-lucide="circle-arrow-down" class="w-4 h-4"></i></button>
                    </div>
                    <div class="flex items-center gap-2 truncate cursor-pointer" data-act="verLoja" data-id="${esc(l.id)}">
                        <div class="truncate">
                            <div class="font-black uppercase italic text-[13px] text-white leading-tight break-words pr-2">${esc(l.nome)}</div>
                            <div class="text-[8px] text-amber-500 font-bold uppercase">${(l.marcas || []).length ? (l.marcas.length + ' ' + plural(l.marcas.length, 'MARCA', 'MARCAS') + ' · ') : ''}${qtd} ${plural(qtd, 'PRODUTO', 'PRODUTOS')}</div>
                        </div>
                        <button data-act="renomearLoja" data-id="${esc(l.id)}" class="p-1 text-blue-400 opacity-60" aria-label="Renomear"><i data-lucide="pen-line" class="w-3.5 h-3.5"></i></button>
                    </div>
                </div>
                <div class="flex gap-2 ml-2">
                    <button data-act="novoProd" data-id="${esc(l.id)}" class="p-1 text-green-500" aria-label="Adicionar produto"><i data-lucide="circle-plus" class="w-5 h-5"></i></button>
                    <button data-act="delLoja" data-id="${esc(l.id)}" class="p-1 text-red-600" aria-label="Apagar loja"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                </div>
            </div>`;
        }).join('');
        return `<button data-act="addLoja" class="btn-amarelo mb-4 shadow-lg shadow-amber-500/10 text-[10px]">+ NOVA LOJA</button>${itens}`;
    }

    function resumoVenc(lista) {
        if (!lista.length) return '';
        const d = diasAte(lista.map(p => p.data).sort()[0]);
        const cor = d <= 0 ? 'text-red-500' : d <= 5 ? 'text-amber-500' : 'text-gray-500';
        const rot = d < 0 ? 'vencido' : d === 0 ? 'vence hoje' : d === 1 ? 'vence amanhã' : `vence em ${d} d`;
        return ` <span class="${cor}">· ${rot}</span>`;
    }

    // Tela da loja: lista de marcas
    function htmlLoja(id) {
        const l = lojas.find(x => x.id === id);
        if (!l) { view.lojaId = null; return htmlLojas(); }
        const meus = produtos.filter(p => p.lojaId === id);
        const cartoes = (l.marcas || []).map(m => {
            const lista = meus.filter(p => p.marcaId === m.id);
            return `
            <div class="card-app p-3 mb-2 flex justify-between items-center">
                <div class="flex-1 truncate cursor-pointer" data-act="verMarca" data-id="${esc(l.id)}" data-marca="${esc(m.id)}">
                    <div class="font-black uppercase italic text-[13px] text-white truncate">${esc(m.nome)}</div>
                    <div class="text-[8px] text-amber-500 font-bold uppercase">${lista.length} ${plural(lista.length, 'PRODUTO', 'PRODUTOS')}${resumoVenc(lista)}</div>
                </div>
                <div class="flex gap-2 ml-2">
                    <button data-act="renomearMarca" data-id="${esc(l.id)}" data-marca="${esc(m.id)}" class="p-1 text-blue-400 opacity-70" aria-label="Renomear marca"><i data-lucide="pen-line" class="w-4 h-4"></i></button>
                    <button data-act="delMarca" data-id="${esc(l.id)}" data-marca="${esc(m.id)}" class="p-1 text-red-600" aria-label="Apagar marca"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </div>`;
        }).join('');
        const sem = meus.filter(p => !p.marcaId);
        const cartaoSem = sem.length ? `
            <div class="card-app p-3 mb-2 cursor-pointer" data-act="verMarca" data-id="${esc(l.id)}" data-marca="_sem">
                <div class="font-black uppercase italic text-[13px] text-gray-400">Sem marca</div>
                <div class="text-[8px] text-amber-500 font-bold uppercase">${sem.length} ${plural(sem.length, 'PRODUTO', 'PRODUTOS')}${resumoVenc(sem)}</div>
            </div>` : '';
        return `
            <div class="flex items-center justify-between mb-6">
                <button class="flex items-center gap-2 flex-1 truncate text-left" data-act="voltarLojas">
                    <i data-lucide="chevron-left" class="w-6 h-6 text-amber-500 shrink-0"></i>
                    <h2 class="font-black uppercase text-amber-500 italic text-lg truncate">${esc(l.nome)}</h2>
                </button>
                <button data-act="addMarca" data-id="${esc(l.id)}" class="bg-amber-500 text-gray-950 px-3 py-2 rounded-xl text-[10px] font-black uppercase">+ MARCA</button>
            </div>
            ${(() => {
                const i = infoDiaLoja(l);
                const dd = diasDaLoja(l);
                // só conta visita feita em dia de atendimento da loja
                const validas = visitas.filter(v => v.lojaId === l.id && !v.semVisita && !v.extra && dd.includes(new Date(v.data + 'T12:00:00').getDay()))
                    .sort((x, y) => (y.data + y.hora).localeCompare(x.data + x.hora));
                const ult = validas[0];
                const ultTxt = ult ? `Última visita: <b class="text-gray-200">${dataBR(ult.data)} às ${ult.hora}</b>` : 'Nenhuma visita registrada';
                let acao = '';
                if (i.semHoje) acao = `<span class="px-2 py-1 rounded-md border border-red-600/50 text-red-400 text-[9px] font-bold uppercase whitespace-nowrap">Sem visita hoje</span>`;
                else if (i.visitouHoje) acao = `<span class="px-3 py-2 rounded-xl border border-green-500/60 text-green-400 text-[10px] font-black uppercase">✓ Visitada hoje às ${i.visitouHoje.hora}</span>`;
                else if (i.atendeHoje) acao = `<div class="flex flex-row gap-1.5 flex-nowrap"><button data-act="visitaRegistrar" data-id="${esc(l.id)}" class="px-2 py-1 rounded-md border border-amber-500/60 text-amber-500 text-[9px] font-bold uppercase whitespace-nowrap">Registrar visita</button>${solicitacaoPendente(l.id) ? `<span class="px-2 py-1 rounded-md border border-amber-500/60 text-amber-500 text-[9px] font-bold uppercase whitespace-nowrap">Aguardando aprovação</span>` : `<button data-act="semVisitaEscolha" data-id="${esc(l.id)}" class="px-2 py-1 rounded-md border border-red-600/50 text-red-400 text-[9px] font-bold uppercase whitespace-nowrap">Sem visita hoje</button><button data-act="adiarAbrir" data-id="${esc(l.id)}" class="px-2 py-1 rounded-md border border-gray-600 text-gray-300 text-[9px] font-bold uppercase whitespace-nowrap">Adiar visita</button>`}</div>`;
                let aviso = '';
                if (!i.dias.length) aviso = '<div class="text-[10px] text-gray-500 mt-2">Defina os dias de visita abaixo.</div>';
                else if (!i.atendeHoje && i.proximo) {
                    const dt = new Date(Date.now() + i.proximo.k * 86400000);
                    aviso = `<div class="text-[11px] text-amber-500 font-bold mt-2">Hoje não é dia de atendimento. Próximo: ${i.nomes[i.proximo.d]}, ${dataBR(isoLocal(dt))}</div>`;
                }
                const endTxt = l.endereco
                    ? `<div class="flex items-center gap-2 text-[10px] text-gray-400 mb-2"><span class="flex-1">${esc(l.endereco)}</span><button data-act="enderecoEditar" data-id="${esc(l.id)}" class="text-amber-500 p-1" aria-label="Editar endereço"><i data-lucide="pencil" class="w-3 h-3"></i></button></div>`
                    : '';
                return `<div class="card-app p-3 mb-2">${endTxt}<div class="text-[10px] text-gray-400">${ultTxt}</div><div class="text-[10px] text-gray-400 mt-1">${proximaVisitaTxt(l)}</div>${aviso}</div><div class="flex flex-wrap justify-start gap-2 mb-3">${acao}</div>`;
            })()}
${(!l.endereco || enderecoEditando === l.id) ? `
            <div class="card-app p-3 mb-3"><label class="text-[9px] text-gray-500 font-black uppercase">Endereço da loja (para a rota)</label>
                <input id="l-endereco" autocomplete="off" class="input-custom w-full mt-1" value="${esc(l.endereco || '')}" placeholder="Digite o nome da loja ou o endereço">
                <div id="l-sugestoes" class="mt-1 space-y-1"></div>
                <button data-act="enderecoSalvar" data-id="${esc(l.id)}" class="btn-amarelo mt-2">Salvar endereço</button>
                ${l.endereco ? `<button data-act="enderecoCancelar" class="w-full py-2 mt-2 text-[10px] font-black uppercase text-gray-400">Cancelar</button>` : ''}
                <div class="text-[10px] mt-2 ${l.enderecoLat != null ? 'text-green-400' : 'text-gray-500'}">${l.enderecoLat != null ? '✓ Ponto da loja salvo para a rota' : 'Ponto da loja ainda não salvo: toque abaixo estando na loja'}</div>
                <button data-act="enderecoAqui" data-id="${esc(l.id)}" class="w-full py-3 mt-2 rounded-xl border border-amber-500 text-amber-500 text-[10px] font-black uppercase">Usar minha localização aqui (estando na loja)</button></div>
            ` : ''}
            <div class="card-app p-3 mb-3"><label class="text-[9px] text-gray-500 font-black uppercase">Dias de visita</label>
                ${solicitacaoPendente(l.id, 'dias') ? '<p class="text-amber-500 text-[11px] font-bold mt-1">Aguardando aprovação da agência</p>' : ''}
                <div class="flex gap-1 mt-2">${DIAS_SEMANA.map((d, i) => `<button data-act="diaLoja" data-loja="${esc(l.id)}" data-dia="${i}" class="flex-1 py-2 rounded-xl border text-[10px] font-black ${diasDaLoja(l).includes(i) ? 'bg-amber-500 border-amber-500 text-gray-950' : 'border-gray-700 text-gray-400'}">${d.slice(0, 3)}</button>`).join('')}</div></div>
            ${cartoes}${cartaoSem}
            ${(!cartoes && !cartaoSem) ? '<div class="text-center opacity-20 py-10 font-black text-xs uppercase">Cadastre uma marca</div>' : ''}`;
    }

    // Tela da marca: produtos daquela marca nesta loja
    function htmlMarca(lojaId, marcaId) {
        const l = lojas.find(x => x.id === lojaId);
        if (!l) { view.lojaId = null; view.marcaId = null; return htmlLojas(); }
        const ehSem = marcaId === '_sem';
        const m = ehSem ? { id: '_sem', nome: 'Sem marca' } : (l.marcas || []).find(x => x.id === marcaId);
        if (!m) { view.marcaId = null; return htmlLoja(lojaId); }
        const agrupados = {};
        produtos.filter(p => p.lojaId === lojaId && doMarca(p, marcaId) && (!filtroSetor || p.setor === filtroSetor))
            .sort((a, b) => a.data.localeCompare(b.data))
            .forEach(p => {
                const k = p.nome.trim().toUpperCase();
                (agrupados[k] = agrupados[k] || { nome: p.nome, itens: [] }).itens.push(p);
            });
        const grupos = Object.values(agrupados).map(g => `
            <div class="card-app p-3" data-nome="${esc(norm(g.nome))}">
                <div class="text-amber-500 font-black uppercase italic text-[10px] mb-2 border-b border-white/5 pb-1">${esc(g.nome)}</div>
                <div class="space-y-2">
                    ${g.itens.map(it => {
                        const d = diasAte(it.data);
                        const cor = d <= 0 ? 'text-red-500' : d <= 5 ? 'text-amber-500' : 'text-gray-500';
                        const rot = d < 0 ? 'vencido' : d === 0 ? 'hoje' : d === 1 ? 'amanhã' : `em ${d} d`;
                        return `
                        <div class="flex justify-between items-center bg-gray-950/30 p-2 rounded-lg">
                            <div class="text-white font-bold text-[11px] leading-tight">${fmt(it.data)} <span class="${cor} font-black uppercase text-[9px]">· ${rot}</span>
                                <span class="text-gray-500 font-medium block">${it.semQtd ? 'Sem quantidade informada' : 'Qtd: ' + esc(it.qtd)}</span>
                            </div>
                            <div class="flex gap-3">
                                <button data-act="editProd" data-id="${esc(it.id)}" class="p-1 text-blue-400" aria-label="Editar"><i data-lucide="pen-line" class="w-4 h-4"></i></button>
                                <button data-act="delProd" data-id="${esc(it.id)}" class="p-1 text-red-500" aria-label="Remover"><i data-lucide="circle-x" class="w-4 h-4"></i></button>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>`).join('');
        return `
            <div class="flex items-center justify-between mb-6">
                <button class="flex items-center gap-2 flex-1 truncate text-left" data-act="voltarLoja">
                    <i data-lucide="chevron-left" class="w-6 h-6 text-amber-500 shrink-0"></i>
                    <div class="truncate">
                        <span class="text-[8px] text-gray-500 font-bold uppercase block leading-none mb-1">${esc(l.nome)}</span>
                        <h2 class="font-black uppercase text-amber-500 italic text-lg truncate leading-none">${esc(m.nome)}</h2>
                    </div>
                </button>
                <div class="flex items-center gap-2 shrink-0 ml-2">
                    <button data-act="relatorioMarca" data-id="${esc(l.id)}" data-marca="${esc(marcaId)}" class="flex items-center gap-1.5 border border-amber-500/50 text-amber-500 px-2.5 py-2 rounded-xl text-[10px] font-black uppercase" aria-label="Imprimir relatório da marca"><i data-lucide="printer" class="w-4 h-4"></i> Relatório</button>
                    <button data-act="novoProd" data-id="${esc(l.id)}" data-marca="${esc(marcaId)}" class="bg-amber-500 text-gray-950 px-3 py-2 rounded-xl text-[10px] font-black uppercase">+ PRODUTO</button>
                </div>
            </div>
            <div class="mb-3"><select id="f-setor" class="input-custom"><option value="">Todos os setores</option>${SETORES.map(x => `<option value="${esc(x)}" ${x === filtroSetor ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
            ${grupos ? htmlBusca() : ''}
            <div id="busca-vazio" class="hidden opacity-30 text-center py-10 uppercase font-black text-xs">Nenhum produto encontrado</div>
            <div id="lista-prod" class="space-y-3">${grupos || '<div class="text-center opacity-20 py-10 font-black text-xs uppercase">Sem produtos</div>'}</div>`;
    }

    function htmlForm() {
        const e = view.prod ? produtos.find(p => p.id === view.prod) : null;
        const p = e || { nome: '', qtd: '', data: '' };
        const sel = e ? e.lojaId : (view.preLoja || '');
        const selMarca = e ? (e.marcaId || '') : (view.preMarca && view.preMarca !== '_sem' ? view.preMarca : '');
        if (!lojas.length) {
            return `<h2 class="text-amber-500 font-black italic uppercase text-lg mb-4">Novo Produto</h2>
                <p class="text-gray-400 text-sm mb-6">Cadastre uma loja primeiro para poder adicionar produtos.</p>
                <button data-act="tab" data-id="l" class="btn-amarelo">IR PARA LOJAS</button>`;
        }
        return `
            <button class="flex items-center gap-2 mb-6" data-act="voltarForm">
                <i data-lucide="chevron-left" class="w-6 h-6 text-amber-500"></i>
                <h2 class="text-amber-500 font-black italic uppercase text-lg">${e ? 'Editar' : 'Novo'} Produto</h2>
            </button>
            <div class="space-y-4">
                <div><label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="pl">Loja Selecionada</label>
                <select id="pl" class="input-custom"><option value="">Selecionar loja...</option>${lojas.map(l => `<option value="${esc(l.id)}" ${l.id === sel ? 'selected' : ''}>${esc(l.nome)}</option>`).join('')}</select></div>
                <div><label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="pm">Marca</label>
                <div id="campo-marca">${campoMarca(sel, selMarca)}</div></div>
                <div><label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="pn">Nome do Produto</label>
                <div class="relative">
                    <input id="pn" class="input-custom" placeholder="Ex: Iogurte" maxlength="120" autocomplete="off" value="${esc(p.nome)}">
                    <div id="sug" class="hidden absolute left-0 right-0 top-full mt-1 z-20 card-app overflow-hidden shadow-2xl shadow-black"></div>
                </div></div>
                <div><label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="psetor">Setor</label>
                <select id="psetor" class="input-custom"><option value="">Selecionar setor...</option>${SETORES.map(x => `<option value="${esc(x)}" ${x === p.setor ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
                <div><label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="pcod">Código de barras (opcional)</label>
                <div class="flex gap-2"><input id="pcod" inputmode="numeric" maxlength="20" class="input-custom flex-1" placeholder="Digite ou leia" value="${esc(p.codigo || '')}">
                <button type="button" data-act="lerCodigo" class="px-4 rounded-xl border border-amber-500 text-[10px] font-black uppercase text-amber-500 whitespace-nowrap">LER</button></div></div>
                <div class="flex gap-3">
                    <div class="flex-1"><label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="pq">Quantidade</label>
                    <input id="pq" type="number" inputmode="numeric" min="0" class="input-custom ${qtdInformada(p) ? '' : 'opacity-40'}" placeholder="1" value="${qtdInformada(p) ? esc(p.qtd) : ''}" ${qtdInformada(p) ? '' : 'disabled'}>
                    <label class="flex items-center gap-2 mt-2 ml-2 text-[10px] font-black text-gray-400 uppercase"><input id="pq-informar" type="checkbox" class="accent-amber-500" ${qtdInformada(p) ? 'checked' : ''}> Informar quantidade</label></div>
                    <div class="flex-[2]"><label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="pd">Vencimento</label>
                    <input id="pd" type="date" class="input-custom" value="${esc(p.data)}"></div>
                </div>
                <button data-act="salvarProd" class="btn-amarelo mt-4">SALVAR PRODUTO</button>
                <button data-act="voltarForm" class="w-full py-3 text-[10px] font-black text-gray-500 uppercase">CANCELAR</button>
            </div>`;
    }

    function notifEstado() {
        if (!msgOk) return { txt: 'Sem suporte neste aparelho/navegador', ativo: false, suporte: false };
        if (Notification.permission === 'denied') return { txt: 'Bloqueadas no navegador', ativo: false, suporte: true };
        if (Notification.permission === 'granted' && localStorage.getItem('fcm_token')) return { txt: 'Ativas neste aparelho', ativo: true, suporte: true };
        return { txt: 'Desativadas neste aparelho', ativo: false, suporte: true };
    }

    const dataBR = (iso) => iso ? fmt(iso) : '';

    // Baixa no cadastro: procura o mesmo produto (loja + marca + nome + vencimento) e desconta a quantidade retirada
    function planejarBaixa(lojaId, marcaId, nome, dataVenc, qtd) {
        const alvo = produtos.filter(p => p.lojaId === lojaId && (p.marcaId || '') === marcaId && norm(p.nome) === norm(nome) && p.data === dataVenc);
        const cadastrado = alvo.reduce((t, p) => t + (Number(p.qtd) || 0), 0);
        let resta = qtd; const ops = [];
        for (const p of alvo) {
            if (resta <= 0) break;
            const q = Number(p.qtd) || 0;
            if (q <= resta) { ops.push(bt => bt.delete(refProd(p.id))); resta -= q; }
            else { const novo = q - resta; ops.push(bt => bt.update(refProd(p.id), { qtd: novo })); resta = 0; }
        }
        return { ops, achou: alvo.length > 0, cadastrado, excedente: resta };
    }
    function atualizarDicaBaixa() {
        const d = $('#dica-estoque'); if (!d || view.venc) return;
        const lojaId = $('#pl') ? $('#pl').value : '', sm = $('#pm'), marcaId = sm ? sm.value : '';
        const nome = $('#pn') ? $('#pn').value.trim() : '', data = $('#pd') ? $('#pd').value : '';
        const qtd = $('#pq') ? (parseInt($('#pq').value, 10) || 0) : 0;
        if (!lojaId || !marcaId || marcaId === '__nova' || !nome || !data) { d.innerHTML = ''; return; }
        const b = planejarBaixa(lojaId, marcaId, nome, data, 0);
        d.innerHTML = b.achou
            ? `Cadastrado neste vencimento: <b class="text-amber-500">${b.cadastrado} un</b>${qtd > 0 ? ` · depois da retirada: <b class="text-amber-500">${Math.max(b.cadastrado - qtd, 0)} un</b>` : ''}`
            : 'Este produto não está cadastrado com esse vencimento nesta loja e marca. Nenhuma quantidade será descontada.';
    }
    const marcasTodas = () => {           // todas as marcas cadastradas (por nome, sem repetir)
        const mapa = new Map();
        lojas.forEach(l => (l.marcas || []).forEach(m => { const k = norm(m.nome); if (k && !mapa.has(k)) mapa.set(k, m.nome); }));
        vencMes().forEach(v => { const k = norm(v.marcaNome); if (k && !mapa.has(k)) mapa.set(k, v.marcaNome); });
        return [...mapa.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    };
    const avisoRegras = () => vencErro === 'permission-denied'
        ? `<div class="card-app p-3 mb-4 border-l-4 border-l-red-600 text-[11px] text-gray-300 leading-snug"><b class="text-red-500 uppercase">Atenção:</b> as regras do Firebase ainda não liberam os registros de vencidos. Atualize as regras para poder salvar e ver esta lista.</div>` : '';

    function htmlVencForm() {
        const e = view.venc ? vencidos.find(v => v.id === view.venc) : null;
        const v = e || { nome: '', qtd: '', dataVenc: '', lojaId: '', marcaId: '' };
        const lojaSel = lojas.some(l => l.id === v.lojaId) ? v.lojaId : '';
        const marcaSel = lojaSel && marcasDe(lojaSel).some(m => m.id === v.marcaId) ? v.marcaId : '';
        if (!lojas.length) {
            return `<h2 class="text-red-500 font-black italic uppercase text-lg mb-4">Registrar Vencido</h2>
                <p class="text-gray-400 text-sm mb-6">Cadastre uma loja primeiro para poder registrar produtos vencidos.</p>
                <button data-act="tab" data-id="l" class="btn-amarelo">IR PARA LOJAS</button>`;
        }
        return `
            <button class="flex items-center gap-2 mb-6" data-act="voltarVenc">
                <i data-lucide="chevron-left" class="w-6 h-6 text-amber-500"></i>
                <h2 class="text-red-500 font-black italic uppercase text-lg">${e ? 'Editar' : 'Registrar'} Vencido</h2>
            </button>
            ${avisoRegras()}
            <div class="space-y-4">
                <div><label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="pl">Loja que foi retirado</label>
                <select id="pl" class="input-custom"><option value="">Selecionar loja...</option>${lojas.map(l => `<option value="${esc(l.id)}" ${l.id === lojaSel ? 'selected' : ''}>${esc(l.nome)}</option>`).join('')}</select></div>
                <div><label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="pm">Marca do produto</label>
                <div id="campo-marca">${campoMarca(lojaSel, marcaSel)}</div></div>
                <div><label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="pcod">Código de barras (opcional)</label>
                <div class="flex gap-2"><input id="pcod" inputmode="numeric" maxlength="20" class="input-custom flex-1" placeholder="Digite ou leia" value="${esc(v.codigo || '')}">
                <button type="button" data-act="lerCodigo" class="px-4 rounded-xl border border-amber-500 text-[10px] font-black uppercase text-amber-500 whitespace-nowrap">LER</button></div></div>
                <div><label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="pn">Nome do produto</label>
                <div class="relative">
                    <input id="pn" class="input-custom" placeholder="Ex: Iogurte" maxlength="120" autocomplete="off" value="${esc(v.nome)}">
                    <div id="sug" class="hidden absolute left-0 right-0 top-full mt-1 z-20 card-app overflow-hidden shadow-2xl shadow-black"></div>
                </div></div>
                <div class="flex gap-3">
                    <div class="flex-1"><label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="pq">Qtd retirada</label>
                    <input id="pq" type="number" inputmode="numeric" min="1" class="input-custom" placeholder="0" value="${esc(v.qtd)}"></div>
                    <div class="flex-[2]"><label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="pd">Data de vencimento</label>
                    <input id="pd" type="date" class="input-custom" value="${esc(v.dataVenc)}"></div>
                </div>
                <p id="dica-estoque" class="text-[10px] text-gray-400 ml-2 leading-snug min-h-[1rem]">${e ? 'Editar um registro não altera o estoque dos produtos.' : ''}</p>
                <input type="hidden" id="pdret" value="${e ? e.dataRetirada : isoLocal(new Date())}">
                <p class="text-[10px] text-gray-500 ml-2">Data da retirada: <b class="text-amber-500">${e ? dataBR(e.dataRetirada) : dataBR(isoLocal(new Date())) + ' (hoje)'}</b></p>
                <button type="button" data-act="toggleMotivo" class="flex items-center gap-2 ml-2 text-[10px] font-black text-amber-500 uppercase"><i data-lucide="message-square-text" class="w-4 h-4"></i> Informar o motivo <span id="motivo-rotulo" class="normal-case font-bold text-gray-500">${e && motivoObrigatorio(e.dataVenc, e.dataRetirada) ? '(obrigatório)' : '(opcional)'}</span></button>
                <div id="venc-motivo-box" class="${v.motivo ? '' : 'hidden'} space-y-1">
                    <label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="pmotivo">Motivo da retirada (produto que ainda não venceu)</label>
                    <textarea id="pmotivo" maxlength="200" rows="3" class="input-custom" placeholder="Ex: embalagem danificada, recall, produto avariado">${esc(v.motivo || '')}</textarea>
                    <p class="text-[9px] text-gray-500 ml-2">Este motivo aparece no relatório impresso.</p>
                </div>
                <button data-act="salvarVenc" class="btn-amarelo mt-2">SALVAR VENCIDO</button>
                <button data-act="salvarVenc" data-outro="1" class="w-full py-3 mt-2 rounded-xl border border-amber-500 text-[10px] font-black uppercase text-amber-500">Salvar e cadastrar outro</button>
                ${htmlResumoSemana()}
                <button data-act="voltarVenc" class="w-full py-3 text-[10px] font-black text-gray-500 uppercase">CANCELAR</button>
            </div>`;
    }

    function htmlRelVenc() {
        const marcas = marcasTodas();
        const lista = vencMes().filter(v => !filtroVenc || norm(v.marcaNome) === filtroVenc)
            .sort((a, b) => (b.dataRetirada || '').localeCompare(a.dataRetirada || '') || a.nome.localeCompare(b.nome));
        const grupos = new Map();
        lista.forEach(v => { const k = norm(v.marcaNome) || '_'; if (!grupos.has(k)) grupos.set(k, { nome: v.marcaNome || 'Sem marca', itens: [] }); grupos.get(k).itens.push(v); });
        const blocos = [...grupos.values()].sort((a, b) => a.nome.localeCompare(b.nome)).map(g => `
            <div class="mb-5">
                <h3 class="text-[10px] font-black uppercase text-amber-500 mb-2 italic flex items-center gap-2"><i data-lucide="tag" class="w-3 h-3"></i> ${esc(g.nome)}</h3>
                <div class="space-y-2">
                    ${g.itens.map(v => `
                    <div class="card-app p-3 border-l-4 border-l-red-600">
                        <div class="flex justify-between items-start gap-2">
                            <div class="flex-1 min-w-0">
                                <div class="text-white font-black italic uppercase text-xs leading-tight">${esc(v.nome)}</div>
                                <div class="text-[9px] text-gray-500 font-bold uppercase mt-1 truncate">Loja: ${esc(v.lojaNome || '-')}</div>
                            </div>
                            <div class="text-right shrink-0">
                                <div class="text-[8px] text-gray-500 font-bold uppercase leading-none">Qtd retirada</div>
                                <div class="text-amber-500 font-black text-lg leading-none mt-1">${esc(v.qtd)}</div>
                            </div>
                        </div>
                        ${v.motivo ? `<div class="text-[10px] text-amber-400 mt-2 leading-snug"><b class="uppercase text-[9px]">Motivo:</b> ${esc(v.motivo)}</div>` : ''}
                        <div class="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                            <div class="text-[10px] text-gray-400 leading-snug">Retirada: <b class="text-white">${dataBR(v.dataRetirada)}</b><br>Vencimento: <b class="text-white">${dataBR(v.dataVenc)}</b></div>
                            <div class="flex gap-3">
                                <button data-act="editVenc" data-id="${esc(v.id)}" class="p-1 text-blue-400" aria-label="Editar"><i data-lucide="pen-line" class="w-4 h-4"></i></button>
                                <button data-act="delVenc" data-id="${esc(v.id)}" class="p-1 text-red-500" aria-label="Apagar"><i data-lucide="circle-x" class="w-4 h-4"></i></button>
                            </div>
                        </div>
                    </div>`).join('')}
                </div>
            </div>`).join('');
        return `
            <div class="flex items-center justify-between mb-5">
                <button class="flex items-center gap-2 flex-1 truncate text-left" data-act="tab" data-id="c">
                    <i data-lucide="chevron-left" class="w-6 h-6 text-amber-500 shrink-0"></i>
                    <h2 class="font-black uppercase text-amber-500 italic text-lg truncate">Relatório de Vencidos</h2>
                </button>
            </div>
            ${avisoRegras()}
            <p class="text-[10px] text-gray-500 leading-snug mb-4">Registros de <b class="text-amber-500">${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</b>. Eles ficam disponíveis até <b class="text-white">${dataBR(ultimoDiaDoMes())}</b> e são apagados automaticamente a partir do dia 1º do mês seguinte. Baixe o relatório antes.</p>
            ${diasParaFimDoMes() <= 3 ? `<div class="card-app p-3 mb-4 border-l-4 border-l-red-600 text-[11px] text-gray-300 leading-snug"><b class="text-red-500 uppercase">${diasParaFimDoMes() === 0 ? 'Hoje é o último dia do mês' : 'Faltam ' + diasParaFimDoMes() + ' ' + plural(diasParaFimDoMes(), 'dia', 'dias') + ' para o fim do mês'}:</b> baixe o relatório de vencidos agora. Depois disso os registros serão apagados.</div>` : ''}
            <div class="flex gap-2 mb-4">
                <button data-act="novoVencido" class="flex-1 bg-amber-500 text-gray-950 py-3 rounded-xl text-[10px] font-black uppercase">+ Vencido</button>
                <button data-act="relatorioVenc" class="flex-1 flex items-center justify-center gap-1.5 border border-amber-500/50 text-amber-500 py-3 rounded-xl text-[10px] font-black uppercase"><i data-lucide="printer" class="w-4 h-4"></i> Relatório</button>
            </div>
            <div class="mb-5"><label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="fm">Marca</label>
            <select id="fm" class="input-custom"><option value="">Todas as marcas</option>${marcas.map(([k, n]) => `<option value="${esc(k)}" ${k === filtroVenc ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div>
            ${blocos || '<div class="opacity-20 text-center py-10 uppercase font-black text-xs">Nenhum vencido registrado</div>'}`;
    }

    /* ---- Configurações em grupos: Minha conta, Informativos e lojas, Superiores, Preferências ---- */
    let contaSub = null;
    function htmlConta() {
        const voltar = `<button data-act="contaSub" data-sub="" class="text-amber-500 text-[11px] font-black uppercase mb-3">← Configurações</button>`;
        const menu = (sub, titulo, desc) => `<button data-act="contaSub" data-sub="${sub}" class="card-app w-full p-4 mb-3 flex items-center justify-between text-left"><div><div class="text-white font-black italic uppercase text-sm">${titulo}</div><div class="text-gray-500 text-[11px] mt-1">${desc}</div></div><i data-lucide="chevron-right" class="w-5 h-5 text-amber-500"></i></button>`;
        if (contaSub === 'conta') return `${voltar}
            <h2 class="text-amber-500 font-black italic uppercase text-lg mb-3">Minha conta</h2>
            <div class="card-app p-4 mb-3">
                <div class="text-[9px] text-gray-500 font-black uppercase mb-1">Promotor</div>
                <div class="text-white font-black italic uppercase text-sm truncate">${esc((userInfo && userInfo.displayName) || 'Sem nome')}</div>
                <div class="text-gray-400 text-xs truncate">${esc(userInfo && userInfo.email)}</div>
            </div>
            ${htmlPlano()}
            ${htmlAcaoCard('Resumo', 'Resumo do dia', 'Retiradas e cadastros por dia', 'resumoAbrir')}
            ${htmlAcaoCard('Rota', 'Rota do dia', 'Ordem das lojas de hoje, pela distância', 'abrirRota')}`;
        if (contaSub === 'info') return `${voltar}
            <h2 class="text-amber-500 font-black italic uppercase text-lg mb-3">Informativos e lojas</h2>
            ${htmlAcaoCard('Registros', 'Relatório de vencidos', `${vencMes().length} ${plural(vencMes().length, 'item retirado', 'itens retirados')} neste mês`, 'abrirRelVenc')}
            ${htmlAcaoCard('Dados', 'Exportar planilha', 'Produtos e vencidos em CSV', 'exportarDados')}
            ${htmlAcaoCard('Relatório', 'Relatório em PDF', 'Vencidos do mês para imprimir ou salvar', 'exportarPdf')}
            ${htmlAcaoCard('Lojas', 'Planograma lojas', lojas.length + ' lojas', 'planogramaAbrir')}`;
        if (contaSub === 'sup') return `${voltar}
            <h2 class="text-amber-500 font-black italic uppercase text-lg mb-3">Superiores e relatório</h2>
            ${superiores.length ? superiores.map(s => `<div class="card-app p-4 mb-3"><div class="text-white font-black italic uppercase text-sm truncate">${esc(s.nome || s.email || 'Superior')}</div><div class="text-gray-400 text-xs truncate">${esc(s.email || '')}</div></div>`).join('') : '<p class="text-gray-500 text-sm mb-3">Nenhum superior cadastrado.</p>'}
            ${htmlAcaoCard('Relatório', 'Relatório semanal', 'Enviar e configurar os superiores', 'superioresAbrir')}`;
        if (contaSub === 'pref') return `${voltar}${htmlContaCompleta()}`;
        return `
            <h2 class="text-amber-500 font-black italic uppercase text-lg mb-4">Configurações</h2>
            ${menu('conta', 'Minha conta', 'Nome, plano, resumo do dia e rota')}
            ${menu('info', 'Informativos e lojas', 'Vencidos, planilha, PDF e planograma')}
            ${menu('sup', 'Superiores e relatório', 'Quem recebe o relatório semanal')}
            ${menu('pref', 'Preferências e ajuda', 'Notificações, texto, avaliação e conta')}`;
    }

    function htmlContaCompleta() {
        const n = notifEstado();
        return `
            <h2 class="text-amber-500 font-black italic uppercase text-lg mb-2">Minha Conta</h2>
            <p class="text-[11px] font-bold text-white mb-4">Visitas hoje: ${(() => { const hoje = isoLocal(new Date()), dia = new Date().getDay(); const previstas = previstasDoDia(hoje).filter(l => !visitas.some(v => v.lojaId === l.id && v.data === hoje && v.semVisita)); return new Set(visitas.filter(v => v.data === hoje && previstas.some(l => l.id === v.lojaId)).map(v => v.lojaId)).size; })()} de ${lojas.filter(l => diasDaLoja(l).includes(new Date().getDay())).length} previstas</p>
            <p class="text-[11px] text-gray-400 mb-4">${(() => { const mes = isoLocal(new Date()).slice(0, 7); const n = vencidos.filter(v => (v.dataRetirada || '').startsWith(mes)).length; return `${n} ${n === 1 ? 'retirada' : 'retiradas'} neste mês`; })()}</p>
            ${htmlPlano()}
            ${jaInstalado() ? '' : `<button data-act="instalarApp" class="card-app p-4 mb-4 w-full text-left block"><div class="text-[9px] text-gray-500 font-black uppercase mb-1">Aplicativo</div><p class="text-[12px] text-gray-300">Instale o Promotor Ajudante na tela inicial do celular.</p></button>`}
            <button data-act="compactoAlternar" class="card-app p-4 mb-4 w-full text-left block"><div class="text-[9px] text-gray-500 font-black uppercase mb-1">Lista compacta</div><p class="text-[12px] text-gray-300">${localStorage.getItem('lista_compacta') === '1' ? 'Ativada (toque para desativar)' : 'Desativada (toque para ativar)'}</p></button>
            <button data-act="textoAlternar" class="card-app p-4 mb-4 w-full text-left block"><div class="text-[9px] text-gray-500 font-black uppercase mb-1">Tamanho do texto</div><p class="text-[12px] text-gray-300">${localStorage.getItem('texto_grande') === '1' ? 'Grande (toque para normal)' : 'Normal (toque para grande)'}</p></button>
            <button data-act="compartilharResumo" class="card-app p-4 mb-4 w-full text-left block"><div class="text-[9px] text-gray-500 font-black uppercase mb-1">Resumo do dia</div><p class="text-[12px] text-gray-300">Enviar visitas e vencimentos de hoje pelo WhatsApp ou e-mail.</p></button>
            <button data-act="notasAbrir" class="card-app p-4 mb-4 w-full text-left block"><div class="text-[9px] text-gray-500 font-black uppercase mb-1">Bloco de notas</div><p class="text-[12px] text-gray-300">Anote suas ideias. Ficam salvas por <b class="text-red-500">12 horas</b>.</p></button>
            <div class="card-app p-4 mb-3">
                <div class="text-[9px] text-gray-500 font-black uppercase mb-1">Promotor</div>
                <div class="text-white font-black italic uppercase text-sm truncate">${esc((userInfo && userInfo.displayName) || 'Sem nome')}</div>
                <div class="text-gray-400 text-xs truncate">${esc(userInfo && userInfo.email)}</div>
            </div>
            <button data-act="abrirRelVenc" class="card-app w-full p-4 mb-3 flex items-center justify-between text-left">
                <div>
                    <div class="text-[9px] text-gray-500 font-black uppercase mb-1">Registros</div>
                    <div class="text-white font-black italic uppercase text-sm">Relatório de vencidos</div>
                    <div class="text-gray-500 text-[11px]">${vencMes().length} ${plural(vencMes().length, 'item retirado', 'itens retirados')} neste mês${diasParaFimDoMes() <= 3 ? ' · <b class="text-red-500">zera após ' + dataBR(ultimoDiaDoMes()) + '</b>' : ''}</div>
                </div>
                <i data-lucide="chevron-right" class="w-5 h-5 text-amber-500"></i>
            </button>
            ${htmlAcaoCard('Produtos', 'Código de barras cadastrados', produtos.filter(p => p.codigo).length + ' códigos', 'codigosAbrir')}
            ${htmlAcaoCard('Dados', 'Exportar planilha', 'Produtos e vencidos em CSV', 'exportarDados')}
            ${htmlAcaoCard('Relatório', 'Relatório em PDF', 'Vencidos do mês para imprimir ou salvar', 'exportarPdf')}
            ${htmlAcaoCard('Lojas', 'Planograma lojas', lojas.length + ' lojas', 'planogramaAbrir')}
            ${htmlAcaoCard('Resumo', 'Resumo do dia', 'Retiradas e cadastros por dia', 'resumoAbrir')}
            ${htmlConvites()}
            ${htmlAcaoCard('Rota', 'Rota do dia', 'Ordem das lojas de hoje, pela distância', 'abrirRota')}
            ${htmlAcaoCard('Relatório', 'Superiores e relatório semanal', superiores.length + ' superiores', 'superioresAbrir')}
            ${htmlAvaliacao()}
            <div class="card-app p-4 mb-3">
                <div class="flex items-center gap-2 mb-1">
                    <i data-lucide="${n.ativo ? 'bell' : 'bell-off'}" class="w-4 h-4 ${n.ativo ? 'text-amber-500' : 'text-gray-500'}"></i>
                    <div class="text-[9px] text-gray-500 font-black uppercase">Notificações de vencimento</div>
                </div>
                <div class="text-white font-bold text-sm mb-2">${n.txt}</div>
                <p class="text-gray-500 text-[11px] leading-snug mb-3">Você recebe um aviso pela manhã sobre os produtos que vencem nos dias escolhidos abaixo e no dia do vencimento.</p>
                ${n.suporte ? (n.ativo
                    ? '<button data-act="notifOff" class="w-full py-3 rounded-xl border border-gray-700 text-[10px] font-black uppercase text-gray-400">DESATIVAR NESTE APARELHO</button>'
                    : '<button data-act="notifOn" class="btn-amarelo">ATIVAR NOTIFICAÇÕES</button>')
                    : '<p class="text-[11px] text-gray-500">No iPhone, abra o site no Safari, toque em Compartilhar e em "Adicionar à Tela de Início". Depois abra o app pelo ícone e ative aqui.</p>'}
            </div>
            <div class="card-app p-4 mb-3">
                <div class="text-[9px] text-gray-500 font-black uppercase mb-3">Notificação em (dias antes):</div>
                <div class="flex gap-2 mb-3">
                    ${[1, 2, 3, 4, 5].map(n => { const on = diasAviso.includes(n); return `
                    <button data-act="alternarDia" data-dia="${n}" aria-pressed="${on}" aria-label="${n} ${n === 1 ? 'dia' : 'dias'} antes" class="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border ${on ? 'bg-amber-500 text-gray-950 border-amber-500' : 'bg-gray-900/60 text-gray-500 border-gray-700'}">
                        <i data-lucide="${on ? 'bell-ring' : 'bell'}" class="w-4 h-4"></i>
                        <span class="text-xl font-black leading-none">${n}</span>
                        <span class="text-[8px] font-black uppercase leading-none">${n === 1 ? 'dia' : 'dias'}</span>
                    </button>`; }).join('')}
                </div>
                <p class="text-gray-500 text-[11px] leading-snug">${diasAviso.length
                    ? `Você será avisado <b class="text-amber-500">${diasAviso.length === 1 ? diasAviso[0] + (diasAviso[0] === 1 ? ' dia' : ' dias') : diasAviso.slice(0, -1).join(', ') + ' e ' + diasAviso[diasAviso.length - 1] + ' dias'}</b> antes do vencimento e também no dia do vencimento.`
                    : 'Nenhum dia selecionado: você receberá só o aviso no dia do vencimento.'}</p>
            </div>
            <button data-act="abrirCap" class="card-app w-full p-4 mb-3 flex items-center justify-between text-left">
                <div class="flex items-center gap-3">
                    <span class="text-amber-500"><i data-lucide="headset" class="w-7 h-7"></i></span>
                    <div><div class="text-white font-black italic uppercase text-sm">CAP</div><div class="text-gray-500 text-[11px]">Central de Atendimento ao Promotor</div></div>
                </div>
                <i data-lucide="chevron-right" class="w-5 h-5 text-amber-500"></i>
            </button>
            <button data-act="toggleContraste" class="w-full py-3 text-[10px] font-black text-gray-400 uppercase">Alto contraste: ${localStorage.getItem('altoContraste') === '1' ? 'ligado' : 'desligado'}</button>
            
            <button data-act="desfazerUltimo" class="w-full py-3 text-[10px] font-black text-gray-400 uppercase">Desfazer último cadastro</button>
            <button data-act="excluirConta" class="w-full py-3 text-[10px] font-black text-red-500 uppercase">EXCLUIR MINHA CONTA</button>
            <button data-act="redefinirAbrir" class="w-full py-2 text-[10px] font-bold text-gray-600 uppercase">Redefinir senha</button>
            <button data-act="legal" data-aba="termos" class="w-full py-3 text-[10px] font-black text-gray-500 uppercase">TERMOS, PRIVACIDADE E REEMBOLSO</button>
            <button data-act="sair" class="w-full py-4 rounded-xl border border-red-900/50 text-[10px] font-black uppercase text-red-500 mt-2">SAIR DA CONTA</button>
            <p class="text-center text-[9px] text-gray-700 mt-6 uppercase font-bold">Promotor Ajudante · ${VERSAO_APP}</p>
            <div class="text-center mt-8 mb-2 select-none pointer-events-none" style="opacity:.5">
                <div class="text-[9px] text-gray-500 font-bold tracking-widest">Designed and created by:</div>
                <img src="data:image/png;base64,${ASSINATURA}" alt="Melo Staff" class="mx-auto mt-2" style="width:130px;height:auto">
            </div>`;
    }

    /* ================= ações ================= */
    function chunkOps(ops) {
        const execs = [];
        for (let i = 0; i < ops.length; i += 400) {
            const b = writeBatch(db);
            ops.slice(i, i + 400).forEach(f => f(b));
            execs.push(b.commit());
        }
        return Promise.all(execs);
    }

    const acoes = {
        tab: (d) => ir(d.id),
        verLoja: (d) => ir('l', { lojaId: d.id }),
        voltarLojas: () => ir('l'),
        addLoja: () => aviso('NOME DA NOVA LOJA:', { input: '', ok: n => {
            if (n) addDoc(colLojas(), { nome: n.slice(0, 80), ordem: Date.now(), criadoEm: serverTimestamp() }).catch(erroDb);
        }}),
        renomearLoja: (d) => {
            const l = lojas.find(x => x.id === d.id); if (!l) return;
            aviso('EDITAR NOME DA LOJA:', { input: l.nome, ok: n => { if (n) updateDoc(refLoja(l.id), { nome: n.slice(0, 80) }).catch(erroDb); } });
        },
        moverLoja: (d) => {
            const i = lojas.findIndex(x => x.id === d.id), j = i + Number(d.dir);
            if (i < 0 || j < 0 || j >= lojas.length) return;
            const a = lojas[i], b = lojas[j];
            let oa = a.ordem, ob = b.ordem;
            if (oa === ob) ob = oa + (j > i ? 1 : -1);
            chunkOps([bt => bt.update(refLoja(a.id), { ordem: ob }), bt => bt.update(refLoja(b.id), { ordem: oa })]).catch(erroDb);
        },
        delLoja: (d) => {
            const l = lojas.find(x => x.id === d.id); if (!l) return;
            const dela = produtos.filter(p => p.lojaId === l.id);
            aviso(`APAGAR <b>${esc(l.nome)}</b>${dela.length ? ` E ${dela.length} ${plural(dela.length, 'PRODUTO', 'PRODUTOS')}` : ''}?`, { ok: () => {
                const ops = dela.map(p => bt => bt.delete(refProd(p.id)));
                ops.push(bt => bt.delete(refLoja(l.id)));
                chunkOps(ops).catch(erroDb);
            }});
        },
        voltarLoja: () => ir('l', { lojaId: view.lojaId }),
        limparBusca: () => { const i = $('#busca'); if (i) { i.value = ''; atualizarBusca(); i.focus(); } },
        relatorioMarca: (d) => imprimirRelatorio(d.id, d.marca),
        novoVencido: () => ir('v', { de: view.tab === 'r' ? 'r' : 'h' }),
        novoProdutoTopo: () => ir('p', { preLoja: '', preMarca: '', origem: null, origemMarca: null }),
        filtroMarca: (d) => { filtroMarcaHome = d.marca || ''; desenhar(); },
        vozRota: () => vozRota(), exportarPdf: () => exportarPdf(), pdvLojaConfirmar: () => pdvLojaConfirmar(), pdvLojaCancelar: () => pdvLojaCancelar(), contaSub: (d) => { contaSub = d.sub || null; desenhar(); }, compactoAlternar: () => compactoAlternar(), semVisitaEscolha: (d) => semVisitaEscolha(d.id), semVisitaEscolhaFechar: () => semVisitaEscolhaFechar(), adiarAbrir: (d) => { semVisitaEscolhaFechar(); adiarAbrir(d.id); }, adiarEscolher: (d) => adiarEscolher(d.dia), adiarFechar: () => adiarFechar(), relatorioEnviarAgora: () => relatorioEnviarAgora(),
        cadTipo: (d) => { const s = capturarFormCadastro(); scanPendente = s; marcaPendente = s.marcaNome || null; ir(d.tipo, { preLoja: s.lojaId || '' }); setTimeout(aplicarScanPendente, 0); },
        abrirRelVenc: () => ir('r'),
        voltarVenc: () => (view.venc || view.de === 'r') ? ir('r') : ir('h'),
        editVenc: (d) => ir('v', { venc: d.id, de: 'r' }),
        delVenc: (d) => aviso('APAGAR ESTE REGISTRO DE VENCIDO?', { ok: () => {
            const item = vencidos.find(x => x.id === d.id);
            deleteDoc(refVenc(d.id)).then(() => { if (item) mostrarDesfazer('Registro apagado', () => setDoc(refVenc(item.id), semId(item))); }).catch(erroVenc);
        } }),
        salvarVenc: (d = {}) => {
            const nome = $('#pn').value.trim(), dataVenc = $('#pd').value, lojaId = $('#pl').value;
            const sm = $('#pm'), marcaId = sm ? sm.value : '';
            const qtd = parseInt($('#pq').value, 10);
            const motivo = ($('#pmotivo') ? $('#pmotivo').value.trim() : '').slice(0, 200);
            const codVenc = ($('#pcod') ? $('#pcod').value : '').replace(/[^0-9A-Za-z]/g, '');
            if (codVenc && !/^[0-9A-Za-z]{6,20}$/.test(codVenc)) return aviso('CÓDIGO DE BARRAS INVÁLIDO!', { soConfirmar: true });
            const marcaNomeVenc = ((lojas.flatMap(l => l.marcas || [])).find(m => m.id === marcaId) || {}).nome || null;
            if (codVenc) registrarNomeCodigo(codVenc, { nome, setor: null, marcaNome: marcaNomeVenc });
            if (!nome || !dataVenc || !lojaId) return aviso('PREENCHA TODOS OS CAMPOS!', { soConfirmar: true });
            if (!marcaId) return aviso('ESCOLHA OU CADASTRE A MARCA!', { soConfirmar: true });
            if (!(qtd >= 1)) return aviso('INFORME A QUANTIDADE RETIRADA!', { soConfirmar: true });
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dataVenc)) return aviso('DATA INVÁLIDA!', { soConfirmar: true });
            const dataRet = $('#pdret') ? $('#pdret').value : isoLocal(new Date());
            if (motivoObrigatorio(dataVenc, dataRet) && !motivo) {
                atualizarMotivoObrigatorio();
                if ($('#pmotivo')) $('#pmotivo').focus();
                return aviso('O MOTIVO É OBRIGATÓRIO PARA VALIDADE A PARTIR DE 3 DIAS APÓS A RETIRADA.', { soConfirmar: true });
            }
            const dados = {
                nome: nome.slice(0, 120), qtd, dataVenc, lojaId, marcaId, motivo, codigo: codVenc || null,
                lojaNome: nomeLoja(lojaId), marcaNome: sm.options[sm.selectedIndex].text,
            };
            if (view.venc) {
                updateDoc(refVenc(view.venc), dados).catch(erroVenc);
                ir('r');
                return;
            }
            // Novo vencido: registra e desconta do cadastro do produto no mesmo envio (ou tudo, ou nada)
            const baixa = planejarBaixa(lojaId, marcaId, nome, dataVenc, qtd);
            chunkOps([
                bt => bt.set(doc(colVenc()), { ...dados, dataRetirada: isoLocal(new Date()), criadoEm: serverTimestamp() }),
                ...baixa.ops,
            ]).catch(erroVenc);
            registrarVisitaAuto(lojaId);
            const outro = d.outro === '1';
            if (outro) limparFormVenc(); else ir('r');
            const nm = `<b>${esc(dados.nome)}</b>`;
            let msg;
            if (!baixa.achou) msg = `Vencido registrado.<br><br>O produto ${nm} não foi encontrado no cadastro desta loja e marca com o vencimento ${dataBR(dataVenc)}, então <b>nenhuma quantidade foi descontada</b>.`;
            else if (baixa.excedente > 0) msg = `Vencido registrado.<br><br>Havia só <b>${baixa.cadastrado} un</b> de ${nm} cadastradas neste vencimento. Todas foram retiradas do cadastro (você informou ${qtd} un).`;
            else if (baixa.cadastrado === qtd) msg = `Vencido registrado.<br><br>As <b>${qtd} un</b> de ${nm} foram retiradas e o item saiu do cadastro, porque o estoque deste vencimento zerou.`;
            else msg = `Vencido registrado.<br><br>Foram descontadas <b>${qtd} un</b> de ${nm}. Restam <b>${baixa.cadastrado - qtd} un</b> neste vencimento.`;
            toast(msg);
        },
        toggleMotivo: () => {
            const box = $('#venc-motivo-box'); if (!box) return;
            box.classList.toggle('hidden');
            if (!box.classList.contains('hidden')) $('#pmotivo').focus();
        },
        relatorioVenc: () => {
            const motivosRel = [...new Set(vencidos.map(v => (v.motivo || '').trim()).filter(Boolean))].sort().map(m => `<option value="${esc(m)}">${esc(m)}</option>`).join('');
            const marcas = new Map();
            vencMes().forEach(v => { const k = norm(v.marcaNome) || '_'; if (!marcas.has(k)) marcas.set(k, v.marcaNome || 'Sem marca'); });
            if (!marcas.size) return aviso('NÃO HÁ VENCIDOS REGISTRADOS NESTE MÊS PARA GERAR RELATÓRIO.', { soConfirmar: true });
            const opMarcas = [...marcas.entries()].sort((a, b) => a[1].localeCompare(b[1])).map(([k, n]) => `<option value="${esc(k)}" ${k === filtroVenc ? 'selected' : ''}>${esc(n)}</option>`).join('');
            const opPeriodos = PERIODOS.map(([k, nome]) => {
                const f = faixaPeriodo(k), dm = (iso) => iso.slice(8) + '/' + iso.slice(5, 7);
                const rotulo = (k === 'dia' || k === 'ontem') ? dm(f.fim) : k === 'datas' ? 'escolher no calendário' : dm(f.ini) + ' a ' + dm(f.fimRot);
                return `<option value="${k}">${nome} · ${rotulo}</option>`;
            }).join('');
            const rot = 'class="block text-[9px] text-gray-500 font-black uppercase mt-4 mb-1"';
            aviso(`<label ${rot}>Marca</label><select id="rel-marca" class="input-custom">${opMarcas}</select>
                   <label ${rot}>Período</label><select id="rel-periodo" class="input-custom">${opPeriodos}</select>
                   <label ${rot}>Ação</label><select id="rel-acao" class="input-custom"><option value="imprimir">Imprimir ou salvar PDF</option><option value="compartilhar">Compartilhar PDF (WhatsApp)</option></select>
                   <label ${rot}>Motivo</label><select id="rel-motivo" class="input-custom"><option value="">Todos os motivos</option>${motivosRel}</select>`, {
                titulo: 'BAIXAR RELATÓRIO DE VENCIDOS',
                ok: () => { const c = $('#rel-marca').value, per = $('#rel-periodo').value; relAcao = $('#rel-acao').value; relMotivo = $('#rel-motivo').value; if (per === 'datas') abrirCalendario(c); else imprimirVencidos(c, per); },
            });
        },
        pickSug: (d) => {
            $('#pn').value = d.nome;
            const box = $('#sug'); box.classList.add('hidden'); box.innerHTML = '';
            const q = $('#pq'); if (q) q.focus();
            if (view.tab === 'v') atualizarDicaBaixa();
        },
        novaMarcaForm: () => {
            const lojaId = $('#pl') ? $('#pl').value : '';
            const l = lojas.find(x => x.id === lojaId);
            if (!l) return aviso('ESCOLHA A LOJA PRIMEIRO.', { soConfirmar: true });
            const restaurar = () => refreshCampoMarca(lojaId, ultimaMarca);
            aviso(`NOVA MARCA EM <b>${esc(l.nome)}</b>:`, { input: '', cancel: restaurar, ok: n => {
                if (!n) return restaurar();
                const marcas = l.marcas || [];
                const igual = marcas.find(m => m.nome.toLowerCase() === n.toLowerCase());
                if (igual) return refreshCampoMarca(lojaId, igual.id);
                const nova = { id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), nome: n.slice(0, 60) };
                updateDoc(refLoja(l.id), { marcas: [...marcas, nova] }).catch(erroDb);
                refreshCampoMarca(lojaId, nova.id, [nova]);
            }});
        },
        verMarca: (d) => ir('l', { lojaId: d.id, marcaId: d.marca }),
        addMarca: (d) => {
            const l = lojas.find(x => x.id === d.id); if (!l) return;
            aviso('NOME DA MARCA:', { input: '', ok: n => {
                if (!n) return;
                const marcas = l.marcas || [];
                if (marcas.some(m => m.nome.toLowerCase() === n.toLowerCase())) return aviso('ESSA MARCA JÁ EXISTE NESTA LOJA.', { soConfirmar: true });
                const nova = { id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), nome: n.slice(0, 60) };
                updateDoc(refLoja(l.id), { marcas: [...marcas, nova] }).catch(erroDb);
            }});
        },
        renomearMarca: (d) => {
            const l = lojas.find(x => x.id === d.id); if (!l) return;
            const marcas = l.marcas || [], m = marcas.find(x => x.id === d.marca); if (!m) return;
            aviso('EDITAR NOME DA MARCA:', { input: m.nome, ok: n => {
                if (!n) return;
                if (marcas.some(x => x.id !== m.id && x.nome.toLowerCase() === n.toLowerCase())) return aviso('ESSA MARCA JÁ EXISTE NESTA LOJA.', { soConfirmar: true });
                updateDoc(refLoja(l.id), { marcas: marcas.map(x => x.id === m.id ? { ...x, nome: n.slice(0, 60) } : x) }).catch(erroDb);
            }});
        },
        delMarca: (d) => {
            const l = lojas.find(x => x.id === d.id); if (!l) return;
            const marcas = l.marcas || [], m = marcas.find(x => x.id === d.marca); if (!m) return;
            const dela = produtos.filter(p => p.lojaId === l.id && p.marcaId === m.id);
            aviso(`APAGAR <b>${esc(m.nome)}</b>${dela.length ? ` E ${dela.length} ${plural(dela.length, 'PRODUTO', 'PRODUTOS')}` : ''}?`, { ok: () => {
                const ops = dela.map(p => bt => bt.delete(refProd(p.id)));
                ops.push(bt => bt.update(refLoja(l.id), { marcas: marcas.filter(x => x.id !== m.id) }));
                chunkOps(ops).catch(erroDb);
            }});
        },
        novoProd: (d) => ir('p', { preLoja: d.id, preMarca: d.marca || '', origem: (view.tab === 'l' && view.lojaId) ? view.lojaId : null, origemMarca: view.marcaId || null }),
        editProd: (d) => { const p = produtos.find(x => x.id === d.id); if (p) ir('p', { prod: p.id, origem: p.lojaId, origemMarca: p.marcaId || '_sem' }); },
        voltarForm: () => view.origem ? ir('l', { lojaId: view.origem, marcaId: view.origemMarca }) : ir('h'),
        delProd: (d) => aviso('REMOVER ITEM?', { ok: () => {
            const item = produtos.find(x => x.id === d.id);
            deleteDoc(refProd(d.id)).then(() => { if (item) mostrarDesfazer('Produto removido', () => setDoc(refProd(item.id), semId(item))); }).catch(erroDb);
        } }),
        desfazer: () => desfazerAgora(),
        fecharDesfazer: () => fecharDesfazer(),
        resolver: (d) => {
            const p = produtos.find(x => x.id === d.id); if (!p) return;
            const dados = { ...p }; delete dados.id;
            deleteDoc(refProd(d.id)).then(() => avisoRemocao('Item removido.', () => setDoc(refProd(d.id), dados))).catch(erroDb);
        },
        remocaoDesfazer: () => remocaoDesfazerAgora(),
        salvarProd: () => {
            const nome = $('#pn').value.trim(), data = $('#pd').value, lojaId = $('#pl').value, marcaId = $('#pm') ? $('#pm').value : '';
            const semQtd = !($('#pq-informar') && $('#pq-informar').checked);
            const qRaw = semQtd ? '' : $('#pq').value.trim();
            const qtd = semQtd ? null : (qRaw === '' ? 1 : Math.max(0, parseInt(qRaw, 10) || 0));
            if (!nome || !data || !lojaId) return aviso('PREENCHA TUDO!', { soConfirmar: true });
            if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return aviso('DATA INVÁLIDA!', { soConfirmar: true });
            // Produto novo precisa de marca. Produtos antigos sem marca podem continuar sem.
            const original = view.prod ? produtos.find(x => x.id === view.prod) : null;
            if ((!original || original.marcaId) && !marcaId) return aviso('ESCOLHA OU CADASTRE A MARCA!', { soConfirmar: true });
            const setor = $('#psetor') ? $('#psetor').value : '';
            const cod = ($('#pcod') ? $('#pcod').value : '').replace(/[^0-9A-Za-z]/g, '');
            const original0 = view.prod ? produtos.find(x => x.id === view.prod) : null;
            if (!original0 && !setor) return aviso('ESCOLHA O SETOR!', { soConfirmar: true });
            if (cod && !/^[0-9A-Za-z]{6,20}$/.test(cod)) return aviso('CÓDIGO DE BARRAS INVÁLIDO!', { soConfirmar: true });
            const marcaNome = ((lojas.flatMap(l => l.marcas || [])).find(m => m.id === marcaId) || {}).nome || null;
            const duplicado = produtos.find(x => x.id !== (view.prod || '') && x.lojaId === lojaId && x.data === data && (x.nome || '').trim().toLowerCase() === nome.trim().toLowerCase());
            if (duplicado) return aviso(`Este produto já está cadastrado nesta loja com validade em ${fmt(data)}.`, { soConfirmar: true });
            const fotoCod = (cod && fotoCodigoAtual && fotoCodigoAtual.codigo === cod) ? fotoCodigoAtual.img : null;
            const dados = { nome: nome.slice(0, 120), qtd, semQtd, data, lojaId, marcaId, setor: setor || null, codigo: cod || null, fotoCodigo: fotoCod };
            if (fotoCod) fotoCodigoAtual = null;
            if (cod) registrarNomeCodigo(cod, { nome: dados.nome, setor: dados.setor, marcaNome });
            const voltar = view.origem ? { lojaId: view.origem, marcaId: view.origemMarca } : null;
            if (view.prod) updateDoc(refProd(view.prod), dados).catch(erroDb);
            else addDoc(colProd(), { ...dados, criadoEm: serverTimestamp() }).then(r => { ultimoRegistro = { colecao: 'produtos', id: r.id, nome: dados.nome }; registrarVisitaAuto(lojaId); }).catch(erroDb);
            if (voltar) ir('l', voltar); else ir('h');
        },
        authModo: () => {
            modoCriar = !modoCriar;
            $('#a-nome').classList.toggle('hidden', !modoCriar);
            $('#a-aceite').classList.toggle('hidden', !modoCriar); $('#a-aceite').classList.toggle('flex', modoCriar);
            $('#auth-titulo').textContent = modoCriar ? 'Criar conta' : 'Entrar';
            $('#a-btn').textContent = modoCriar ? 'CRIAR CONTA' : 'ENTRAR';
            $('#a-troca').textContent = modoCriar ? 'JÁ TENHO CONTA' : 'CRIAR CONTA NOVA';
            $('#a-senha').autocomplete = modoCriar ? 'new-password' : 'current-password';
            $('#a-erro').textContent = '';
        },
        authSubmit: async () => {
            const email = $('#a-email').value.trim(), senha = $('#a-senha').value, nome = $('#a-nome').value.trim();
            const erro = $('#a-erro'); erro.textContent = '';
            if (!email || !senha) { erro.textContent = 'Preencha e-mail e senha.'; return; }
            if (modoCriar && !nome) { erro.textContent = 'Informe seu nome.'; return; }
            if (modoCriar && !$('#a-aceite-cb').checked) { erro.textContent = 'Marque o aceite dos Termos de uso e das políticas para criar a conta.'; return; }
            const btn = $('#a-btn'); btn.disabled = true;
            try {
                if (modoCriar) {
                    const cred = await createUserWithEmailAndPassword(auth, email, senha);
                    await updateProfile(cred.user, { displayName: nome });
                    await setDoc(doc(db, 'users', cred.user.uid), { nome, email, criadoEm: serverTimestamp(), aceitouTermosEm: serverTimestamp(), versaoTermos: VERSAO_TERMOS }, { merge: true });
                } else {
                    await signInWithEmailAndPassword(auth, email, senha);
                }
            } catch (e) { erro.textContent = msgAuth(e); }
            btn.disabled = false;
        },
        authGoogle: async () => {
            const erro = $('#a-erro'); erro.textContent = '';
            const btn = $('#a-google'); btn.disabled = true;
            try {
                await signInWithPopup(auth, new GoogleAuthProvider());
            } catch (e) { erro.textContent = msgAuth(e); }
            btn.disabled = false;
        },
        authReset: async () => {
            const email = $('#a-email').value.trim(), erro = $('#a-erro');
            if (!email) { erro.textContent = 'Digite seu e-mail acima e toque de novo.'; return; }
            try { await sendPasswordResetEmail(auth, email); erro.className = erro.className.replace('text-red-500', 'text-amber-500'); erro.textContent = 'Enviamos um link para redefinir a senha no seu e-mail.'; }
            catch (e) { erro.className = erro.className.replace('text-amber-500', 'text-red-500'); erro.textContent = msgAuth(e); }
        },
        alternarDia: (d) => {
            const n = Number(d.dia); if (!(n >= 1 && n <= 5)) return;
            diasAviso = diasAviso.includes(n) ? diasAviso.filter(x => x !== n) : [...diasAviso, n].sort((a, b) => a - b);
            desenhar(false);
            setDoc(doc(db, 'users', uid), { diasAviso }, { merge: true }).catch(erroDb);
        },
        calDia: (d) => {
            const k = d.dia;
            if (cal.modo === 'uma') { cal.ini = k; cal.fim = ''; }
            else if (!cal.ini || cal.fim) { cal.ini = k; cal.fim = ''; }
            else if (k < cal.ini) { cal.fim = cal.ini; cal.ini = k; }
            else { cal.fim = k; }
            cal.msg = '';
            $('#modal-subtext').innerHTML = htmlCalendario();
        },
        calModo: (d) => {
            cal.modo = d.m; cal.fim = ''; cal.msg = '';
            $('#modal-subtext').innerHTML = htmlCalendario();
        },
        calMes: (d) => {
            const [a, m] = cal.mes.split('-').map(Number);
            const nd = new Date(a, m - 1 + Number(d.d), 1);
            cal.mes = nd.getFullYear() + '-' + String(nd.getMonth() + 1).padStart(2, '0');
            $('#modal-subtext').innerHTML = htmlCalendario();
        },
        abrirCap: () => ir('cap'),
        capTipo: (d) => { cap.tipo = d.t; $('#cap-tipos').innerHTML = htmlCapTipos(); (window.lucide && lucide.createIcons()); },
        capEnviar: async () => {
            if (cap.enviando) return;
            const nome = $('#cap-nome').value.trim(), tel = $('#cap-tel').value.trim(), msg = $('#cap-msg').value.trim();
            if (!cap.tipo) return capStatus('Escolha o assunto: Sugestões, Erros/falha ou Dúvidas.', 'text-red-500');
            if (nome.length < 2) return capStatus('Informe o seu nome.', 'text-red-500');
            if (tel.replace(/\D/g, '').length < 8) return capStatus('Informe um telefone de contato válido.', 'text-red-500');
            if (msg.length < 5) return capStatus('Escreva a sua mensagem.', 'text-red-500');
            const chave = window.CAP_WEB3FORMS_KEY || CAP_WEB3FORMS_KEY;
            if (!chave || chave.startsWith('COLE_AQUI')) return capStatus('O envio de mensagens ainda não foi configurado. Avise o responsável pelo app.', 'text-red-500');
            if (!navigator.onLine) return capStatus('Sem internet. Conecte-se e toque em enviar novamente.', 'text-red-500');
            const m = capMensagem();
            cap.enviando = true; const btn = $('#cap-enviar'); btn.disabled = true; capStatus('Enviando...');
            const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 20000);
            try {
                const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', signal: ctl.signal, headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({ access_key: chave, subject: m.assunto, from_name: 'Promotor Ajudante - ' + m.nome, name: m.nome, email: (userInfo && userInfo.email) || undefined, phone: m.tel, message: m.corpo }) });
                const j = await r.json().catch(() => ({}));
                if (!r.ok || !j.success) throw new Error(j.message || 'falha');
                $('#cap-msg').value = ''; cap.tipo = ''; $('#cap-tipos').innerHTML = htmlCapTipos(); (window.lucide && lucide.createIcons());
                capStatus('');
                aviso('Sua mensagem foi enviada com sucesso! Obrigado, responderemos assim que possível.', { titulo: 'MENSAGEM ENVIADA', soConfirmar: true });
            } catch (e) {
                console.warn('cap:', e);
                capStatus('Não foi possível enviar agora. Verifique a internet e toque em enviar novamente.', 'text-red-500');
            } finally {
                clearTimeout(t); cap.enviando = false; btn.disabled = false;
            }
        },
        fotoPdv: () => pdvAbrir(),
        camZoom: (d) => camZoom(d.box, Number(d.z)), camFlash: (d) => camFlash(d.box),
        pdvCapturar: () => pdvAbrirCameraNativa(),
        pdvCompartilhar: () => pdvCompartilhar(),
        pdvSalvar: () => pdvSalvar(),
        pdvFechar: () => pdvFechar(),
        lerCodigo: () => lerCodigo(),
        scanFechar: () => { scanDestino = null; leitorFechar(); },
        lerCodigoBusca: () => { scanDestino = 'busca'; lerCodigo(); },
        excluirConta: () => confirmarExclusao(),
        verConvites: () => ir('c'),
        conviteAceitar: (d) => conviteResponder(d.agencia, 'aceito'),
        conviteRecusar: (d) => conviteResponder(d.agencia, 'recusado'),
        pdvEscolherLoja: (d) => pdvEscolherLoja(d.id),
        pdvLojaFechar: () => pdvLojaCancelar(),
        pdvTrocarLoja: () => pdvListaLojas(null),
        visitaRegistrar: (d) => { if (navigator.vibrate) navigator.vibrate(30); visitaRegistrar(d.id); },
        notasAbrir: () => notasAbrir(), notasFechar: () => notasFechar(), notasSalvar: () => notasSalvar(),
        semVisitaAbrir: (d) => semVisitaAbrir(d.id), semVisitaSalvar: () => semVisitaSalvar(), svFechar: () => svFechar(),
        superioresAbrir: () => superioresAbrir(),
        superioresFechar: () => superioresFechar(),
        superiorNovo: () => { supEdit = 'novo'; superioresRender(); },
        superiorEditar: (d) => { supEdit = d.id; superioresRender(); },
        superiorCancelar: () => { supEdit = null; superioresRender(); },
        superiorSalvar: () => superiorSalvar(),
        superiorExcluir: (d) => superiorExcluir(d.id),
        relatorioSalvar: () => relatorioSalvar(),
        vozAbrir: () => vozAbrir(),
        desfazerUltimo: () => desfazerUltimo(),
        resumoAbrir: () => resumoAbrir(),
        enderecoSalvar: (d) => {
            const v = ($('#l-endereco').value || '').trim().slice(0, 200);
            const c = enderecoEscolhido && enderecoEscolhido.texto === v ? enderecoEscolhido : null;
            // só mexe nas coordenadas quando o endereço veio da lista do Google; senão mantém o ponto salvo
            const dadosEnd = c ? { endereco: v, enderecoLat: c.lat, enderecoLng: c.lng } : { endereco: v };
            updateDoc(doc(colLojas(), d.id), dadosEnd)
                .then(() => { enderecoEscolhido = null; enderecoEditando = null; toast('Endereço salvo.'); }).catch(erroDb);
        },
        enderecoEscolher: (d) => escolherSugestao(Number(d.i)),
        enderecoEditar: (d) => { enderecoEditando = d.id; desenhar(false); },
        enderecoCancelar: () => { enderecoEditando = null; desenhar(false); },
        enderecoAqui: (d) => {
            if (!navigator.geolocation) return aviso('Este aparelho não informa a localização.', { soConfirmar: true });
            navigator.geolocation.getCurrentPosition(
                (p) => updateDoc(doc(colLojas(), d.id), { enderecoLat: p.coords.latitude, enderecoLng: p.coords.longitude })
                    .then(() => toast('Localização da loja salva. A rota vai usar este ponto.')).catch(erroDb),
                () => aviso('Permita a localização no navegador e tente de novo, estando na loja.', { soConfirmar: true }),
                { enableHighAccuracy: true, timeout: 15000 }
            );
        },
        abrirRota: () => { location.href = 'rota.html'; },
        resumoFechar: () => resumoFechar(),
        resumoMes: (d) => resumoMudarMes(Number(d.n)),
        resumoDia: (d) => resumoRender(d.dia),
        planogramaAbrir: () => planogramaAbrir(),
        planogramaFechar: () => planogramaFechar(),
        planogramaVoltar: () => planogramaVoltar(),
        planogramaLoja: (d) => { planoLoja = d.id; planogramaRender(); },
        planogramaCamera: () => $('#plan-file').click(),
        planogramaVer: (d) => planogramaVer(d),
        planogramaExcluir: (d) => planogramaExcluir(d),
        avaliarApp: (d) => avaliarApp(d.nota),
        avaliarEnviar: () => avaliarEnviar(),
        codigosAbrir: () => codigosAbrir(),
        codigosFechar: () => codigosFechar(),
        verFotoCodigo: (d) => verFotoCodigo(d),
        diaLoja: (d) => diaLoja(d),
        resgatarVoucher: () => resgatarVoucher(),
        enviarFeedback: (d) => enviarFeedback(d.nota),
        buscaAbrir: () => buscaAbrir(),
        buscaFechar: () => buscaFechar(),
        buscaIr: (d) => buscaIr(Number(d.i)),
        toggleContraste: () => toggleContraste(),
        exportarDados: () => exportarCsv(),
        legal: (d) => abrirLegal(d.aba),
        legalFechar: () => fecharLegal(),
        pagarPlano: async (d) => {
            const plano = d.plano === 'anual' ? 'anual' : 'mensal';
            try {
                if (!navigator.onLine) throw new Error('offline');
                const token = await auth.currentUser.getIdToken();
                const r = await fetch(API_BASE + '/api/criar-pagamento', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                    body: JSON.stringify({ plano }),
                });
                const j = await r.json().catch(() => ({}));
                if (!r.ok || !j.url) throw new Error('api');
                window.location.href = j.url;
            } catch (e) {
                console.warn('pagarPlano:', e);
                aviso(navigator.onLine ? 'Não consegui abrir o pagamento agora. Tente de novo.' : 'Sem internet. Conecte-se e tente de novo.', { soConfirmar: true });
            }
        },
        verPlanos: () => abrirPlanos(),
        instalarApp: () => instalarApp(), instalarFechar: () => instalarFechar(), textoAlternar: () => textoAlternar(),
        tutorialProximo: () => tutorialProximo(), tutorialFechar: () => tutorialFechar(), compartilharResumo: () => compartilharResumo(),
        redefinirAbrir: () => redefinirAbrir(), rsFechar: () => rsFechar(), rsEnviar: () => rsEnviar(), rsConfirmar: () => rsConfirmar(), rsSalvar: () => rsSalvar(),
        fecharPlanos: () => fecharPlanos(),
        cancelarAssinatura: async () => {
            if (!confirm('Cancelar a assinatura mensal? O acesso continua até a data indicada.')) return;
            try {
                const token = await auth.currentUser.getIdToken();
                const r = await fetch(API_BASE + '/api/cancelar-assinatura', { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
                if (!r.ok) throw new Error('api');
                perfilAcesso = { ...perfilAcesso, assinatura: { ...(perfilAcesso.assinatura || {}), status: 'cancelada' } };
                aviso('Assinatura cancelada. Seu acesso segue até a data indicada.', { soConfirmar: true });
                ir('c');
            } catch (e) {
                console.warn('cancelar:', e);
                aviso('Não consegui cancelar agora. Tente de novo.', { soConfirmar: true });
            }
        },
        pagJa: async () => {
            const inp = $('#pag-email'), btn = $('#pag-ja'), st = $('#pag-status');
            const emailPag = ((inp && inp.value) || '').trim().toLowerCase();
            const cor = (c) => { st.className = 'text-[11px] font-bold mt-3 ' + c; };
            if (!/^\S+@\S+\.\S+$/.test(emailPag)) { cor('text-red-500'); st.textContent = 'Informe o e-mail usado no pagamento.'; return; }
            if (!navigator.onLine) { cor('text-red-500'); st.textContent = 'Sem internet. Conecte-se e tente novamente.'; return; }
            btn.disabled = true; cor('text-gray-400'); st.textContent = 'Enviando...';
            const chave = window.CAP_WEB3FORMS_KEY || CAP_WEB3FORMS_KEY;
            const nome = (userInfo && userInfo.displayName) || '-', emailConta = (userInfo && userInfo.email) || '-';
            const corpo = `PAGAMENTO INFORMADO\nNome da conta: ${nome}\nE-mail da conta: ${emailConta}\nE-mail usado no pagamento: ${emailPag}\nID do usuário: ${uid}\nApp: Promotor Ajudante ${VERSAO_APP}\nEnviado em: ${dataHoje()}`;
            const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 20000);
            try {
                const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', signal: ctl.signal, headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({ access_key: chave, subject: `PAGAMENTO - ${nome}`, from_name: 'Promotor Ajudante - ' + nome, name: nome, email: (userInfo && userInfo.email) || undefined, message: corpo }) });
                const j = await r.json().catch(() => ({}));
                if (!r.ok || !j.success) throw new Error(j.message || 'falha');
                await setDoc(doc(db, 'users', uid), { pagamentoInformadoEm: new Date().toISOString(), emailPagamento: emailPag }, { merge: true }).catch(() => {});
                perfilAcesso = { ...perfilAcesso, pagamentoInformadoEm: new Date().toISOString(), emailPagamento: emailPag };
                desenharPagamento();
                aviso('Recebemos o seu aviso de pagamento. Assim que for confirmado, o acesso é liberado automaticamente.', { titulo: 'PAGAMENTO INFORMADO', soConfirmar: true });
            } catch (e) {
                console.warn('pag:', e); cor('text-red-500'); st.textContent = 'Não foi possível enviar agora. Tente novamente.'; btn.disabled = false;
            } finally { clearTimeout(t); }
        },
        notifOn: () => ativarNotificacoes(false),
        notifOff: async () => { await desativarNotificacoes(); desenhar(false); },
        sair: () => aviso('SAIR DA CONTA?', { ok: async () => { await desativarNotificacoes(); await signOut(auth); } }),
    };

    document.addEventListener('change', (e) => {
        if (e.target.id === 'fm') { filtroVenc = e.target.value; desenhar(false); }
        if (view.tab === 'v' && ['pm', 'pd'].includes(e.target.id)) atualizarDicaBaixa();
        if (e.target.id === 'pl') {
            refreshCampoMarca(e.target.value, '');
            const lUnica = lojas.find(x => x.id === e.target.value);
            if (lUnica && (lUnica.marcas || []).length === 1) { const pm = $('#pm'); if (pm) pm.value = lUnica.marcas[0].id; }
            aplicarMarcaPendente();
        }
        if (e.target.id === 'pd') atualizarMotivoObrigatorio();
        if (e.target.id === 'f-setor') { filtroSetor = e.target.value; desenhar(false); }
        if (e.target.id === 'l-endereco') agendarSugestoes(e.target.value);
        // código digitado à mão: busca nome, marca e setor, como na leitura pela câmera
        if (e.target.id === 'pcod') {
            const cod = String(e.target.value || '').replace(/[^0-9A-Za-z]/g, '');
            if (/^\d{8,14}$/.test(cod)) codigoLido(cod);
        }
        if (e.target.id === 'plan-file') planogramaSalvarFoto(e.target.files[0]);
        if (e.target.id === 'pq-informar') {
            const pq = $('#pq'); if (pq) { pq.disabled = !e.target.checked; if (!e.target.checked) pq.value = ''; pq.classList.toggle('opacity-40', !e.target.checked); }
        }
        if (e.target.id === 'pm') {
            if (e.target.value === '__nova') { e.target.value = ultimaMarca; acoes.novaMarcaForm(); }
            else ultimaMarca = e.target.value;
        }
    });
    document.addEventListener('input', (e) => {
        if (e.target.id === 'busca-q') buscaResultados();
        if (e.target.id === 'busca') atualizarBusca();
        if (e.target.id === 'pn') mostrarSugestoes();
        if (view.tab === 'v' && ['pn', 'pq', 'pd'].includes(e.target.id)) atualizarDicaBaixa();
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#sug') && e.target.id !== 'pn') { const b = $('#sug'); if (b) b.classList.add('hidden'); }
        const el = e.target.closest('[data-act]');
        if (!el || !acoes[el.dataset.act]) return;
        acoes[el.dataset.act](el.dataset);
    });

    function msgAuth(e) {
        const m = {
            'auth/invalid-credential': 'E-mail ou senha incorretos.',
            'auth/wrong-password': 'E-mail ou senha incorretos.',
            'auth/user-not-found': 'E-mail ou senha incorretos.',
            'auth/invalid-email': 'E-mail inválido.',
            'auth/email-already-in-use': 'Este e-mail já tem conta. Toque em "Já tenho conta".',
            'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
            'auth/network-request-failed': 'Sem conexão com a internet.',
            'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
            'auth/popup-closed-by-user': '',
            'auth/cancelled-popup-request': '',
            'auth/popup-blocked': 'O navegador bloqueou a janela do Google. Permita pop-ups para este site e tente de novo.',
            'auth/unauthorized-domain': 'Este endereço ainda não foi autorizado no Firebase (Domínios autorizados).',
            'auth/operation-not-allowed': 'O login com Google ainda não foi ativado no Firebase.',
            'auth/account-exists-with-different-credential': 'Já existe uma conta com este e-mail. Entre com e-mail e senha.',
        };
        return e.code in m ? m[e.code] : 'Não foi possível concluir. Tente novamente.';
    }

    /* ================= calendário: até 3 datas para o relatório de vencidos ================= */
    let cal = { chave: '', modo: 'uma', ini: '', fim: '', mes: '', msg: '' };
    function htmlCalendario() {
        const [ano, mesN] = cal.mes.split('-').map(Number);
        const total = new Date(ano, mesN, 0).getDate();
        const inicio = new Date(ano, mesN - 1, 1).getDay();
        const iso = (d) => cal.mes + '-' + String(d).padStart(2, '0');
        const temRegistro = new Set(vencidos.filter(v => (norm(v.marcaNome) || '_') === cal.chave).map(v => v.dataRetirada));
        const fimSel = cal.modo === 'uma' ? cal.ini : (cal.fim || cal.ini);
        let cel = '<div></div>'.repeat(inicio);
        for (let d = 1; d <= total; d++) {
            const k = iso(d);
            const ponta = !!cal.ini && (k === cal.ini || k === fimSel);
            const meio = !!cal.ini && !!fimSel && k > cal.ini && k < fimSel;
            const cls = ponta ? 'bg-amber-500 text-gray-950'
                : meio ? 'bg-amber-500/20 text-amber-400'
                : temRegistro.has(k) ? 'border border-amber-500/70 text-amber-500'
                : 'border border-gray-800 text-gray-300';
            cel += `<button type="button" data-act="calDia" data-dia="${k}" class="py-2.5 rounded-xl text-sm font-black ${cls}">${d}</button>`;
        }
        const nomeMes = new Date(ano, mesN - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const resumo = !cal.ini ? 'nenhuma data escolhida'
            : cal.modo === 'uma' ? dataBR(cal.ini)
            : (cal.fim ? dataBR(cal.ini) + ' até ' + dataBR(cal.fim) : dataBR(cal.ini) + ' (agora toque no dia final)');
        const aba = (k, t) => `<button type="button" data-act="calModo" data-m="${k}" class="flex-1 py-2 rounded-xl border text-[10px] font-black uppercase ${cal.modo === k ? 'border-amber-500 text-amber-500' : 'border-gray-700 text-gray-400'}">${t}</button>`;
        return `<div class="flex gap-2 mb-3">${aba('uma', 'Um dia')}${aba('periodo', 'Período')}</div>
            <div class="flex items-center justify-between mb-2">
                <button type="button" data-act="calMes" data-d="-1" class="px-3 py-1 text-amber-500 font-black text-lg" aria-label="Mês anterior">‹</button>
                <span class="text-xs font-black uppercase text-gray-300">${nomeMes}</span>
                <button type="button" data-act="calMes" data-d="1" class="px-3 py-1 text-amber-500 font-black text-lg" aria-label="Próximo mês">›</button>
            </div>
            <div class="grid grid-cols-7 gap-1 text-center text-[9px] text-gray-500 font-black mb-1"><span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span></div>
            <div class="grid grid-cols-7 gap-1 mb-3">${cel}</div>
            <p class="text-[11px] text-gray-500 leading-snug mb-2">${cal.modo === 'uma' ? 'Toque no dia.' : 'Toque no dia inicial e depois no dia final.'} Dias em <b class="text-amber-500">amarelo</b> têm registros desta marca.</p>
            <p class="text-[12px] text-gray-300">Escolhido: <b class="text-amber-500">${resumo}</b></p>
            ${cal.msg ? `<p class="text-[11px] text-red-500 font-bold mt-1">${cal.msg}</p>` : ''}`;
    }
    function abrirCalendario(chave, msg = '') {
        if (chave !== cal.chave) cal = { chave, modo: 'uma', ini: '', fim: '', mes: mesAtualISO(), msg: '' };
        cal.msg = msg;
        aviso(htmlCalendario(), { titulo: 'ESCOLHA A DATA', okTexto: 'Gerar relatório',
            ok: () => {
                if (!cal.ini) return abrirCalendario(cal.chave, 'Escolha uma data.');
                const fimSel = cal.modo === 'uma' ? cal.ini : (cal.fim || cal.ini);
                imprimirVencidos(cal.chave, 'intervalo', [cal.ini, fimSel]);
            } });
    }

    /* ================= CAP: Central de Atendimento ao Promotor ================= */
    const CAP_EMAIL = 'melobortolato.renan@gmail.com';
    // Chave gratuita do Web3Forms (https://web3forms.com): informe o e-mail acima, copie a chave recebida e cole aqui.
    const CAP_WEB3FORMS_KEY = '770f41c3-0ca4-443e-b697-878e0dc88ff6';
    const CAP_TIPOS = [['sugestao', 'Sugestões', 'lightbulb'], ['erro', 'Erros/falha', 'bug'], ['duvida', 'Dúvidas', 'circle-help']];
    let cap = { tipo: '', enviando: false };
    function htmlCapTipos() {
        return CAP_TIPOS.map(([k, nome, ic]) => { const on = cap.tipo === k; return `
            <button type="button" data-act="capTipo" data-t="${k}" aria-pressed="${on}" class="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border ${on ? 'bg-amber-500 text-gray-950 border-amber-500' : 'bg-gray-900/60 text-gray-400 border-gray-700'}">
                <i data-lucide="${ic}" class="w-5 h-5"></i><span class="text-[10px] font-black uppercase leading-none">${nome}</span></button>`; }).join('');
    }
    function htmlCap() {
        return `
            <button class="flex items-center gap-2 mb-5 text-left" data-act="tab" data-id="c"><i data-lucide="chevron-left" class="w-6 h-6 text-amber-500"></i><h2 class="font-black uppercase text-amber-500 italic text-lg">CAP</h2></button>
            <p class="text-gray-400 text-[12px] leading-snug mb-4"><b class="text-white">Central de Atendimento ao Promotor.</b> Fale com a gente: a sua mensagem chega direto ao responsável pelo app.</p>
            <div class="text-[9px] text-gray-500 font-black uppercase mb-2 ml-1">Sobre o que você quer falar?</div>
            <div id="cap-tipos" class="flex gap-2 mb-4">${htmlCapTipos()}</div>
            <div class="space-y-3">
                <div><label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="cap-nome">Nome</label>
                <input id="cap-nome" class="input-custom" maxlength="80" autocomplete="name" value="${esc((userInfo && userInfo.displayName) || '')}"></div>
                <div><label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="cap-tel">Telefone de contato</label>
                <input id="cap-tel" class="input-custom" type="tel" inputmode="tel" maxlength="25" autocomplete="tel" placeholder="(48) 9 9999-9999"></div>
                <div><label class="text-[9px] font-black text-gray-500 uppercase ml-2" for="cap-msg">Mensagem</label>
                <textarea id="cap-msg" class="input-custom" rows="6" maxlength="2000" placeholder="Escreva aqui o que você preferir..." style="resize:none"></textarea></div>
                <p id="cap-status" class="text-[11px] font-bold min-h-[1rem]" role="status"></p>
                <button id="cap-enviar" data-act="capEnviar" class="btn-amarelo flex items-center justify-center gap-2"><i data-lucide="send" class="w-4 h-4"></i> ENVIAR</button>
            </div>`;
    }
    function capStatus(txt, cor = 'text-gray-400') { const s = $('#cap-status'); if (s) { s.className = 'text-[11px] font-bold min-h-[1rem] ' + cor; s.innerHTML = txt; } }
    function capMensagem() {
        const tipo = (CAP_TIPOS.find(t => t[0] === cap.tipo) || ['', ''])[1];
        const nome = $('#cap-nome').value.trim(), tel = $('#cap-tel').value.trim(), msg = $('#cap-msg').value.trim();
        const ag = new Date(), quando = dataHoje() + ' ' + String(ag.getHours()).padStart(2, '0') + ':' + String(ag.getMinutes()).padStart(2, '0');
        const corpo = `Tipo: ${tipo}\nNome: ${nome}\nTelefone: ${tel}\nNome da conta: ${(userInfo && userInfo.displayName) || '-'}\nE-mail da conta: ${(userInfo && userInfo.email) || '-'}\nID do usuário: ${uid || '-'}\nApp: Promotor Ajudante ${VERSAO_APP}\nEnviado em: ${quando}\n\nMensagem:\n${msg}`;
        return { tipo, nome, tel, msg, assunto: `CAP - ${tipo} - ${nome}`, corpo };
    }

    /* ================= relatórios impressos (PDF) ================= */
    const LARANJA = '#f59e0b';
    const dataHoje = () => dataBR(isoLocal(new Date()));
    const sepRel = `<span style="margin:0 8px;color:${LARANJA}">|</span>`;
    function relCabecalho(l1, l2) {
        return `
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div style="display:flex;align-items:center;gap:14px">
                    <img src="logo.png" onerror="this.onerror=null;this.src='https://raw.githubusercontent.com/melobortolatorenan-max/Promotor-ajudante/main/logo.png'" style="width:92px;height:92px;border-radius:20px;object-fit:cover" alt="">
                    <div style="line-height:1">
                        <div style="font-size:11px;letter-spacing:.22em;color:#6b7280;font-weight:700">PROMOTOR</div>
                        <div style="font-size:30px;color:${LARANJA};font-weight:900;font-style:italic;margin-top:3px">AJUDANTE</div>
                    </div>
                </div>
                <div style="text-align:right;font-size:11px;letter-spacing:.16em;color:#6b7280;font-weight:800;line-height:1.5">${l1}<br><span style="color:#111">${l2}</span></div>
            </div>`;
    }
    const relInfo = (campos) => `<div style="margin:20px 0 18px;border-left:5px solid ${LARANJA};background:#fff7e6;padding:10px 13px;border-radius:0 8px 8px 0;font-size:11.5px;display:flex;flex-wrap:wrap;row-gap:4px">${campos.map(([k, v]) => `<span><b>${k}:</b> ${esc(v)}</span>`).join(sepRel)}</div>`;
    const nomePromotor = () => (userInfo && (userInfo.displayName || userInfo.email)) || '';

    const semId = (o) => { const { id, ...resto } = o; return resto; };
    function mostrarDesfazer(texto, fn) {
        desfazerFn = fn;
        $('#desfazer-texto').textContent = texto;
        const box = $('#desfazer'); box.classList.remove('hidden'); box.classList.add('flex');
        clearTimeout(desfazerTimer);
        desfazerTimer = setTimeout(fecharDesfazer, 6000);
    }
    function fecharDesfazer() {
        clearTimeout(desfazerTimer); desfazerFn = null;
        const box = $('#desfazer'); if (box) { box.classList.add('hidden'); box.classList.remove('flex'); }
    }
    async function desfazerAgora() {
        const fn = desfazerFn; fecharDesfazer();
        if (fn) { try { await fn(); } catch (e) { erroDb(e); } }
    }
    async function gerarPdfBlob(html) {
        if (!window.html2pdf) await new Promise((ok, erro) => {
            const sc = document.createElement('script');
            sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            sc.onload = ok; sc.onerror = erro; document.head.appendChild(sc);
        });
        const div = document.createElement('div');
        div.innerHTML = html; div.style.width = '794px'; div.style.background = '#fff';
        document.body.appendChild(div);
        try {
            const img = div.querySelector('img');
            if (img && !img.complete) await new Promise(r => { img.onload = img.onerror = r; setTimeout(r, 2500); });
            return await window.html2pdf().set({ margin: 10, image: { type: 'jpeg', quality: 0.95 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(div).outputPdf('blob');
        } finally { div.remove(); }
    }
    async function compartilharPdf(titulo, html) {
        try {
            const blob = await gerarPdfBlob(html);
            const nome = titulo.replace(/[\\/:*?"<>|]/g, '') + '.pdf';
            const arq = new File([blob], nome, { type: 'application/pdf' });
            if (navigator.canShare && navigator.canShare({ files: [arq] })) {
                try { await navigator.share({ files: [arq], title: titulo }); } catch (e) { /* cancelado */ }
            } else {
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome;
                document.body.appendChild(a); a.click(); a.remove();
            }
        } catch (e) {
            console.error('pdf:', e);
            aviso('Não foi possível gerar o PDF agora. Verifique a conexão e tente de novo.', { soConfirmar: true });
        }
    }
    async function abrirImpressao(tituloArquivo, html) {
        const acao = relAcao; relAcao = 'imprimir';
        if (acao === 'compartilhar') return compartilharPdf(tituloArquivo, html);
        $('#print-area').innerHTML = html;
        const img = $('#print-area img');
        if (img && !img.complete) await new Promise(r => { img.onload = img.onerror = r; setTimeout(r, 2500); });
        const tituloAntes = document.title;
        document.title = tituloArquivo.replace(/[\\/:*?"<>|]/g, '');
        const depois = () => { document.title = tituloAntes; $('#print-area').innerHTML = ''; window.removeEventListener('afterprint', depois); };
        window.addEventListener('afterprint', depois);
        window.print();
    }

    // Cabeçalho do modelo tabela: logo centralizado, linha laranja e uma linha com os dados
    function relCabecalhoCentral(campos) {
        const sep = `<span style="margin:0 8px;color:${LARANJA}">|</span>`;
        return `
            <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
                <img src="logo.png" onerror="this.onerror=null;this.src='https://raw.githubusercontent.com/melobortolatorenan-max/Promotor-ajudante/main/logo.png'" style="width:110px;height:110px;border-radius:24px;object-fit:cover" alt="">
                <div style="line-height:1;text-align:center">
                    <div style="font-size:11px;letter-spacing:.22em;color:#6b7280;font-weight:700">PROMOTOR</div>
                    <div style="font-size:30px;color:${LARANJA};font-weight:900;font-style:italic;margin-top:3px">AJUDANTE</div>
                </div>
            </div>
            <div style="height:3px;background:${LARANJA};margin:22px 0 14px"></div>
            <div style="display:flex;justify-content:center;flex-wrap:wrap;row-gap:4px;font-size:11.5px;text-align:center">${campos.map(([k, v]) => `<span><b>${k}:</b> ${esc(v)}</span>`).join(sep)}</div>`;
    }

    // Relatório de uma marca dentro de uma loja (modelo tabela: produtos em ordem alfabética,
    // cada um com suas validades juntas, da mais próxima para a mais distante)
    function imprimirRelatorio(lojaId, marcaId) {
        const l = lojas.find(x => x.id === lojaId); if (!l) return;
        const nomeM = marcaId === '_sem' ? 'Sem marca' : nomeMarca(lojaId, marcaId);
        const lista = produtos.filter(p => p.lojaId === lojaId && doMarca(p, marcaId));
        if (!lista.length) return aviso('ESTA MARCA AINDA NÃO TEM PRODUTOS CADASTRADOS.', { soConfirmar: true });
        const hoje = dataHoje();
        const grupos = new Map();
        lista.forEach(p => {
            const k = norm(p.nome);
            if (!grupos.has(k)) grupos.set(k, { nome: p.nome.trim(), itens: [], grafias: new Map() });
            const g = grupos.get(k); g.itens.push(p);
            const n = p.nome.trim(); g.grafias.set(n, (g.grafias.get(n) || 0) + 1);
        });
        // Se o mesmo produto foi digitado de formas diferentes (maiúsculas/acentos), mostra a grafia mais usada e mais completa
        grupos.forEach(g => {
            const pontos = (n, c) => c * 10 + (/^[A-ZÀ-Ý]/.test(n) ? 1 : 0) + (/[^\u0000-\u007f]/.test(n) ? 1 : 0);
            g.nome = [...g.grafias.entries()].sort((a, b) => pontos(b[0], b[1]) - pontos(a[0], a[1]))[0][0];
        });
        const ordenados = [...grupos.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
        ordenados.forEach(g => g.itens.sort((a, b) => a.data.localeCompare(b.data)));
        const th = `padding:10px 12px;font-size:10.5px;letter-spacing:.14em;text-align:center;width:50%`;
        const corpo = ordenados.map(g => `
            <tbody class="rel-card">
                <tr><td colspan="2" style="padding:11px 12px 8px;font-size:13px;font-weight:800;text-transform:uppercase;font-style:italic;border-left:5px solid ${LARANJA};background:#f3f4f6">${esc(g.nome)}</td></tr>
                ${g.itens.map((p, i) => `<tr style="background:${i % 2 ? '#f9fafb' : '#fff'}">
                    <td style="padding:8px 12px;text-align:center;color:${LARANJA};font-weight:900;font-size:13px;border-bottom:1px solid #e5e7eb">${dataBR(p.data)}</td>
                    <td style="padding:8px 12px;text-align:center;color:${LARANJA};font-weight:900;font-size:13px;border-bottom:1px solid #e5e7eb">${p.semQtd ? 'Sem qtd' : esc(p.qtd)}</td></tr>`).join('')}
                <tr><td colspan="2" style="height:12px;padding:0"></td></tr>
            </tbody>`).join('');
        return abrirImpressao(`Relatorio ${nomeM} - ${l.nome} - ${hoje.replace(/\//g, '-')}`,
            relCabecalhoCentral([['Loja', l.nome], ['Marca', nomeM], ['Data do relatório', hoje], ['Promotor', nomePromotor()]]) +
            `<table style="width:100%;border-collapse:collapse;margin-top:22px">
                <thead><tr style="border-bottom:3px solid ${LARANJA}"><th style="${th}">VENCIMENTO</th><th style="${th}">QUANTIDADE</th></tr></thead>
                ${corpo}
            </table>`);
    }

    // Relatório de vencidos de uma marca (modelo tabela, igual ao de estoque):
    // separado por loja e, dentro de cada loja, por produto (ordem alfabética);
    // cada produto lista suas retiradas com vencimento, retirada e quantidade.
    function imprimirVencidos(chave, periodo = 'mes', datas = []) {
        const intervalo = periodo === 'intervalo', f = intervalo ? null : faixaPeriodo(periodo);
        const base = (intervalo ? vencidos : vencMes()).filter(v => !relMotivo || (v.motivo || '').trim() === relMotivo);
        const lista = base.filter(v => (norm(v.marcaNome) || '_') === chave && (intervalo ? (v.dataRetirada >= datas[0] && v.dataRetirada <= datas[1]) : (v.dataRetirada >= f.ini && v.dataRetirada <= f.fim)));
        if (!lista.length) return aviso('NÃO HÁ VENCIDOS DESTA MARCA NO PERÍODO ESCOLHIDO.', { soConfirmar: true });
        const nomeM = lista[0].marcaNome || 'Sem marca';
        const hoje = dataHoje();
        const ddmm = (iso) => iso.slice(8) + '/' + iso.slice(5, 7);
        const textoPeriodo = intervalo ? (datas[0] === datas[1] ? dataBR(datas[0]) : dataBR(datas[0]) + ' a ' + dataBR(datas[1])) : (periodo === 'dia' || periodo === 'ontem') ? dataBR(f.fim) : ddmm(f.ini) + ' a ' + ddmm(f.fimRot);
        const nomePeriodo = intervalo ? 'Período escolhido' : (PERIODOS.find(x => x[0] === periodo) || ['', ''])[1];
        const cmp = (a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
        // agrupa por loja e, dentro dela, por produto
        const lojasMap = new Map();
        lista.forEach(v => {
            const kl = norm(v.lojaNome) || '_';
            if (!lojasMap.has(kl)) lojasMap.set(kl, { nome: (v.lojaNome || '-').trim(), prods: new Map() });
            const L = lojasMap.get(kl);
            const kp = norm(v.nome);
            if (!L.prods.has(kp)) L.prods.set(kp, { grafias: new Map(), itens: [] });
            const P = L.prods.get(kp); P.itens.push(v);
            const n = v.nome.trim(); P.grafias.set(n, (P.grafias.get(n) || 0) + 1);
        });
        const pontos = (n, c) => c * 10 + (/^[A-ZÀ-Ý]/.test(n) ? 1 : 0) + (/[^\u0000-\u007f]/.test(n) ? 1 : 0);
        const th = `padding:10px 12px;font-size:10.5px;letter-spacing:.14em;text-align:center;width:33.33%`;
        const td = `padding:8px 12px;text-align:center;color:${LARANJA};font-weight:900;font-size:13px;border-bottom:1px solid #e5e7eb`;
        const corpo = [...lojasMap.values()].sort((a, b) => cmp(a.nome, b.nome)).map(L => {
            const prods = [...L.prods.values()].map(P => ({
                nome: [...P.grafias.entries()].sort((a, b) => pontos(b[0], b[1]) - pontos(a[0], a[1]))[0][0],
                itens: P.itens.sort((a, b) => (a.dataVenc || '').localeCompare(b.dataVenc || '') || (a.dataRetirada || '').localeCompare(b.dataRetirada || '')),
            })).sort((a, b) => cmp(a.nome, b.nome));
            const cabecalhoLoja = `
            <tbody style="break-after:avoid;page-break-after:avoid">
                <tr><td colspan="3" style="padding:16px 12px 6px;border-bottom:3px solid ${LARANJA};font-size:15px;font-weight:900;text-transform:uppercase;letter-spacing:.04em"><span style="color:${LARANJA};font-size:10px;letter-spacing:.18em;margin-right:8px">LOJA</span>${esc(L.nome)}</td></tr>
            </tbody>`;
            const blocos = prods.map(P => `
            <tbody class="rel-card">
                <tr><td colspan="3" style="padding:11px 12px 8px;font-size:13px;font-weight:800;text-transform:uppercase;font-style:italic;border-left:5px solid ${LARANJA};background:#f3f4f6">${esc(P.nome)}</td></tr>
                ${P.itens.map((v, i) => `<tr style="background:${i % 2 ? '#f9fafb' : '#fff'}">
                    <td style="${td}">${dataBR(v.dataVenc)}</td>
                    <td style="${td}">${dataBR(v.dataRetirada)}</td>
                    <td style="${td}">${esc(v.qtd)}</td></tr>${v.motivo ? `<tr style="background:${i % 2 ? '#f9fafb' : '#fff'}"><td colspan="3" style="padding:0 12px 9px;text-align:left;font-size:11px;color:#374151;border-bottom:1px solid #e5e7eb"><b style="color:${LARANJA}">MOTIVO:</b> ${esc(v.motivo)}</td></tr>` : ''}`).join('')}
                <tr><td colspan="3" style="height:10px;padding:0"></td></tr>
            </tbody>`).join('');
            return cabecalhoLoja + blocos;
        }).join('');
        ultimaListaVenc = lista;
        return abrirImpressaoVenc(`Relatorio de vencidos - ${nomeM} - ${nomePeriodo} - ${hoje.replace(/\//g, '-')}`,
            relCabecalhoCentral([['Marca', nomeM], ['Período', nomePeriodo + ' (' + textoPeriodo + ')'], ['Data do relatório', hoje], ['Promotor', nomePromotor()]]) +
            `<table style="width:100%;border-collapse:collapse;margin-top:22px">
                <thead><tr style="border-bottom:3px solid ${LARANJA}"><th style="${th}">VENCIMENTO</th><th style="${th}">RETIRADA</th><th style="${th}">QUANTIDADE</th></tr></thead>
                ${corpo}
            </table>`);
    }

    /* ================= limpeza mensal dos vencidos ================= */
    let limpandoVenc = false;
    function limparVencidosAntigos() {
        if (limpandoVenc || !uid) return;
        const mes = mesAtualISO();
        const antigos = vencidos.filter(v => /^\d{4}-\d{2}-\d{2}$/.test(v.dataRetirada || '') && v.dataRetirada.slice(0, 7) < mes);
        if (!antigos.length) return;
        limpandoVenc = true;
        chunkOps(antigos.map(v => bt => bt.delete(refVenc(v.id))))
            .catch(e => console.warn('limpeza de vencidos:', e))
            .finally(() => { limpandoVenc = false; });
    }

    /* ================= vencidos ================= */
    function verificarVencidos() {
        if (!uid || !prontoProd || modal.style.display === 'flex' || view.tab === 'p' || view.tab === 'v' || view.tab === 'cap') return;
        const p = produtos.find(x => diasAte(x.data) < 0 && !ignorados.has(x.id));
        if (!p) return;
        const proximo = () => setTimeout(verificarVencidos, 400);
        aviso(`<b>${esc(p.nome)}</b> - ${rotuloLoja(p)}<br><br>Este produto já passou da data de vencimento! Deseja remover?`, {
            titulo: 'JÁ VENCEU!',
            ok: () => { deleteDoc(refProd(p.id)).catch(erroDb); proximo(); },
            cancel: () => { ignorados.add(p.id); sessionStorage.setItem('ign_venc', JSON.stringify([...ignorados])); proximo(); },
        });
    }
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && uid) { aplicarAcesso(); limparVencidosAntigos(); atualizar(); verificarVencidos(); }
    });

    /* ================= notificações (FCM) ================= */
    async function ativarNotificacoes(silencioso) {
        try {
            if (!msgOk) { if (!silencioso) aviso('Este aparelho/navegador não suporta notificações.', { soConfirmar: true }); return false; }
            let perm = Notification.permission;
            if (perm === 'default') { if (silencioso) return false; perm = await Notification.requestPermission(); }
            if (perm !== 'granted') {
                if (!silencioso) aviso('Permissão negada. Libere as notificações deste site nas configurações do navegador.', { soConfirmar: true });
                desenhar(false); return false;
            }
            const reg = await navigator.serviceWorker.register('firebase-messaging-sw.js');
            await navigator.serviceWorker.ready;
            const token = await getToken(messaging, { vapidKey: window.FCM_VAPID_KEY, serviceWorkerRegistration: reg });
            if (!token) throw new Error('sem-token');
            await setDoc(doc(db, 'users', uid, 'tokens', token), { token, ua: navigator.userAgent.slice(0, 150), atualizadoEm: serverTimestamp() });
            localStorage.setItem('fcm_token', token);
            if (!silencioso) { aviso('Notificações ativadas neste aparelho!', { soConfirmar: true }); }
            if (view.tab === 'c') desenhar(false);
            return true;
        } catch (e) {
            console.error(e);
            if (!silencioso) aviso('Não foi possível ativar as notificações (' + esc(e.code || e.message) + ').', { soConfirmar: true });
            return false;
        }
    }
    async function desativarNotificacoes() {
        const token = localStorage.getItem('fcm_token');
        try {
            if (token && uid) await deleteDoc(doc(db, 'users', uid, 'tokens', token));
            if (messaging) await deleteToken(messaging);
        } catch (e) { console.warn(e); }
        localStorage.removeItem('fcm_token');
    }

    /* ================= dados antigos (localStorage) ================= */
    function dadosAntigos() {
        try { const a = JSON.parse(localStorage.getItem('db_promotor_v3') || '[]'); return Array.isArray(a) && a.some(l => l && l.nome) ? a : null; }
        catch { return null; }
    }
    function oferecerImportacao() {
        const antigos = dadosAntigos();
        if (!antigos || localStorage.getItem('imp_' + uid)) return;
        const nProd = antigos.reduce((s, l) => s + ((l.produtos || []).length), 0);
        aviso(`Encontrei dados antigos neste aparelho: <b>${antigos.length}</b> ${plural(antigos.length, 'loja', 'lojas')} e <b>${nProd}</b> ${plural(nProd, 'produto', 'produtos')}.<br><br>Importar para a sua conta?`, {
            titulo: 'IMPORTAR DADOS',
            ok: () => {
                const base = Date.now(), ops = [];
                antigos.forEach((l, i) => {
                    if (!l || !l.nome) return;
                    const lr = doc(colLojas());
                    ops.push(bt => bt.set(lr, { nome: String(l.nome).slice(0, 80), ordem: base + i, criadoEm: serverTimestamp() }));
                    (l.produtos || []).forEach(p => {
                        if (!p || !p.nome || !/^\d{4}-\d{2}-\d{2}$/.test(p.data || '')) return;
                        ops.push(bt => bt.set(doc(colProd()), { nome: String(p.nome).slice(0, 120), qtd: Math.max(0, parseInt(p.qtd, 10) || 0), data: p.data, lojaId: lr.id, criadoEm: serverTimestamp() }));
                    });
                });
                chunkOps(ops).then(() => localStorage.setItem('imp_' + uid, '1')).catch(erroDb);
            },
            cancel: () => localStorage.setItem('imp_' + uid, '1'),
        });
    }

    /* ================= sessão ================= */
    function acessoLiberado() {
        const ate = perfilAcesso.acessoAte;
        const hoje = isoLocal(new Date());
        const noTeste = !planoPago() && !!criadaEm && hoje <= (fimTesteISO() || '');
        return contaAntiga || perfilAcesso.gratis === true || (typeof ate === 'string' && ate >= hoje) || noTeste;
    }
    function aplicarAcesso() {
        if (!uid) return;
        if (acessoLiberado()) {
            if (appAberto) return;
            appAberto = true;
            mostrar('app');
            atualizarFaixaConexao();
            ir('h');
            if (msgOk && Notification.permission === 'granted') ativarNotificacoes(true); // renova o token em silêncio
            setTimeout(oferecerImportacao, 900);
        } else {
            appAberto = false;
            mostrar('pagamento');
            desenharPagamento();
        }
    }
    function desenharPagamento() {
        const box = $('#pag-conteudo'); if (!box) return;
        const ate = perfilAcesso.acessoAte;
        const hoje = isoLocal(new Date());
        const acabou = (typeof ate === 'string' && ate < hoje) || (!planoPago() && fimTesteISO() && fimTesteISO() < hoje);
        const falha = !!(perfilAcesso.assinatura && perfilAcesso.assinatura.status === 'falhou');
        box.innerHTML = `
            <div class="flex items-center gap-3 mb-6">
                <img src="logo.png" onerror="this.src='https://raw.githubusercontent.com/melobortolatorenan-max/Promotor-ajudante/main/logo.png'" class="w-12 h-12" style="mix-blend-mode:lighten" alt="">
                <h1 class="font-black uppercase text-amber-500 italic text-xl leading-none">Escolha seu plano</h1>
            </div>
            <p class="text-gray-400 text-[12px] leading-snug mb-5">${falha ? 'Não conseguimos cobrar o cartão da assinatura mensal, por isso o acesso está bloqueado. Regularize o pagamento para continuar.' : acabou
                ? `Seu acesso terminou${typeof ate === 'string' ? ' em <b class="text-white">' + dataBR(ate) + '</b>' : ''}. Escolha um plano para continuar usando o <b class="text-white">Promotor Ajudante</b>.`
                : 'Para continuar usando o <b class="text-white">Promotor Ajudante</b>, escolha um plano.'}</p>
            ${htmlOpcoesPlano()}
            <p class="text-[10px] text-gray-500 font-bold text-center mb-2">Depois do pagamento, o app libera o acesso sozinho e volta ao ponto onde você parou.</p>
            <p class="text-[10px] text-gray-600 text-center mb-5 leading-snug">Ao continuar, você concorda com os <button data-act="legal" data-aba="termos" class="underline text-gray-400">Termos de uso</button> e a <button data-act="legal" data-aba="privacidade" class="underline text-gray-400">Política de privacidade</button>.</p>
            <button data-act="sair" class="w-full py-4 rounded-xl border border-red-900/50 text-[10px] font-black uppercase text-red-500 mt-2">SAIR DA CONTA</button>
            <p class="text-center text-[9px] text-gray-700 mt-6 uppercase font-bold">Promotor Ajudante · ${VERSAO_APP}</p>`;
        (window.lucide && lucide.createIcons());
    }

    function entrar(user) {
        const bi = document.getElementById('instalar-ban'); if (bi) bi.remove();
        uid = user.uid;
        if (!localStorage.getItem('tutorial_visto_' + uid)) setTimeout(tutorialAbrir, 1200); userInfo = { displayName: user.displayName, email: user.email };
        const criada = user.metadata && user.metadata.creationTime ? new Date(user.metadata.creationTime) : null;
        criadaEm = criada;
        contaAntiga = false;   // todos seguem a regra de teste de 60 dias (contas antigas entram pela migração)
        perfilAcesso = {}; appAberto = false;
        setDoc(doc(db, 'users', uid), { nome: user.displayName || '', email: user.email || '' }, { merge: true }).catch(() => {});
        prontoProd = false;
        unsubs.push(onSnapshot(query(colLojas(), orderBy('ordem')), { includeMetadataChanges: true }, (snap) => {
            lojas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            pendentes.lojas = snap.docs.filter(d => d.metadata.hasPendingWrites).length; atualizarFaixaConexao();
            atualizar();
        }, erroDb));
        unsubs.push(onSnapshot(query(colProd(), orderBy('data')), { includeMetadataChanges: true }, (snap) => {
            produtos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            pendentes.produtos = snap.docs.filter(d => d.metadata.hasPendingWrites).length; atualizarFaixaConexao();
            prontoProd = true;
            atualizar();
            verificarVencidos();
        }, erroDb));
        unsubs.push(onSnapshot(doc(db, 'users', uid), (snap) => {
            perfilAcesso = snap.exists() ? snap.data() : {};
            const d = snap.exists() ? snap.data().diasAviso : null;
            // se a conta ainda não tem a escolha gravada, grava a que aparece na tela para o servidor usar a mesma
            if (snap.exists() && !snap.metadata.hasPendingWrites && !Array.isArray(d) && !diasSalvos) { diasSalvos = true; setDoc(doc(db, 'users', uid), { diasAviso }, { merge: true }).catch(() => {}); }
            diasAviso = Array.isArray(d) ? [...new Set(d.filter(n => Number.isInteger(n) && n >= 1 && n <= 5))].sort((a, b) => a - b) : [2, 3, 5];
            // contas novas (ex.: entrada com Google) aceitam os termos ao continuar: registra a data e a versão
            if (snap.exists() && !snap.metadata.hasPendingWrites && !contaAntiga && !snap.data().aceitouTermosEm && !termosGravado) { termosGravado = true; setDoc(doc(db, 'users', uid), { aceitouTermosEm: serverTimestamp(), versaoTermos: VERSAO_TERMOS }, { merge: true }).catch(() => {}); }
            if (appAberto && view.tab === 'c') desenhar(false);
            aplicarAcesso();
        }, (e) => { console.warn('perfil:', e); aplicarAcesso(); }));
        vencErro = '';
        unsubs.push(onSnapshot(query(collection(db, 'users', uid, 'visitas'), where('data', '>=', isoLocal(new Date(Date.now() - 90 * 86400000)))), (snap) => {
            visitas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            if (view.tab === 'l' || view.tab === 'c' || view.tab === 'h') desenhar(false);
        }));
        unsubs.push(onSnapshot(query(collection(db, 'solicitacoes'), where('promotorUid', '==', uid)), (snap) => {
            solicitacoes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            aplicarSolicitacoes();
            if (view.tab === 'l' || view.tab === 'c') desenhar(false);
        }, (e) => console.warn('solicitacoes:', e)));
        if (userInfo && userInfo.email) {
            unsubs.push(onSnapshot(collection(db, 'convites', userInfo.email.toLowerCase(), 'pedidos'), (snap) => {
                convitesRecebidos = snap.docs.map(d => ({ agenciaUid: d.id, ...d.data() }));
                if (view.tab === 'h' || view.tab === 'c') desenhar(false);
            }));
        }
        unsubs.push(onSnapshot(collection(db, 'users', uid, 'superiores'), (snap) => {
            superiores = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            if (!$('#superiores').classList.contains('hidden')) superioresRender();
            if (view.tab === 'c') desenhar(false);
        }));
        unsubs.push(onSnapshot(query(colVenc(), orderBy('dataRetirada')), { includeMetadataChanges: true }, (snap) => {
            vencErro = '';
            vencidos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            pendentes.vencidos = snap.docs.filter(d => d.metadata.hasPendingWrites).length; atualizarFaixaConexao();
            limparVencidosAntigos();
            atualizar();
        }, (e) => { vencErro = e.code || 'erro'; console.warn('vencidos:', e); atualizar(); }));
        atualizarFaixaConexao();
        if (contaAntiga) aplicarAcesso();   // conta antiga: abre na hora; as novas esperam o perfil carregar
    }
    function aoSair() {
        unsubs.forEach(u => u()); unsubs = [];
        uid = null; userInfo = null; contaAntiga = false; perfilAcesso = {}; appAberto = false; diasSalvos = false; termosGravado = false; diasAviso = [2, 3, 5]; lojas = []; produtos = []; vencidos = []; pendentes.lojas = pendentes.produtos = pendentes.vencidos = false; vencErro = ''; filtroVenc = ''; prontoProd = false;
        $('#a-senha').value = '';
        mostrar('auth');
    }

    async function iniciar() {
        const cfg = window.FIREBASE_CONFIG;
        if (!cfg || !cfg.apiKey || /COLE/i.test(cfg.apiKey)) {
            window.__appOk = true;
            $('#carregando-txt').innerHTML = 'Falta configurar o Firebase.<br><br><span class="normal-case font-medium text-gray-600">Preencha o arquivo <b>firebase-config.js</b> conforme o LEIA-ME.</span>';
            return;
        }
        registrarSW();
        app = initializeApp(cfg);
        // App Check: envia uma prova de que a requisição vem do app (reCAPTCHA Enterprise).
        // Chave do site é pública. No console, deixar o Firestore em "Monitorar" até validar.
        try {
            initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider('6LcP7h8uAAAAAEiq9TNzUbJVIsWf9t4R_lIbhv2h'), isTokenAutoRefreshEnabled: true });
        } catch (e) { console.warn('App Check indisponível:', e); }
        auth = getAuth(app);
        try {
            db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
        } catch (e) {
            console.warn('Cache offline indisponível:', e);
            db = initializeFirestore(app, {});
        }
        try {
            msgOk = await isSupported() && 'Notification' in window && 'serviceWorker' in navigator;
            if (msgOk) {
                messaging = getMessaging(app);
                onMessage(messaging, (p) => { const n = p.notification || {}; aviso(esc(n.body || ''), { titulo: n.title || 'PROMOTOR AJUDANTE', soConfirmar: true }); });
            }
        } catch (e) { msgOk = false; console.warn(e); }
    /* ---- escolha de perfil: promotor ou agência (antes do login) ---- */
    const URL_PERFIL = { promotor: 'https://promotor-ajudante.vercel.app', agencia: 'https://agencia-ajudante.vercel.app' };
    function fecharEscolhaPerfil() { const o = document.getElementById('escolha-perfil'); if (o) { o.classList.add('hidden'); o.classList.remove('flex'); } }
    function mostrarEscolhaPerfil() { const o = document.getElementById('escolha-perfil'); if (o) { o.classList.remove('hidden'); o.classList.add('flex'); } }
    function escolherPerfil(perfil) {
        if (perfil === 'promotor') { localStorage.setItem('perfil_escolhido', 'promotor'); fecharEscolhaPerfil(); }
        else location.href = URL_PERFIL.agencia + '/?perfil=agencia';
    }
    function iniciarEscolhaPerfil() {
        if (new URLSearchParams(location.search).get('perfil') === 'promotor') {
            localStorage.setItem('perfil_escolhido', 'promotor');
            history.replaceState(null, '', location.pathname);
        }
        document.querySelectorAll('[data-escolha]').forEach(b => b.addEventListener('click', () => escolherPerfil(b.dataset.escolha)));
        document.querySelectorAll('[data-escolha-trocar]').forEach(b => b.addEventListener('click', mostrarEscolhaPerfil));
        if (!localStorage.getItem('perfil_escolhido')) mostrarEscolhaPerfil();
    }
    iniciarEscolhaPerfil();

        onAuthStateChanged(auth, (user) => user ? entrar(user) : aoSair());
    }

    (window.lucide && lucide.createIcons());
    document.getElementById('pdv-arquivo')?.addEventListener('change', pdvArquivoEscolhido);
    document.getElementById('pdv-arquivo')?.addEventListener('cancel', () => pdvListaLojas(() => pdvAbrirCameraNativa()));
    aplicarTamanhoTexto();
    configurarCabecalhoRolagem();
    // no Android, mostra o banner de instalação mesmo sem o aviso automático do Chrome
    if (/Android/i.test(navigator.userAgent)) setTimeout(mostrarBannerInstalar, 3000);
    iniciar();
    