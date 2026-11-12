// Rotina diária (GitHub Actions):
//  - dia 35 após o fim do acesso: e-mail avisando que a conta será excluída em 10 dias;
//  - dia 40: notificação no celular (para quem tem o app instalado), avisando 5 dias;
//  - dia 45: apaga a conta, os dados e o login. Contas livres (gratis) não são apagadas.
// Começa em simulação (DRY_RUN=true): só mostra o que faria. Para valer, DRY_RUN=false.
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const DRY = String(process.env.DRY_RUN || 'true') !== 'false';
const APP_URL = 'https://promotor-ajudante.vercel.app/';
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();
const messaging = admin.messaging();
const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
const mail = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

// dias entre duas datas ISO (AAAA-MM-DD)
function diasEntre(a, b) {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
}
function somaDias(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

async function avisarEmail(u, faltam) {
  if (!u.email) return false;
  const assunto = `Promotor Ajudante: sua conta será excluída em ${faltam} dias`;
  const texto = `Olá${u.nome ? ', ' + u.nome : ''}.\n\n` +
    `O período de acesso do Promotor Ajudante terminou. Se o pagamento não for feito, sua conta e todos os dados ` +
    `(lojas, produtos e vencidos) serão excluídos em ${faltam} dias.\n\n` +
    `Para manter seus dados, entre no app e renove o acesso (R$ 50,00 por 365 dias) em Configurações > Meu plano:\n${APP_URL}\n\n` +
    `Melo Staff`;
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
    const dias = diasEntre(u.acessoAte, hoje);      // dias desde o fim do acesso

    // dia 45 (ou mais): exclusão
    if (dias > 45) {
      console.log(`${DRY ? '[simulação] ' : ''}excluir conta ${d.id} (acesso terminou em ${u.acessoAte})`);
      excluidas++;
      if (DRY) continue;
      for (const col of ['lojas', 'produtos', 'vencidos', 'tokens']) {
        const sub = await db.collection('users').doc(d.id).collection(col).get();
        for (const x of sub.docs) await x.ref.delete();
      }
      await d.ref.delete();
      try { await admin.auth().deleteUser(d.id); } catch (e) { console.warn('login não removido:', e.message); }
      continue;
    }

    // dia 35 a 45: e-mail (uma vez por ciclo de acesso)
    if (dias >= 35 && u.avisoEmailPara !== u.acessoAte) {
      if (await avisarEmail(u, 45 - dias)) {
        emails++;
        if (!DRY) await d.ref.set({ avisoEmailPara: u.acessoAte }, { merge: true });
      }
    }
    // dia 40 a 45: notificação no celular (uma vez por ciclo de acesso)
    if (dias >= 40 && u.avisoPushPara !== u.acessoAte) {
      if (await avisarPush(d.id, 45 - dias)) {
        pushes++;
        if (!DRY) await d.ref.set({ avisoPushPara: u.acessoAte }, { merge: true });
      }
    }
  }
  console.log(`${DRY ? 'Simulação: ' : ''}e-mails: ${emails} · notificações: ${pushes} · contas ${DRY ? 'a excluir' : 'excluídas'}: ${excluidas}`);
})().catch(e => { console.error(e); process.exit(1); });
