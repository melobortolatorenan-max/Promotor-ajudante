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
    // reembolso / estorno de um pagamento que já tinha liberado acesso: retira os 365 dias dele
    if (['refunded', 'charged_back', 'cancelled'].includes(p.status)) {
      const pagRef0 = db.collection('pagamentos').doc(String(id));
      const feito = await db.runTransaction(async (t) => {
        const pg = await t.get(pagRef0);
        if (!pg.exists || pg.data().estornadoEm) return false;     // nunca liberamos, ou já retiramos
        const uref = db.collection('users').doc(String(pg.data().uid));
        const u = await t.get(uref);
        const atual = u.exists ? u.data().acessoAte : null;
        if (typeof atual === 'string') t.set(uref, { acessoAte: somaDias(atual, -DIAS) }, { merge: true });
        t.set(pagRef0, { estornadoEm: admin.firestore.FieldValue.serverTimestamp(), statusFinal: p.status }, { merge: true });
        return true;
      });
      return res.status(200).send(feito ? 'acesso-retirado' : 'ignorado');
    }
    if (p.status !== 'approved' || p.currency_id !== 'BRL' || Number(p.transaction_amount) < PRECO) return res.status(200).send('nao-aprovado');

    // descobre o usuário: pelo uid gravado no link; se não houver, pelo e-mail do pagador
    let ref = null;
    if (p.external_reference) {
      const d = await db.collection('users').doc(String(p.external_reference)).get();
      if (d.exists) ref = d.ref;
    }
    if (!ref && p.payer && p.payer.email) {
      const email = String(p.payer.email).trim().toLowerCase();
      const [a, c] = await Promise.all([
        db.collection('users').where('email', '==', email).limit(1).get(),
        db.collection('users').where('emailPagamento', '==', email).limit(1).get(),
      ]);
      const achado = a.docs[0] || c.docs[0];
      if (achado) ref = achado.ref;
    }
    if (!ref) { console.warn('Pagamento ' + id + ' aprovado, mas sem usuário correspondente. Libere manualmente.'); return res.status(200).send('sem-usuario'); }

    const pagRef = db.collection('pagamentos').doc(String(id));
    await db.runTransaction(async (t) => {
      const [pg, u] = await Promise.all([t.get(pagRef), t.get(ref)]);
      if (pg.exists) return;                               // já processado (o MP reenvia avisos); se foi estornado, não libera de novo
      const hoje = hojeSP();
      const atual = u.data() && u.data().acessoAte;
      const base = typeof atual === 'string' && atual > hoje ? atual : hoje;
      const novo = somaDias(base, DIAS);
      t.set(ref, { acessoAte: novo, liberadoEm: admin.firestore.FieldValue.serverTimestamp(), pagamentoInformadoEm: admin.firestore.FieldValue.delete() }, { merge: true });
      t.set(pagRef, { uid: ref.id, valor: p.transaction_amount, em: admin.firestore.FieldValue.serverTimestamp() });
    });
    return res.status(200).send('ok');
  } catch (e) {
    console.error('mp-webhook:', e);
    return res.status(500).send('erro');
  }
};
