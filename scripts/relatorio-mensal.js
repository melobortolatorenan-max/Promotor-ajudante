// Resumo mensal de vencidos, enviado por e-mail para cada conta (roda no dia 1, referente ao mês anterior).
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

// período: mês anterior ao atual (fuso de Brasília)
const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
const [ano, mes] = hoje.split('-').map(Number);
const anoAnt = mes === 1 ? ano - 1 : ano, mesAnt = mes === 1 ? 12 : mes - 1;
const ultimoDia = new Date(Date.UTC(anoAnt, mesAnt, 0)).getUTCDate();
const ini = `${anoAnt}-${String(mesAnt).padStart(2, '0')}-01`;
const fim = `${anoAnt}-${String(mesAnt).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
const nomeMes = new Date(Date.UTC(anoAnt, mesAnt - 1, 1)).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });

(async () => {
  const users = await db.collection('users').get();
  let enviados = 0;
  for (const u of users.docs) {
    const dados = u.data();
    if (!dados.email) continue;
    const vencidos = (await db.collection('users').doc(u.id).collection('vencidos').get())
      .docs.map(d => d.data()).filter(v => v.dataRetirada >= ini && v.dataRetirada <= fim);
    if (!vencidos.length) continue;

    const lojas = {};
    (await db.collection('users').doc(u.id).collection('lojas').get()).docs.forEach(d => { lojas[d.id] = d.data().nome || 'Loja'; });
    const porLoja = {}, porMotivo = {};
    let total = 0;
    for (const v of vencidos) {
      const q = Number(v.qtd) || 0;
      total += q;
      const loja = lojas[v.lojaId] || 'Loja';
      porLoja[loja] = (porLoja[loja] || 0) + q;
      const motivo = (v.motivo || '').trim() || 'Sem motivo informado';
      porMotivo[motivo] = (porMotivo[motivo] || 0) + q;
    }
    const linhas = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}: ${n} un.`).join('\n');
    const assunto = `Promotor Ajudante: resumo de vencidos de ${nomeMes}`;
    const texto = `Olá${dados.nome ? ', ' + dados.nome : ''}.\n\n` +
      `Resumo de vencidos de ${nomeMes}.\n\n` +
      `Total retirado: ${total} unidades em ${vencidos.length} registros.\n\n` +
      `Por loja:\n${linhas(porLoja)}\n\n` +
      `Por motivo:\n${linhas(porMotivo)}\n\n` +
      `Melo Staff`;

    if (DRY) { console.log(`[simulação] resumo para ${dados.email}: ${total} unidades em ${vencidos.length} registros`); continue; }
    await mail.sendMail({ from: `Promotor Ajudante <${process.env.GMAIL_USER}>`, to: dados.email, subject: assunto, text: texto });
    enviados++;
  }
  console.log(`${DRY ? 'Simulação: ' : ''}resumos ${DRY ? 'a enviar' : 'enviados'}: ${enviados}`);
})().catch(e => { console.error(e); process.exit(1); });
