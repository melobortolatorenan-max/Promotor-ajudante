// Envio manual do relatório semanal aos superiores (botão "Enviar relatório agora" no app).
// Usa a mesma regra do envio automático: últimos 7 dias, vencidos e visitas, por superior.
// Variáveis na Vercel: FIREBASE_SERVICE_ACCOUNT e GMAIL_APP_PASSWORD.
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const APP_EMAIL = 'melobortolato.renan@gmail.com';
const ESPERA_MS = 10 * 60 * 1000;

function iniciar() {
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
}
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtBR = (s) => String(s || '').split('-').reverse().join('/');
const esc = (t) => String(t ?? '').replace(/[&<>\"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function corpoHtml(promotor, porLoja, visitasPorLoja, inicio, hoje) {
  const lojas = [...new Set([...Object.keys(porLoja), ...Object.keys(visitasPorLoja)])].sort();
  if (!lojas.length) return `<p>Nenhuma visita ou retirada de <b>${esc(promotor)}</b> registrada entre ${fmtBR(inicio)} e ${fmtBR(hoje)}.</p>`;
  let h = `<p>Relatório semanal de <b>${esc(promotor)}</b>, de ${fmtBR(inicio)} a ${fmtBR(hoje)}.</p>`;
  for (const loja of lojas) {
    const itens = porLoja[loja] || [];
    const visitas = (visitasPorLoja[loja] || []).map(v => v.semVisita ? `${fmtBR(v.data)}: <b style="color:#b91c1c">sem visita</b>, motivo: ${esc(v.motivo || '-')}` : `${fmtBR(v.data)} às ${esc(v.hora)}`).join('; ');
    h += `<h3 style="margin:16px 0 4px">${esc(loja)}</h3><p style="margin:0 0 6px;font-size:13px;color:#444">Visitas: ${visitas || 'nenhuma registrada'}</p>`;
    if (!itens.length) { h += `<p style="font-size:13px;color:#666">Sem retiradas no período.</p>`; continue; }
    h += `<table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse;font-size:13px"><tr style="background:#eee"><th>Produto</th><th>Marca</th><th>Qtd</th><th>Validade</th><th>Retirada</th><th>Motivo</th></tr>` +
      itens.map(v => `<tr><td>${esc(v.nome)}</td><td>${esc(v.marcaNome)}</td><td>${Number(v.qtd) || 0}</td><td>${fmtBR(v.dataVenc)}</td><td>${fmtBR(v.dataRetirada)}</td><td>${esc(v.motivo || '')}</td></tr>`).join('') +
      `</table>`;
  }
  return h + '<p style="color:#666;font-size:12px">Melo Staff · Promotor Ajudante</p>';
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ erro: 'metodo' });
  try {
    iniciar();
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ erro: 'sem-login' });
    const dec = await admin.auth().verifyIdToken(token);
    const db = admin.firestore();
    const base = db.collection('users').doc(dec.uid);
    const dados = (await base.get()).data() || {};
    if (dados.relatorioManualEm && Date.now() - dados.relatorioManualEm.toMillis() < ESPERA_MS) return res.status(429).json({ erro: 'espere' });

    const hoje = iso(new Date(Date.now() - 3 * 3600 * 1000));          // data de Brasília
    const inicioDt = new Date(Date.now() - 3 * 3600 * 1000); inicioDt.setDate(inicioDt.getDate() - 6);
    const inicio = iso(inicioDt);

    const sups = (await base.collection('superiores').get()).docs.map(d => ({ id: d.id, ...d.data() }));
    const comEmail = sups.filter(s => s.email);
    if (!comEmail.length) return res.status(400).json({ erro: 'sem-superiores' });
    const vencs = (await base.collection('vencidos').get()).docs.map(d => d.data()).filter(v => v.dataRetirada >= inicio && v.dataRetirada <= hoje);
    const visitas = (await base.collection('visitas').get()).docs.map(d => d.data()).filter(v => v.data >= inicio && v.data <= hoje);
    const visitasPorLoja = {};
    for (const v of visitas) (visitasPorLoja[v.lojaNome || 'Loja'] ||= []).push(v);
    const promotor = dados.nome || dados.email || 'Promotor';

    const transporte = nodemailer.createTransport({ service: 'gmail', auth: { user: APP_EMAIL, pass: process.env.GMAIL_APP_PASSWORD } });
    let enviados = 0;
    for (const sup of comEmail) {
      const marcas = (sup.marcas || []).map(m => String(m).trim().toLowerCase());
      const itens = sups.length === 1 ? vencs : vencs.filter(v => marcas.includes(String(v.marcaNome || '').trim().toLowerCase()));
      const porLoja = {};
      for (const v of itens) (porLoja[v.lojaNome || 'Loja'] ||= []).push(v);
      await transporte.sendMail({
        from: `Promotor Ajudante <${APP_EMAIL}>`, to: sup.email,
        subject: `Relatório semanal de vencidos · ${promotor} · ${fmtBR(inicio)} a ${fmtBR(hoje)}`,
        html: corpoHtml(promotor, porLoja, visitasPorLoja, inicio, hoje),
      });
      enviados++;
    }
    await base.set({ relatorioManualEm: admin.firestore.Timestamp.now() }, { merge: true });
    return res.status(200).json({ ok: true, enviados });
  } catch (e) {
    console.error('enviar-relatorio:', e);
    return res.status(500).json({ erro: 'falha' });
  }
};
