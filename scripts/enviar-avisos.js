// Roda todo dia pelo GitHub Actions: procura produtos que vencem em
// 5, 3 e 2 dias e hoje, e envia notificação para os aparelhos de cada promotor.
const admin = require('firebase-admin');

const DIAS_AVISO = [0, 2, 3, 5];               // dia do vencimento, 2, 3 e 5 dias antes
const FUSO = 'America/Sao_Paulo';
const APP_URL = process.env.APP_URL || '';

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();
const messaging = admin.messaging();

function hojeSP() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date()); // AAAA-MM-DD
}
function somaDias(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
function titulo(n) {
  if (n === 0) return '⚠️ Produtos vencem HOJE';
  return `Produtos vencem em ${n} dias`;
}

async function main() {
  const hoje = hojeSP();
  const datas = DIAS_AVISO.map(n => somaDias(hoje, n));
  console.log('Hoje (Brasília):', hoje, '| datas verificadas:', datas.join(', '));

  const usuarios = await db.collection('users').listDocuments();
  let enviados = 0, tokensRemovidos = 0, usuariosAvisados = 0;

  for (const uref of usuarios) {
    const tokensSnap = await uref.collection('tokens').get();
    if (tokensSnap.empty) continue;

    const prodSnap = await uref.collection('produtos').where('data', 'in', datas).get();
    if (prodSnap.empty) continue;

    const lojasSnap = await uref.collection('lojas').get();
    const nomeLoja = {};
    lojasSnap.forEach(l => { nomeLoja[l.id] = l.data().nome; });

    const tokens = tokensSnap.docs.map(d => d.data().token).filter(Boolean);
    const porData = {};
    prodSnap.forEach(p => { const x = p.data(); (porData[x.data] = porData[x.data] || []).push(x); });
    usuariosAvisados++;

    for (let i = 0; i < DIAS_AVISO.length; i++) {
      const itens = porData[datas[i]];
      if (!itens || !itens.length) continue;

      const linhas = itens.slice(0, 3).map(x => `${x.nome} (${nomeLoja[x.lojaId] || 'loja'})`);
      const resto = itens.length - linhas.length;
      const corpo = linhas.join(', ') + (resto > 0 ? ` e mais ${resto}` : '');

      const webpush = { notification: { tag: 'venc-' + datas[i] } };
      if (APP_URL) { webpush.fcmOptions = { link: APP_URL }; webpush.notification.icon = APP_URL + 'logo.png'; }

      const resp = await messaging.sendEachForMulticast({
        tokens,
        notification: { title: titulo(DIAS_AVISO[i]), body: corpo },
        webpush,
      });
      enviados += resp.successCount;

      // remove aparelhos que não existem mais
      await Promise.all(resp.responses.map(async (r, k) => {
        const code = r.error && r.error.code;
        if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
          await uref.collection('tokens').doc(tokens[k]).delete();
          tokensRemovidos++;
        }
      }));
    }
  }
  console.log(`Concluído: ${usuariosAvisados} promotor(es) com vencimentos, ${enviados} notificação(ões) enviada(s), ${tokensRemovidos} aparelho(s) inválido(s) removido(s).`);
}

main().catch(e => { console.error(e); process.exit(1); });
