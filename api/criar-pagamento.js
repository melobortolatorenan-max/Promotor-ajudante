// Cria um link de pagamento do Mercado Pago ligado ao usuário logado (external_reference = uid).
// Chamado pelo app ao tocar em "PAGAR". Variáveis na Vercel: MP_ACCESS_TOKEN, FIREBASE_SERVICE_ACCOUNT.
const admin = require('firebase-admin');

const PRECO = Number(process.env.PRECO_ANUAL || 50);

function iniciar() {
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  // libera o app (também dentro do aplicativo Android, que tem outra origem)
  res.setHeader('Access-Control-Allow-Origin', 'https://promotor-ajudante.vercel.app');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ erro: 'metodo' });
  try {
    iniciar();
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ erro: 'sem-login' });
    const dec = await admin.auth().verifyIdToken(token);

    const base = process.env.APP_URL || `https://${req.headers.host}`;
    const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN },
      body: JSON.stringify({
        items: [{ title: 'Anuidade Promotor Ajudante', quantity: 1, unit_price: PRECO, currency_id: 'BRL' }],
        statement_descriptor: 'PROMOTORAJUDANTE',   // nome na fatura do cartão (máx. 16 caracteres)
        external_reference: dec.uid,
        payer: dec.email ? { email: dec.email } : undefined,
        notification_url: `${base}/api/mp-webhook`,
        back_urls: { success: base + '/', failure: base + '/', pending: base + '/' },
        auto_return: 'approved',
      }),
    });
    const j = await r.json();
    if (!r.ok || !j.init_point) throw new Error('Mercado Pago: ' + JSON.stringify(j).slice(0, 300));
    return res.status(200).json({ url: j.init_point });
  } catch (e) {
    console.error('criar-pagamento:', e);
    return res.status(500).json({ erro: 'falha' });
  }
};
