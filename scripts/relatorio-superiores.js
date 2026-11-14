// Relatório semanal para os superiores, no dia e hora que cada promotor escolheu (horário de Brasília).
// Roda de hora em hora; só envia quando o dia e a hora batem e ainda não foi enviado hoje.
// Começa em simulação (DRY_RUN=true): só mostra o que enviaria.
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const DRY = String(process.env.DRY_RUN || 'true') !== 'false';
const mail = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();

const brt = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const hoje = iso(brt);
const diaSemana = brt.getDay(), horaAgora = brt.getHours();
const inicio = (() => { const d = new Date(brt); d.setDate(d.getDate() - 6); return iso(d); })();
const fmtBR = (s) => String(s || '').split('-').reverse().join('/');
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function corpoHtml(promotor, porLoja, visitasPorLoja) {
  const lojas = [...new Set([...Object.keys(porLoja), ...Object.keys(visitasPorLoja)])].sort();
  if (!lojas.length) {
    return `<p>Nenhuma visita ou retirada de <b>${esc(promotor)}</b> registrada entre ${fmtBR(inicio)} e ${fmtBR(hoje)}.</p>`;
  }
  let h = `<p>Relatório semanal de <b>${esc(promotor)}</b>, de ${fmtBR(inicio)} a ${fmtBR(hoje)}.</p>`;
  for (const loja of lojas) {
    const itens = porLoja[loja] || [];
    const visitas = (visitasPorLoja[loja] || []).map(v => `${fmtBR(v.data)} às ${esc(v.hora)}`).join(', ');
    h += `<h3 style="margin:16px 0 4px">${esc(loja)}</h3>
      <p style="margin:0 0 6px;font-size:13px;color:#444">Visitas: ${visitas || 'nenhuma registrada'}</p>`;
    if (!itens.length) { h += `<p style="font-size:13px;color:#666">Sem retiradas no período.</p>`; continue; }
    h += `<table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse;font-size:13px">
      <tr style="background:#eee"><th>Produto</th><th>Marca</th><th>Qtd</th><th>Validade</th><th>Retirada</th><th>Motivo</th></tr>` +
      itens.map(v => `<tr><td>${esc(v.nome)}</td><td>${esc(v.marcaNome)}</td><td>${Number(v.qtd) || 0}</td><td>${fmtBR(v.dataVenc)}</td><td>${fmtBR(v.dataRetirada)}</td><td>${esc(v.motivo || '')}</td></tr>`).join('') +
      `</table>`;
  }
  return h + '<p style="color:#666;font-size:12px">Melo Staff · Promotor Ajudante</p>';
}

(async () => {
  const users = await db.collection('users').get();
  let enviados = 0;
  for (const u of users.docs) {
    const dados = u.data();
    const rel = dados.relatorio;
    if (!rel || rel.dia !== diaSemana || rel.hora !== horaAgora) continue;
    if (dados.relatorioEnviadoEm === hoje) continue;

    const base = db.collection('users').doc(u.id);
    const sups = (await base.collection('superiores').get()).docs.map(d => ({ id: d.id, ...d.data() }));
    if (!sups.length) continue;
    const vencs = (await base.collection('vencidos').get()).docs.map(d => d.data())
      .filter(v => v.dataRetirada >= inicio && v.dataRetirada <= hoje);
    const visitas = (await base.collection('visitas').get()).docs.map(d => d.data())
      .filter(v => v.data >= inicio && v.data <= hoje);
    const visitasPorLoja = {};
    for (const v of visitas) (visitasPorLoja[v.lojaNome || 'Loja'] ||= []).push(v);
    const promotor = dados.nome || dados.email || 'Promotor';

    for (const sup of sups) {
      if (!sup.email) continue;
      const marcas = (sup.marcas || []).map(m => String(m).trim().toLowerCase());
      // um só superior recebe todas as marcas; com mais de um, só as marcas escolhidas para ele
      const itens = sups.length === 1 ? vencs : vencs.filter(v => marcas.includes(String(v.marcaNome || '').trim().toLowerCase()));
      const porLoja = {};
      for (const v of itens) (porLoja[v.lojaNome || 'Loja'] ||= []).push(v);
      // lojas visitadas na semana entram mesmo sem retirada desta marca
      const assunto = `Relatório semanal de vencidos · ${promotor} · ${fmtBR(inicio)} a ${fmtBR(hoje)}`;
      if (DRY) { console.log(`[simulação] ${u.id} -> ${sup.email}: ${itens.length} itens, ${Object.keys(visitasPorLoja).length} lojas visitadas`); continue; }
      await mail.sendMail({ from: `Promotor Ajudante <${process.env.GMAIL_USER}>`, to: sup.email, subject: assunto, html: corpoHtml(promotor, porLoja, visitasPorLoja) });
      enviados++;
    }
    if (!DRY) await base.set({ relatorioEnviadoEm: hoje }, { merge: true });
  }
  console.log(`${DRY ? 'Simulação: ' : ''}relatórios ${DRY ? 'a enviar' : 'enviados'}: ${enviados}`);
})().catch(e => { console.error(e); process.exit(1); });
