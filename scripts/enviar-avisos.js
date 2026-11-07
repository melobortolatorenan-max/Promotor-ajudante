// Roda todo dia pelo GitHub Actions: procura produtos que vencem nos dias que
// CADA promotor escolheu nas configurações do app (campo diasAviso, de 1 a 5 dias antes)
// e envia notificação para os aparelhos dele.
const admin = require('firebase-admin');

const DIAS_PADRAO = [2, 3, 5];                 // usado só se o promotor ainda não escolheu nada
const AVISAR_NO_DIA = true;                    // true = avisa também no dia do vencimento (false = só os dias escolhidos)
const FUSO = 'America/Sao_Paulo';
const APP_URL = process.env.APP_URL || '';
const FORCAR = process.env.FORCAR === 'true';   // true = envia mesmo que já tenha enviado hoje (usado em testes)

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
  return `Produtos vencem em ${n} ${n === 1 ? 'dia' : 'dias'}`;
}
// Lê a escolha do promotor (1 a 5 dias antes). Lista vazia = respeita (só o dia do vencimento).
function diasDoPromotor(perfil) {
  const d = perfil.exists ? perfil.data().diasAviso : null;
  const escolhidos = Array.isArray(d)
    ? [...new Set(d.filter(n => Number.isInteger(n) && n >= 1 && n <= 5))]
    : DIAS_PADRAO;
  return [...(AVISAR_NO_DIA ? [0] : []), ...escolhidos].sort((a, b) => a - b);
}

async function main() {
  const hoje = hojeSP();
  console.log('Hoje (Brasília):', hoje);

  const usuarios = await db.collection('users').listDocuments();
  let enviados = 0, tokensRemovidos = 0, usuariosAvisados = 0;

  for (const uref of usuarios) {
    // Evita aviso repetido: se esse promotor já foi avisado hoje (por outro disparo), pula.
    const perfil = await uref.get();
    if (!FORCAR && perfil.exists && perfil.data().ultimoAviso === hoje) continue;

    const tokensSnap = await uref.collection('tokens').get();
    if (tokensSnap.empty) continue;

    const dias = diasDoPromotor(perfil);
    if (!dias.length) continue;
    const datas = dias.map(n => somaDias(hoje, n));

    const prodSnap = await uref.collection('produtos').where('data', 'in', datas).get();
    if (prodSnap.empty) continue;

    const lojasSnap = await uref.collection('lojas').get();
    const nomeLoja = {};
    lojasSnap.forEach(l => { nomeLoja[l.id] = l.data().nome; });

    const tokens = tokensSnap.docs.map(d => d.data().token).filter(Boolean);
    const porData = {};
    prodSnap.forEach(p => { const x = p.data(); (porData[x.data] = porData[x.data] || []).push(x); });
    usuariosAvisados++;
    await uref.set({ ultimoAviso: hoje }, { merge: true });

    for (let i = 0; i < dias.length; i++) {
      const itens = porData[datas[i]];
      if (!itens || !itens.length) continue;

      const linhas = itens.slice(0, 3).map(x => `${x.nome} (${nomeLoja[x.lojaId] || 'loja'})`);
      const resto = itens.length - linhas.length;
      const corpo = linhas.join(', ') + (resto > 0 ? ` e mais ${resto}` : '');

      const webpush = { notification: { tag: 'venc-' + datas[i] } };
      if (APP_URL) { webpush.fcmOptions = { link: APP_URL }; webpush.notification.icon = APP_URL + 'logo.png'; }

      const resp = await messaging.sendEachForMulticast({
        tokens,
        notification: { title: titulo(dias[i]), body: corpo },
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
