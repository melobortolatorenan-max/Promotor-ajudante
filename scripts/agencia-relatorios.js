// Relatórios automáticos da agência.
// MODO=relatorio: resumo semanal da equipe (últimos 7 dias), por e-mail, na segunda de manhã.
// MODO=backup: planilha CSV completa de cada agência (só das marcas escolhidas), no domingo.
// Começa em simulação (DRY_RUN=true): só mostra o que enviaria.
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const MODO = process.env.MODO || 'relatorio';
const DRY = String(process.env.DRY_RUN || 'true') !== 'false';
const TZ = 'America/Sao_Paulo';
const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();

const hojeISO = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
const addDias = (iso, n) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };
const inicioSemana = addDias(hojeISO, -6);
const dataBR = (iso) => (iso ? String(iso).split('-').reverse().join('/') : '');
const norm = (t) => String(t || '').trim().toLowerCase();
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const diasDaLoja = (l) => Array.isArray(l.diasVisita) ? l.diasVisita : (typeof l.diaVisita === 'number' ? [l.diaVisita] : []);
const isoDe = (ts) => { const d = ts && ts.toDate ? ts.toDate() : (ts instanceof Date ? ts : null); return d ? new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d) : null; };
const weekday = (iso) => new Date(iso + 'T12:00:00Z').getUTCDay();

async function dadosPromotor(uid) {
  const base = db.collection('users').doc(uid);
  const [lojas, visitas, produtos, vencidos] = await Promise.all(['lojas', 'visitas', 'produtos', 'vencidos'].map(c => base.collection(c).get()));
  return {
    lojas: lojas.docs.map(d => ({ id: d.id, ...d.data() })),
    visitas: visitas.docs.map(d => ({ id: d.id, ...d.data() })),
    produtos: produtos.docs.map(d => ({ id: d.id, ...d.data(), dia: isoDe(d.data().criadoEm) })),
    vencidos: vencidos.docs.map(d => ({ id: d.id, ...d.data() })),
  };
}

// Mesmo filtro do app da agência: só as marcas escolhidas para o promotor
function filtrar(d, sel) {
  if (!sel.length) return { ...d, semFiltro: true };
  const lojas = d.lojas.filter(l => (l.marcas || []).some(m => sel.includes(norm(m.nome))));
  const ids = new Set(lojas.map(l => l.id));
  const daMarca = (x) => { const m = norm(x.marcaNome || x.marca); return m ? sel.includes(m) : ids.has(x.lojaId); };
  return { lojas, visitas: d.visitas.filter(v => ids.has(v.lojaId)), produtos: d.produtos.filter(daMarca), vencidos: d.vencidos.filter(daMarca), semFiltro: false };
}

function resumoSemana(f) {
  let previstas = 0, feitas = 0;
  for (let i = 6; i >= 0; i--) {
    const iso = addDias(hojeISO, -i), w = weekday(iso);
    const p = new Set([...f.lojas.filter(l => diasDaLoja(l).includes(w) && !f.visitas.some(v => v.lojaId === l.id && v.data === iso && v.adiadaPara)).map(l => l.id), ...f.visitas.filter(v => v.extra && v.data === iso).map(v => v.lojaId)]).size;
    const r = new Set(f.visitas.filter(v => v.data === iso && !v.semVisita && !v.extra).map(v => v.lojaId)).size;
    previstas += p; feitas += r;
  }
  return { previstas, feitas };
}

async function blocosDaAgencia(ag, vincs) {
  const blocos = [];
  for (const v of vincs) {
    const sel = (v.marcas || []).map(norm).filter(Boolean);
    const f = filtrar(await dadosPromotor(v.uid), sel);
    const { previstas, feitas } = resumoSemana(f);
    const semVisita = f.visitas.filter(x => x.data >= inicioSemana && x.data <= hojeISO && x.semVisita && !x.adiadaPara).length;
    const adiadas = f.visitas.filter(x => x.data >= inicioSemana && x.data <= hojeISO && x.adiadaPara).length;
    const porMarca = {};
    f.vencidos.filter(x => x.dataRetirada >= inicioSemana && x.dataRetirada <= hojeISO).forEach(x => {
      const m = String(x.marcaNome || x.marca || 'Sem marca').trim();
      porMarca[m] = (porMarca[m] || 0) + (Number(x.qtd) || 0);
    });
    const motivos = f.visitas.filter(x => x.data >= inicioSemana && x.data <= hojeISO && x.semVisita && !x.adiadaPara)
      .sort((x, y) => y.data.localeCompare(x.data)).map(x => ({ data: x.data, loja: x.lojaNome || '', motivo: x.motivo || '' }));
    blocos.push({ nome: v.apelido || v.nome || 'Promotor', previstas, feitas, semVisita, adiadas, motivos, porMarca, semFiltro: f.semFiltro });
  }
  return blocos;
}

function htmlRelatorio(ag, blocos) {
  const motivosHtml = blocos.filter(b => b.motivos.length).map(b =>
    `<h3 style="font-size:13px;color:#b45309;margin:14px 0 4px">${esc(b.nome)}</h3>` +
    b.motivos.map(m => `<div style="font-size:12px;padding:4px 0;border-bottom:1px solid #eee">${dataBR(m.data)} · <b>${esc(m.loja || 'Loja')}</b>: ${esc(m.motivo || 'sem motivo informado')}</div>`).join('')
  ).join('');
  const linhas = blocos.map(b => {
    const pct = b.previstas ? Math.round(b.feitas / b.previstas * 100) : 0;
    const marcas = Object.entries(b.porMarca).map(([m, q]) => `${esc(m)}: ${q} un.`).join('<br>') || '—';
    return `<tr>
      <td style="padding:8px;border-bottom:1px solid #ddd"><b>${esc(b.nome)}</b>${b.semFiltro ? '<br><span style="color:#b45309;font-size:11px">sem marcas escolhidas</span>' : ''}</td>
      <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center">${b.feitas} / ${b.previstas} (${pct}%)</td>
      <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;color:${b.semVisita ? '#b91c1c' : '#555'}">${b.semVisita}</td>
      <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;color:#b45309">${b.adiadas}</td>
      <td style="padding:8px;border-bottom:1px solid #ddd;font-size:12px">${marcas}</td></tr>`;
  }).join('');
  return `<div style="font-family:Arial,sans-serif;color:#111">
    <h2 style="color:#b45309;margin:0 0 4px">Relatório semanal da equipe</h2>
    <p style="color:#555;margin:0 0 12px">${esc(ag.nome || 'Agência')} · ${dataBR(inicioSemana)} a ${dataBR(hojeISO)}</p>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="background:#f59e0b;color:#111"><th style="padding:8px;text-align:left">Promotor</th><th style="padding:8px">Visitas</th><th style="padding:8px">Sem visita</th><th style="padding:8px">Adiadas</th><th style="padding:8px;text-align:left">Retirado por marca</th></tr></thead>
      <tbody>${linhas || '<tr><td colspan="5" style="padding:8px">Nenhum promotor vinculado.</td></tr>'}</tbody>
    </table>
    ${motivosHtml ? `<h2 style="color:#b45309;font-size:14px;margin:18px 0 0">Motivos das lojas sem visita</h2>${motivosHtml}` : ''}
    <p style="color:#777;font-size:11px;margin-top:14px">Promotor Ajudante · Melo Staff</p></div>`;
}

const csvCel = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
async function csvDaAgencia(vincs) {
  const linhas = [];
  for (const v of vincs) {
    const sel = (v.marcas || []).map(norm).filter(Boolean);
    const f = filtrar(await dadosPromotor(v.uid), sel);
    const nomeLoja = (id) => (f.lojas.find(l => l.id === id) || {}).nome || '';
    const nome = v.apelido || v.nome || 'Promotor';
    linhas.push([`PROMOTOR: ${nome}`]);
    linhas.push(['VISITAS'], ['Data', 'Hora', 'Loja', 'Situação']);
    f.visitas.slice().sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
      .forEach(x => linhas.push([dataBR(x.data), x.hora, x.lojaNome || nomeLoja(x.lojaId), x.adiadaPara ? 'Adiada para ' + dataBR(x.adiadaPara) : (x.semVisita ? 'Sem visita: ' + (x.motivo || '') : (x.extra ? 'Adiada de ' + dataBR(x.adiadaDe) : 'Visitada'))]));
    linhas.push([], ['ENTRADAS'], ['Data', 'Produto', 'Loja', 'Marca']);
    f.produtos.forEach(x => linhas.push([dataBR(x.dia), x.nome, nomeLoja(x.lojaId), x.marcaNome || x.marca || '']));
    linhas.push([], ['SAÍDAS (vencidos retirados)'], ['Data retirada', 'Produto', 'Loja', 'Marca', 'Quantidade', 'Validade', 'Motivo']);
    f.vencidos.forEach(x => linhas.push([dataBR(x.dataRetirada), x.nome, nomeLoja(x.lojaId), x.marcaNome || x.marca || '', x.qtd, dataBR(x.dataVenc), x.motivo || '']));
    linhas.push([], []);
  }
  return '\uFEFF' + linhas.map(r => r.map(csvCel).join(';')).join('\n');
}

(async () => {
  const agencias = await db.collection('agencias').get();
  let enviados = 0;
  for (const doc of agencias.docs) {
    const ag = doc.data();
    if (!ag.email) continue;
    const vs = await db.collection('vinculos').doc(ag.email).collection('promotores').get();
    const vincs = vs.docs.map(d => ({ uid: d.id, ...d.data() }));
    if (!vincs.length) continue;
    try {
      if (MODO === 'backup') {
        const csv = await csvDaAgencia(vincs);
        const assunto = `Backup semanal · ${ag.nome || 'Agência'} · ${dataBR(hojeISO)}`;
        if (DRY) console.log(`[simulação] backup para ${ag.email} (${vincs.length} promotor(es))`);
        else await mail.sendMail({ from: `Promotor Ajudante <${process.env.GMAIL_USER}>`, to: ag.email, subject: assunto, text: 'Segue em anexo a planilha de backup da agência.', attachments: [{ filename: `Backup - ${ag.nome || 'agencia'} - ${hojeISO}.csv`, content: csv }] });
      } else {
        const blocos = await blocosDaAgencia(ag, vincs);
        const assunto = `Relatório semanal da equipe · ${dataBR(inicioSemana)} a ${dataBR(hojeISO)}`;
        if (DRY) console.log(`[simulação] relatório para ${ag.email}: ${blocos.length} promotor(es)`);
        else await mail.sendMail({ from: `Promotor Ajudante <${process.env.GMAIL_USER}>`, to: ag.email, subject: assunto, html: htmlRelatorio(ag, blocos) });
      }
      enviados++;
    } catch (e) { console.error('falha na agência', doc.id, e); }
  }
  console.log(`${DRY ? 'Simulação: ' : ''}${MODO} para ${enviados} agência(s).`);
})().catch(e => { console.error(e); process.exit(1); });
