// Rotina diária (GitHub Actions):
//  - dia 36 após o fim do acesso (o acesso termina no dia 0): e-mail avisando que a conta será excluída em 10 dias;
//  - dia 41: notificação no celular (para quem tem o app instalado), avisando 5 dias;
//  - dia 46 (45 dias contados a partir do dia 1 após o fim do acesso): apaga a conta, os dados e o login.
//    Contas livres (gratis) não são apagadas.
// Começa em simulação (DRY_RUN=true): só mostra o que faria.
// Modo de teste: se EMAIL_TESTE for informado, envia UM e-mail de exemplo para esse endereço e para.
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const DRY = String(process.env.DRY_RUN || 'false') !== 'false';
const EXCLUIR = String(process.env.EXCLUIR || 'true') === 'true';   // exclusão automática após 45 dias
const EMAIL_TESTE = (process.env.EMAIL_TESTE || '').trim();
const APP_URL = 'https://promotor-ajudante.vercel.app/';
const mail = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

function corpoEmail(nome, faltam) {
  const assunto = `Promotor Ajudante: sua conta será excluída em ${faltam} dias`;
  const texto = `Olá${nome ? ', ' + nome : ''}.\n\n` +
    `O período de acesso do Promotor Ajudante terminou. Se o pagamento não for feito, sua conta e todos os dados ` +
    `(lojas, produtos e vencidos) serão excluídos em ${faltam} dias.\n\n` +
    `Para manter seus dados, entre no app e renove o acesso (R$ 50,00 por 365 dias) em Configurações > Meu plano:\n${APP_URL}\n\n` +
    `Melo Staff`;
  return { assunto, texto };
}

if (EMAIL_TESTE) {
  (async () => {
    const { assunto, texto } = corpoEmail('teste', 10);
    await mail.sendMail({ from: `Promotor Ajudante <${process.env.GMAIL_USER}>`, to: EMAIL_TESTE, subject: '[TESTE] ' + assunto, text: texto });
    console.log(`E-mail de teste enviado para ${EMAIL_TESTE}. Nenhuma conta foi alterada.`);
  })().catch(e => { console.error(e); process.exit(1); });
  return;
}

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();
const messaging = admin.messaging();
const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());

function diasEntre(a, b) {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
}
function somaDias(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

async function avisarEmail(u, faltam) {
  if (!u.email) return false;
  const { assunto, texto } = corpoEmail(u.nome, faltam);
  if (DRY) { console.log(`[simulação] e-mail para ${u.email}: ${assunto}`); return true; }
  await mail.sendMail({ from: `Promotor Ajudante <${process.env.GMAIL_USER}>`, to: u.email, subject: assunto, text: texto });
  return true;
}

async function avisarPush(uid, faltam) {
  const tk = (await db.collection('users').doc(uid).collection('tokens').get()).docs.map(d => d.data().token).filter(Boolean);
  if (!tk.length) return false;
  if (DRY) { console.log(`[simulação] notificação para ${uid} (${tk.length} aparelho(s)): faltam ${faltam} dias`); return true; }
  const r = await messaging.sendEachForMulticast({
    tokens: tk,
    notification: { title: 'Promotor Ajudante', body: `Sua conta será excluída em ${faltam} dias se não houver pagamento. Renove no app.` },
    webpush: { fcmOptions: { link: APP_URL } },
  });
  return r.successCount > 0;
}

(async () => {
  const snap = await db.collection('users').get();
  let excluidas = 0, emails = 0, pushes = 0;
  for (const d of snap.docs) {
    const u = d.data();
    if (u.gratis === true || typeof u.acessoAte !== 'string') continue;
    const dias = diasEntre(u.acessoAte, hoje);

    if (dias > 45) {
      excluidas++;
      if (!EXCLUIR || DRY) {
        console.log(`${DRY ? '[simulação] ' : ''}aguardando sua revisão: conta ${d.id} (acesso terminou em ${u.acessoAte})`);
        continue;
      }
      console.log(`excluindo conta ${d.id} (acesso terminou em ${u.acessoAte})`);
      for (const col of ['lojas', 'produtos', 'vencidos', 'tokens']) {
        const sub = await db.collection('users').doc(d.id).collection(col).get();
        for (const x of sub.docs) await x.ref.delete();
      }
      await d.ref.delete();
      try { await admin.auth().deleteUser(d.id); } catch (e) { console.warn('login não removido:', e.message); }
      continue;
    }

    if (dias >= 36 && u.avisoEmailPara !== u.acessoAte) {
      if (await avisarEmail(u, 46 - dias)) {
        emails++;
        if (!DRY) await d.ref.set({ avisoEmailPara: u.acessoAte }, { merge: true });
      }
    }
    if (dias >= 41 && u.avisoPushPara !== u.acessoAte) {
      if (await avisarPush(d.id, 46 - dias)) {
        pushes++;
        if (!DRY) await d.ref.set({ avisoPushPara: u.acessoAte }, { merge: true });
      }
    }
  }
  console.log(`${DRY ? 'Simulação: ' : ''}e-mails: ${emails} · notificações: ${pushes} · contas com prazo vencido: ${excluidas}${EXCLUIR && !DRY ? ' (excluídas)' : ' (aguardando sua revisão)'}`);
})().catch(e => { console.error(e); process.exit(1); });
