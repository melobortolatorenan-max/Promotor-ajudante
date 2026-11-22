// Backup semanal: envia para o e-mail de cada promotor uma planilha (CSV) com produtos, vencimentos e visitas.
// Roda pelo GitHub Actions ("Backup semanal"). Começa em simulação (DRY_RUN=true).
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const DRY = String(process.env.DRY_RUN || 'true') !== 'false';

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();
const transporte = nodemailer.createTransport({ service: 'gmail', auth: { user: 'melobortolato.renan@gmail.com', pass: process.env.GMAIL_APP_PASSWORD } });

// CSV com ; (abre direto no Excel do Brasil) e aspas nos textos
const celula = (v) => { const s = v === undefined || v === null ? '' : (v && v.toDate ? v.toDate().toISOString() : String(v)); return '"' + s.replace(/"/g, '""') + '"'; };
const linha = (cols) => cols.map(celula).join(';');
const dataHoraSP = (ts) => ts && ts.toDate ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(ts.toDate()) : '';

async function backupDe(uid) {
  const base = db.collection('users').doc(uid);
  const [lojasS, prodS, visS] = await Promise.all([base.collection('lojas').get(), base.collection('produtos').get(), base.collection('visitas').get()]);
  const lojas = new Map(lojasS.docs.map(d => [d.id, d.data()]));
  const partes = [];
  partes.push('PRODUTOS E VENCIMENTOS');
  partes.push(linha(['Loja', 'Marca', 'Produto', 'Setor', 'Código', 'Quantidade', 'Validade']));
  prodS.docs.forEach(d => {
    const p = d.data(), l = lojas.get(p.lojaId) || {};
    const marca = ((l.marcas || []).find(m => m.id === p.marcaId) || {}).nome || '';
    partes.push(linha([l.nome || '', marca, p.nome || '', p.setor || '', p.codigo || '', p.qtd || '', p.data || '']));
  });
  partes.push('');
  partes.push('VISITAS');
  partes.push(linha(['Loja', 'Data', 'Hora', 'Sem visita', 'Motivo']));
  visS.docs.forEach(d => {
    const v = d.data(), l = lojas.get(v.lojaId) || {};
    partes.push(linha([l.nome || v.lojaNome || '', v.data || '', v.hora || '', v.semVisita ? 'sim' : 'não', v.motivo || '']));
  });
  return { csv: '\uFEFF' + partes.join('\r\n'), n: prodS.size, v: visS.size, lojas: lojasS.size };
}

async function main() {
  const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  console.log(`Backup semanal · ${hoje} · ${DRY ? 'SIMULAÇÃO' : 'envio real'}`);
  const usuarios = await db.collection('users').get();
  let enviados = 0;
  for (const doc of usuarios.docs) {
    const u = doc.data();
    if (!u.email) continue;
    const r = await backupDe(doc.id);
    if (r.n === 0 && r.v === 0) continue;                           // conta sem dados: não envia
    if (DRY) { console.log(`[simulação] ${u.email}: ${r.n} produtos, ${r.v} visitas, ${r.lojas} lojas`); enviados++; continue; }
    await transporte.sendMail({
      from: 'Promotor Ajudante <melobortolato.renan@gmail.com>', to: u.email,
      subject: `Backup dos seus dados · ${hoje}`,
      text: 'Olá! Segue em anexo o backup semanal dos seus dados do Promotor Ajudante (produtos, vencimentos e visitas). Guarde este arquivo em um lugar seguro.',
      attachments: [{ filename: `backup-promotor-${hoje}.csv`, content: r.csv, contentType: 'text/csv; charset=utf-8' }],
    });
    enviados++;
  }
  console.log(`${DRY ? 'Backups a enviar' : 'Backups enviados'}: ${enviados}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
