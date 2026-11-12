// Resgata o voucher de acesso grátis (30 dias). Uma vez por conta. O código fica na variável VOUCHER_CODE da Vercel.
const admin = require('firebase-admin');

function iniciar() {
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
}
const hojeSP = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
function somaDias(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ erro: 'metodo' });
  try {
    iniciar();
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ erro: 'sem-login' });
    const dec = await admin.auth().verifyIdToken(token);
    const codigo = String((req.body && req.body.codigo) || '').trim().toUpperCase();
    const esperado = String(process.env.VOUCHER_CODE || '').trim().toUpperCase();
    if (!esperado || codigo !== esperado) return res.status(400).json({ erro: 'codigo-invalido' });

    const ref = admin.firestore().collection('users').doc(dec.uid);
    const hoje = hojeSP();
    const resultado = await admin.firestore().runTransaction(async (t) => {
      const snap = await t.get(ref);
      const u = snap.exists ? snap.data() : {};
      if (u.voucherUsado) return { erro: 'ja-usado' };
      if (typeof u.acessoAte === 'string' && u.acessoAte >= hoje) return { erro: 'ja-tem-acesso' };
      const novo = somaDias(hoje, 30);
      t.set(ref, { acessoAte: novo, voucherUsado: true, voucherEm: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      return { ok: true, acessoAte: novo };
    });
    if (resultado.erro) return res.status(409).json(resultado);
    return res.status(200).json(resultado);
  } catch (e) {
    console.error('voucher:', e);
    return res.status(500).json({ erro: 'falha' });
  }
};
