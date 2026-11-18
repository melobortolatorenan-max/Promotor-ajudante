// Cancela a assinatura mensal no Mercado Pago. O acesso continua até o fim do período já pago.
// Variáveis na Vercel: MP_ACCESS_TOKEN, FIREBASE_SERVICE_ACCOUNT.
const admin = require('firebase-admin');

function iniciar() {
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
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
    const db = admin.firestore();
    const snap = await db.collection('users').doc(dec.uid).get();
    const pid = snap.exists && snap.data().assinatura && snap.data().assinatura.preapprovalId;
    if (!pid) return res.status(404).json({ erro: 'sem-assinatura' });

    const r = await fetch('https://api.mercadopago.com/preapproval/' + encodeURIComponent(pid), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    if (!r.ok) return res.status(502).json({ erro: 'mp' });
    await db.collection('users').doc(dec.uid).set({ assinatura: { status: 'cancelada', canceladaEm: admin.firestore.FieldValue.serverTimestamp() } }, { merge: true });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('cancelar-assinatura:', e);
    return res.status(500).json({ erro: 'falha' });
  }
};
