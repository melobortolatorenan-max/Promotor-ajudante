// Redefinição de senha com código enviado por e-mail (3 passos: enviar, confirmar, salvar).
// Variáveis na Vercel: FIREBASE_SERVICE_ACCOUNT e GMAIL_APP_PASSWORD (senha de app do Gmail).
const admin = require('firebase-admin');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const ALFA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // sem letras que se confundem (O/0, I/1)
const VALIDADE_MS = 15 * 60 * 1000;
const INTERVALO_MS = 60 * 1000;
const MAX_TENTATIVAS = 5;

function iniciar() {
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
}
function gerarCodigo() {
  const b = crypto.randomBytes(6);
  let c = '';
  for (let i = 0; i < 6; i++) c += ALFA[b[i] % ALFA.length];
  return c;
}
const hashCodigo = (email, codigo) => crypto.createHash('sha256').update(email + ':' + String(codigo || '').trim().toUpperCase()).digest('hex');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ erro: 'metodo' });
  try {
    iniciar();
    const corpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const email = String(corpo.email || '').trim().toLowerCase();
    const acao = corpo.acao;
    if (!email || !email.includes('@')) return res.status(400).json({ erro: 'email' });
    const db = admin.firestore();
    const ref = db.collection('codigosSenha').doc(email.replace(/[^a-z0-9]/g, '_'));

    if (acao === 'enviar') {
      let usuario;
      try { usuario = await admin.auth().getUserByEmail(email); } catch (e) { return res.status(200).json({ ok: true }); } // não revela se o e-mail existe
      const antes = await ref.get();
      if (antes.exists && Date.now() - antes.data().enviadoEm < INTERVALO_MS) return res.status(429).json({ erro: 'espere' });
      const codigo = gerarCodigo();
      await ref.set({ hash: hashCodigo(email, codigo), expiraEm: Date.now() + VALIDADE_MS, tentativas: 0, enviadoEm: Date.now(), uid: usuario.uid });
      const transporte = nodemailer.createTransport({ service: 'gmail', auth: { user: 'melobortolato.renan@gmail.com', pass: process.env.GMAIL_APP_PASSWORD } });
      await transporte.sendMail({
        from: 'Promotor Ajudante <melobortolato.renan@gmail.com>', to: email,
        subject: 'Código para redefinir sua senha',
        text: `Seu código para redefinir a senha é: ${codigo}\n\nEle vale por 15 minutos. Se você não pediu, ignore este e-mail.`,
      });
      return res.status(200).json({ ok: true });
    }

    if (acao === 'confirmar' || acao === 'salvar') {
      const snap = await ref.get();
      if (!snap.exists) return res.status(400).json({ erro: 'codigo' });
      const d = snap.data();
      if (Date.now() > d.expiraEm) return res.status(400).json({ erro: 'expirado' });
      if (d.tentativas >= MAX_TENTATIVAS) return res.status(429).json({ erro: 'tentativas' });
      if (hashCodigo(email, corpo.codigo) !== d.hash) {
        await ref.update({ tentativas: d.tentativas + 1 });
        return res.status(400).json({ erro: 'codigo' });
      }
      if (acao === 'confirmar') return res.status(200).json({ ok: true });

      const nova = String(corpo.novaSenha || '');
      if (nova.length < 6) return res.status(400).json({ erro: 'senha-curta' });
      await admin.auth().updateUser(d.uid, { password: nova });
      await ref.delete();                                  // código de uso único
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ erro: 'acao' });
  } catch (e) {
    console.error('redefinir-senha:', e);
    return res.status(500).json({ erro: 'falha' });
  }
};
