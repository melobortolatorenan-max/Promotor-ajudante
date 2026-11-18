// Migração única: contas antigas que estavam no grátis passam a ter 60 dias de teste a partir de hoje.
// Não mexe na conta marcada como gratis (a sua). Começa em simulação (DRY_RUN=true).
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const DRY = String(process.env.DRY_RUN || 'true') !== 'false';
const FUSO = 'America/Sao_Paulo';
const APP = 'https://promotor-ajudante.vercel.app/';
const DATA_CORTE = new Date('2026-11-07T18:00:00-03:00');

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();
const messaging = admin.messaging();
const auth = admin.auth();
const transporte = nodemailer.createTransport({ service: 'gmail', auth: { user: 'melobortolato.renan@gmail.com', pass: process.env.GMAIL_APP_PASSWORD } });
const iso = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(d);
const hoje = iso(new Date());
function somaDias(isoStr, n) {
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

async function main() {
  console.log(`Hoje (Brasília): ${hoje} · ${DRY ? 'SIMULAÇÃO' : 'envio real'}`);
  const usuarios = await db.collection('users').get();
  let migradas = 0;
  for (const doc of usuarios.docs) {
    const u = doc.data(), uid = doc.id;
    if (u.gratis === true || u.plano || u.acessoAte || u.assinatura) continue;
    let rec;
    try { rec = await auth.getUser(uid); } catch (e) { continue; }
    if (new Date(rec.metadata.creationTime) >= DATA_CORTE) continue;   // contas novas já têm o teste pela data de cadastro
    const fim = somaDias(hoje, 60);
    migradas++;
    if (DRY) { console.log(`[simulação] ${uid} (${u.email}): teste até ${fim}`); continue; }
    await db.collection('users').doc(uid).set({ plano: 'teste', acessoAte: fim, testeIniciadoEm: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    const tokens = (await db.collection('users').doc(uid).collection('tokens').get()).docs.map(d => d.data().token).filter(Boolean);
    if (tokens.length) {
      await messaging.sendEachForMulticast({ tokens, notification: { title: 'Seu teste grátis de 60 dias começou', body: 'Você tem 60 dias de teste grátis. Veja os planos em Configurações.' }, webpush: { fcmOptions: { link: APP } } });
    }
    if (u.email) {
      await transporte.sendMail({ from: 'Promotor Ajudante <melobortolato.renan@gmail.com>', to: u.email, subject: 'Seu teste grátis de 60 dias começou',
        text: 'Olá! Seu teste grátis do Promotor Ajudante começou hoje e vai até ' + fim + '. Depois, escolha seu plano em Configurações: mensal (R$ 50,00, cartão) ou anual (R$ 510,00, Pix ou débito).' });
    }
  }
  console.log(`Contas ${DRY ? 'a migrar' : 'migradas'}: ${migradas}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
