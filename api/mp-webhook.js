// Recebe os avisos do Mercado Pago e confere direto na API deles antes de mexer em qualquer conta.
// Anual (pagamento único): soma 365 dias. Mensal (assinatura): soma 30 dias a cada cobrança aprovada.
// Variáveis na Vercel: MP_ACCESS_TOKEN, FIREBASE_SERVICE_ACCOUNT.
const admin = require('firebase-admin');

const FUSO = 'America/Sao_Paulo';
const PRECO_MENSAL = 50;
const PRECO_ANUAL = 510;
const DIAS_ANUAL = 365;
const DIAS_MENSAL = 30;

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
async function mpGet(caminho) {
  const r = await fetch('https://api.mercadopago.com' + caminho, { headers: { Authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN } });
  if (!r.ok) throw new Error('MP ' + caminho + ' respondeu ' + r.status);
  return r.json();
}

// Pagamento único (anual): Pix ou débito
async function tratarPagamento(db, id, res) {
  const p = await mpGet('/v1/payments/' + encodeURIComponent(id));
  // estorno: retira os dias de um pagamento que já tinha liberado acesso
  if (['refunded', 'charged_back', 'cancelled'].includes(p.status)) {
    const pagRef0 = db.collection('pagamentos').doc(String(id));
    const feito = await db.runTransaction(async (t) => {
      const pg = await t.get(pagRef0);
      if (!pg.exists || pg.data().estornadoEm) return false;
      const uref = db.collection('users').doc(String(pg.data().uid));
      const u = await t.get(uref);
      const atual = u.exists ? u.data().acessoAte : null;
      const dias = pg.data().dias || DIAS_ANUAL;
      if (typeof atual === 'string') t.set(uref, { acessoAte: somaDias(atual, -dias) }, { merge: true });
      t.set(pagRef0, { estornadoEm: admin.firestore.FieldValue.serverTimestamp(), statusFinal: p.status }, { merge: true });
      return true;
    });
    return res.status(200).send(feito ? 'acesso-retirado' : 'ignorado');
  }
  if (p.status !== 'approved' || p.currency_id !== 'BRL' || Number(p.transaction_amount) < PRECO_ANUAL) return res.status(200).send('nao-aprovado');

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
  if (!ref) { console.warn('Pagamento ' + id + ' aprovado, mas sem usuário. Libere manualmente.'); return res.status(200).send('sem-usuario'); }

  const pagRef = db.collection('pagamentos').doc(String(id));
  await db.runTransaction(async (t) => {
    const [pg, u] = await Promise.all([t.get(pagRef), t.get(ref)]);
    if (pg.exists) return;                       // já processado (o MP reenvia avisos)
    const hoje = hojeSP();
    const atual = u.data() && u.data().acessoAte;
    const base = typeof atual === 'string' && atual > hoje ? atual : hoje;
    t.set(ref, {
      acessoAte: somaDias(base, DIAS_ANUAL), plano: 'anual', planoAtualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
      liberadoEm: admin.firestore.FieldValue.serverTimestamp(), pagamentoInformadoEm: admin.firestore.FieldValue.delete(),
    }, { merge: true });
    t.set(pagRef, { uid: ref.id, valor: p.transaction_amount, dias: DIAS_ANUAL, em: admin.firestore.FieldValue.serverTimestamp() });
    t.set(ref.collection('recibos').doc(String(id)), { tipo: 'anual', valor: p.transaction_amount, dias: DIAS_ANUAL, criadoEm: admin.firestore.FieldValue.serverTimestamp() });
  });
  return res.status(200).send('ok');
}

// Assinatura mensal criada, cancelada ou alterada
async function tratarAssinatura(db, id, res) {
  const a = await mpGet('/preapproval/' + encodeURIComponent(id));
  const uid = a.external_reference;
  if (!uid) return res.status(200).send('sem-usuario');
  const ref = db.collection('users').doc(String(uid));
  const dados = { assinatura: { tipo: 'mensal', preapprovalId: a.id, valor: PRECO_MENSAL, status: a.status === 'authorized' ? 'ativa' : (a.status === 'cancelled' ? 'cancelada' : a.status) } };
  if (a.status === 'authorized') {
    dados.plano = 'mensal';
    dados.assinaturaAtualizadaEm = admin.firestore.FieldValue.serverTimestamp();
  }
  await ref.set(dados, { merge: true });
  return res.status(200).send('assinatura-atualizada');
}

// Cobrança mensal aprovada: estende o acesso em 30 dias
async function tratarCobrancaMensal(db, id, res) {
  const ap = await mpGet('/authorized_payments/' + encodeURIComponent(id));
  const pre = await mpGet('/preapproval/' + encodeURIComponent(ap.preapproval_id));
  const uid = pre.external_reference;
  if (!uid) return res.status(200).send('sem-usuario');
  const ref = db.collection('users').doc(String(uid));
  // cobrança recusada: bloqueia o acesso na hora, até o pagamento ser regularizado
  if (['rejected', 'cancelled', 'failed'].includes(ap.status)) {
    const ontem = somaDias(hojeSP(), -1);
    await ref.set({ acessoAte: ontem, assinatura: { status: 'falhou', falhaEm: admin.firestore.FieldValue.serverTimestamp() } }, { merge: true });
    return res.status(200).send('bloqueado-por-falha');
  }
  if (ap.status !== 'processed') return res.status(200).send('nao-aprovado');
  const pagRef = db.collection('pagamentos').doc('mp-' + String(id));
  await db.runTransaction(async (t) => {
    const [pg, u] = await Promise.all([t.get(pagRef), t.get(ref)]);
    if (pg.exists) return;
    const hoje = hojeSP();
    const atual = u.data() && u.data().acessoAte;
    const base = typeof atual === 'string' && atual > hoje ? atual : hoje;
    t.set(ref, {
      acessoAte: somaDias(base, DIAS_MENSAL), plano: 'mensal', liberadoEm: admin.firestore.FieldValue.serverTimestamp(),
      'assinatura.ultimaCobrancaEm': admin.firestore.FieldValue.serverTimestamp(),
      'assinatura.status': 'ativa',
    }, { merge: true });
    t.set(pagRef, { uid: ref.id, valor: PRECO_MENSAL, dias: DIAS_MENSAL, em: admin.firestore.FieldValue.serverTimestamp() });
    t.set(ref.collection('recibos').doc('mp-' + String(id)), { tipo: 'mensal', valor: PRECO_MENSAL, dias: DIAS_MENSAL, criadoEm: admin.firestore.FieldValue.serverTimestamp() });
  });
  return res.status(200).send('ok');
}

module.exports = async (req, res) => {
  try {
    iniciar();
    const db = admin.firestore();
    const q = req.query || {}, b = req.body || {};
    const tipo = q.type || q.topic || b.type || b.topic;
    const id = q['data.id'] || (b.data && b.data.id) || q.id;
    if (!id) return res.status(200).send('ignorado');
    if (tipo === 'subscription_preapproval') return await tratarAssinatura(db, id, res);
    if (tipo === 'subscription_authorized_payment') return await tratarCobrancaMensal(db, id, res);
    if (tipo && tipo !== 'payment') return res.status(200).send('ignorado');
    return await tratarPagamento(db, id, res);
  } catch (e) {
    console.error('mp-webhook:', e);
    return res.status(500).send('erro');
  }
};
