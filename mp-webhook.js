// Recebe o aviso do Mercado Pago, confere o pagamento direto na API deles e libera o acesso de 1 ano.
// Variáveis na Vercel: MP_ACCESS_TOKEN, FIREBASE_SERVICE_ACCOUNT.
const admin = require('firebase-admin');

const FUSO = 'America/Sao_Paulo';
const PRECO = Number(process.env.PRECO_ANUAL || 50);
const DIAS = 365;

function iniciar() {
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
}
const hojeSP = () => new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date());
function somaDias(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

module.exports = async (req, res) => {
  try {
    iniciar();
    const db = admin.firestore();
    const q = req.query || {}, b = req.body || {};
    const tipo = q.type || q.topic || b.type || b.topic;
    const id = q['data.id'] || (b.data && b.data.id) || q.id;
    if (!id || (tipo && tipo !== 'payment')) return res.status(200).send('ignorado');

    // confere o pagamento direto no Mercado Pago (não confia no que veio no aviso)
    const r = await fetch('https://api.mercadopago.com/v1/payments/' + encodeURIComponent(id), { headers: { Authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN } });
    if (!r.ok) { console.error('MP respondeu', r.status); return res.status(500).send('erro-mp'); }
    const p = await r.json();
    if (p.status !== 'approved' || p.currency_id !== 'BRL' || Number(p.transaction_amount) < PRECO) return res.status(200).send('nao-aprovado');

    // descobre o usuário: pelo uid gravado no link; se não houver, pelo e-mail do pagador
    let ref = null;
    if (p.external_reference) {
      const d = await db.collection('users').doc(String(p.external_reference)).get();
