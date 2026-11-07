// Libera (ou renova) o acesso anual de um usuário depois que o pagamento foi confirmado.
// Rodado pelo GitHub Actions ("Liberar acesso"), informando o e-mail e os dias (padrão 365).
const admin = require('firebase-admin');

const FUSO = 'America/Sao_Paulo';
const email = String(process.env.EMAIL || '').trim().toLowerCase();
const dias = parseInt(process.env.DIAS || '365', 10);

if (!email) { console.error('Informe o e-mail.'); process.exit(1); }
if (!(dias >= 1 && dias <= 3650)) { console.error('Dias inválido (use de 1 a 3650).'); process.exit(1); }

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();

const hojeSP = () => new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date()); // AAAA-MM-DD
function somaDias(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

async function main() {
  // procura pelo e-mail da conta e também pelo e-mail informado no "Já paguei"
  const [a, b] = await Promise.all([
    db.collection('users').where('email', '==', email).get(),
    db.collection('users').where('emailPagamento', '==', email).get(),
  ]);
  const achados = new Map();
  [...a.docs, ...b.docs].forEach(d => achados.set(d.id, d));
  if (!achados.size) { console.error('Nenhum usuário encontrado com o e-mail ' + email); process.exit(1); }

  const hoje = hojeSP();
  for (const d of achados.values()) {
    const atual = d.data().acessoAte;
    // se ainda está válido, soma em cima da data atual (renovação antecipada não perde dias)
    const base = typeof atual === 'string' && atual > hoje ? atual : hoje;
    const novo = somaDias(base, dias);
    await d.ref.set({ acessoAte: novo, liberadoEm: admin.firestore.FieldValue.serverTimestamp(), pagamentoInformadoEm: admin.firestore.FieldValue.delete() }, { merge: true });
    console.log(`Liberado: ${d.data().nome || '-'} <${d.data().email || '-'}> até ${novo}`);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
