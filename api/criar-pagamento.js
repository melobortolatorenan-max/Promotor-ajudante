// Cria a cobrança no Mercado Pago, ligada ao usuário logado (external_reference = uid).
// plano "mensal": assinatura de R$ 50,00/mês, só cartão de crédito, cobrança automática.
// plano "anual": pagamento único de R$ 510,00 (15% de desconto), só Pix ou débito.
// Variáveis na Vercel: MP_ACCESS_TOKEN, FIREBASE_SERVICE_ACCOUNT. APP_URL é opcional.
const admin = require('firebase-admin');

const PRECO_MENSAL = 50;
const PRECO_ANUAL = 510;

function iniciar() {
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
}

async function mp(caminho, corpo) {
  const r = await fetch('https://api.mercadopago.com' + caminho, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN },
    body: JSON.stringify(corpo),
  });
  const j = await r.json();
  if (!r.ok) throw new Error('Mercado Pago: ' + JSON.stringify(j).slice(0, 300));
  return j;
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
    const corpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const plano = corpo.plano === 'anual' ? 'anual' : (corpo.plano === 'mensal' ? 'mensal' : null);
    if (!plano) return res.status(400).json({ erro: 'plano-invalido' });

    const base = process.env.APP_URL || `https://${req.headers.host}`;

    if (plano === 'mensal') {
      // assinatura: o cartão é cadastrado no Mercado Pago e a cobrança repete todo mês
      const j = await mp('/preapproval', {
        reason: 'Promotor Ajudante - plano mensal',
        external_reference: dec.uid,
        payer_email: dec.email || undefined,
        back_url: base + '/',
        auto_recurring: { frequency: 1, frequency_type: 'months', transaction_amount: PRECO_MENSAL, currency_id: 'BRL' },
      });
      return res.status(200).json({ url: j.init_point });
    }

    // anual: pagamento único, sem cartão de crédito (Pix ou débito)
    const j = await mp('/checkout/preferences', {
      items: [{ title: 'Anuidade Promotor Ajudante (15% de desconto)', quantity: 1, unit_price: PRECO_ANUAL, currency_id: 'BRL' }],
      statement_descriptor: 'PROMOTORAJUDANTE',
      external_reference: dec.uid,
      metadata: { plano: 'anual' },
      payer: dec.email ? { email: dec.email } : undefined,
      payment_methods: { excluded_payment_types: [{ id: 'credit_card' }, { id: 'ticket' }, { id: 'atm' }] },
      notification_url: `${base}/api/mp-webhook`,
      back_urls: { success: base + '/', failure: base + '/', pending: base + '/' },
      auto_return: 'approved',
    });
    return res.status(200).json({ url: j.init_point });
  } catch (e) {
    console.error('criar-pagamento:', e);
    return res.status(500).json({ erro: 'falha' });
  }
};
