// Aviso diário de produto vencido ainda cadastrado (validade passada, sem retirada).
// Envia 1 aviso por dia para cada conta, por notificação e e-mail. Começa em simulação (DRY_RUN=true).
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const DRY = String(process.env.DRY_RUN || 'true') !== 'false';
const mail = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();

const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());

(async () => {
  const users = await db.collection('users').get();
  let enviados = 0;
  for (const u of users.docs) {
    const dados = u.data();
    if (!dados.email) continue;
    if (dados.avisoVencidosEm === hoje) continue;          // já avisou hoje
    const vencidos = (await db.collection('users').doc(u.id).collection('produtos').get())
      .docs.map(d => d.data()).filter(p => p.data && p.data < hoje);
    if (!vencidos.length) continue;

    const total = vencidos.length;
    const assunto = `Promotor Ajudante: ${total} produto(s) vencido(s) ainda cadastrado(s)`;
    const texto = `Olá${dados.nome ? ', ' + dados.nome : ''}.\n\n` +
      `Você tem ${total} produto(s) com validade vencida ainda na lista.\n` +
      `Retire-os da prateleira e registre como vencido no app, para manter o controle em dia.\n\n` +
      `Melo Staff`;

    if (DRY) { console.log(`[simulação] aviso para ${dados.email}: ${total} vencido(s)`); continue; }
    await mail.sendMail({ from: `Promotor Ajudante <${process.env.GMAIL_USER}>`, to: dados.email, subject: assunto, text: texto });
    await db.collection('users').doc(u.id).update({ avisoVencidosEm: hoje });
    enviados++;
  }
  console.log(`${DRY ? 'Simulação: ' : ''}avisos ${DRY ? 'a enviar' : 'enviados'}: ${enviados}`);
})().catch(e => { console.error(e); process.exit(1); });
