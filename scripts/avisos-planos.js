// Avisos de plano: roda todo dia pelo GitHub Actions ("Avisos de planos").
// Avisa 30, 15 e 10 dias antes do fim do teste ou da renovação anual, por notificação e e-mail.
// Também avisa uma vez quando a cobrança mensal falha. Começa em simulação (DRY_RUN=true).
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const DRY = String(process.env.DRY_RUN || 'true') !== 'false';
const FUSO = 'America/Sao_Paulo';
const APP = 'https://promotor-ajudante.vercel.app/';
const AVISOS = [30, 15, 10];
const DIAS_TESTE = 60;

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
function diasEntre(a, b) { // a - b, em dias
  const [y, m, d] = a.split('-').map(Number), [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y2, m2 - 1, d2)) / 86400000);
}

async function avisar(uid, u, chave, msg) {
  if ((u.avisosEnviados || {})[chave]) return;             // já enviado
  if (DRY) { console.log(`[simulação] ${uid} (${chave}): ${msg.corpo}`); return; }
  const tokens = (await db.collection('users').doc(uid).collection('tokens').get()).docs.map(d => d.data().token).filter(Boolean);
  if (tokens.length) {
    await messaging.sendEachForMulticast({ tokens, notification: { title: msg.titulo, body: msg.corpo }, webpush: { fcmOptions: { link: APP } } });
  }
  if (u.email) {
    await transporte.sendMail({ from: 'Promotor Ajudante <melobortolato.renan@gmail.com>', to: u.email, subject: msg.assunto, text: msg.texto });
  }
  await db.collection('users').doc(uid).set({ avisosEnviados: { [chave]: hoje } }, { merge: true });
}

async function main() {
  console.log(`Hoje (Brasília): ${hoje} · ${DRY ? 'SIMULAÇÃO' : 'envio real'}`);
  const usuarios = await db.collection('users').get();
  for (const doc of usuarios.docs) {
    const u = doc.data(), uid = doc.id;
    if (u.gratis === true) continue;                       // conta grátis não recebe avisos de plano

    // 1) plano anual: aviso antes da renovação
    if (u.plano === 'anual' && typeof u.acessoAte === 'string') {
      const d = diasEntre(u.acessoAte, hoje);
      if (AVISOS.includes(d)) {
        await avisar(uid, u, 'anual-' + d, {
          titulo: 'Seu acesso vence em ' + d + ' dias',
          corpo: 'Seu plano anual vence em ' + d + ' dias. Escolha seu plano em Configurações para continuar.',
          assunto: 'Seu acesso vence em ' + d + ' dias',
          texto: 'Olá! Seu plano anual do Promotor Ajudante vence em ' + d + ' dias. Para continuar usando o app, abra o aplicativo e escolha seu plano em Configurações.',
        });
      }
      continue;
    }

    // 2) cobrança mensal falhou: aviso único (o acesso já está bloqueado)
    if (u.plano === 'mensal' && u.assinatura && u.assinatura.status === 'falhou') {
      await avisar(uid, u, 'falha', {
        titulo: 'Não conseguimos cobrar seu cartão',
        corpo: 'A cobrança da sua assinatura mensal não foi aprovada. O acesso está bloqueado até o pagamento ser regularizado.',
        assunto: 'Cobrança da assinatura não aprovada',
        texto: 'Olá! A cobrança mensal do Promotor Ajudante não foi aprovada, por isso o acesso está bloqueado. Abra o aplicativo e regularize o pagamento para continuar.',
      });
      continue;
    }

    // 3) teste grátis: aviso antes do fim dos 60 dias
    if (u.plano === 'mensal' || u.plano === 'anual') continue;
    let fim = null;
    if (u.plano === 'teste' && typeof u.acessoAte === 'string') {
      fim = u.acessoAte;
    } else {
      try {
        const rec = await auth.getUser(uid);
        fim = somaDias(iso(new Date(rec.metadata.creationTime)), DIAS_TESTE);
      } catch (e) { continue; }                             // conta sem login: ignora
    }
    const d = diasEntre(fim, hoje);
    if (AVISOS.includes(d)) {
      await avisar(uid, u, 'teste-' + d, {
        titulo: 'Seu teste grátis termina em ' + d + ' dias',
        corpo: 'Faltam ' + d + ' dias do seu teste grátis. Escolha seu plano em Configurações para não perder o acesso.',
        assunto: 'Seu teste grátis termina em ' + d + ' dias',
        texto: 'Olá! Faltam ' + d + ' dias do seu teste grátis do Promotor Ajudante. Escolha seu plano em Configurações: mensal (R$ 50,00, cartão) ou anual (R$ 510,00, Pix ou débito).',
      });
    }
  }
  console.log('Concluído.');
}
main().catch((e) => { console.error(e); process.exit(1); });
