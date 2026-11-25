// Avisa a agência (ou superior) que um promotor pediu aprovação.
// 1) Notificação no celular, para quem já tem o app da agência com avisos ativados.
// 2) E-mail, quando não há aparelho com avisos (ex.: superior sem conta na agência).
// Variáveis na Vercel: FIREBASE_SERVICE_ACCOUNT e GMAIL_APP_PASSWORD.
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const APP_EMAIL = 'melobortolato.renan@gmail.com';
const TIPO = { sem_visita: 'Sem visita hoje', adiar: 'Adiar visita', dias: 'Dias de visita' };

function iniciar() {
  if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
}
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'metodo' });
  try {
    iniciar();
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const decoded = await admin.auth().verifyIdToken(token);
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ erro: 'id' });

    const snap = await admin.firestore().collection('solicitacoes').doc(id).get();
    if (!snap.exists) return res.status(404).json({ erro: 'nao-encontrada' });
    const s = snap.data();
    if (s.promotorUid !== decoded.uid) return res.status(403).json({ erro: 'proibido' });

    const titulo = 'Solicitação de aprovação';
    const corpo = `${s.promotorNome || 'Promotor'}: ${TIPO[s.tipo] || s.tipo} · ${s.lojaNome || 'Loja'}`;
    const transporte = nodemailer.createTransport({ service: 'gmail', auth: { user: APP_EMAIL, pass: process.env.GMAIL_APP_PASSWORD } });
    let push = 0, email = 0;

    for (const aprovador of (s.aprovadores || [])) {
      const ags = await admin.firestore().collection('agencias').where('email', '==', aprovador).get();
      const tokens = ags.docs.flatMap(d => d.data().fcmTokens || []);
      if (tokens.length) {
        const r = await admin.messaging().sendEachForMulticast({
          tokens,
          notification: { title: titulo, body: corpo },
          webpush: { fcmOptions: { link: 'https://agencia-ajudante.vercel.app/' } },
        });
        push += r.successCount;
        if (r.successCount > 0) continue;
      }
      await transporte.sendMail({
        from: `Promotor Ajudante <${APP_EMAIL}>`,
        to: aprovador,
        subject: `${titulo}: ${corpo}`,
        html: `<p><b>${esc(corpo)}</b></p><p>Abra o app da agência para aprovar ou recusar.</p><p>Se você é superior e ainda não tem conta, crie uma no app da agência usando este e-mail.</p>`,
      });
      email++;
    }
    return res.status(200).json({ push, email });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: 'falha' });
  }
};
