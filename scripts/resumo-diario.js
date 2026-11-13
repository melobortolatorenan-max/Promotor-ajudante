// Notificação das 18h com o resumo do dia (só para quem tem o app instalado e teve movimento no dia).
// Começa em simulação (DRY_RUN=true): só mostra o que enviaria.
const admin = require('firebase-admin');

const DRY = String(process.env.DRY_RUN || 'true') !== 'false';
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();
const messaging = admin.messaging();
const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
const dataDe = (ts) => (ts && ts.toDate) ? new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(ts.toDate()) : null;

(async () => {
  const users = await db.collection('users').get();
  let enviadas = 0;
  for (const u of users.docs) {
    const base = db.collection('users').doc(u.id);
    const [venc, prod] = await Promise.all([base.collection('vencidos').get(), base.collection('produtos').get()]);
    const retiradas = venc.docs.map(d => d.data()).filter(v => v.dataRetirada === hoje).reduce((t, v) => t + (Number(v.qtd) || 0), 0);
    const retiradasReg = venc.docs.map(d => d.data()).filter(v => v.dataRetirada === hoje).length;
    const cadastros = prod.docs.map(d => d.data()).filter(p => dataDe(p.criadoEm) === hoje).length;
    if (!retiradasReg && !cadastros) continue;

    const tokens = (await base.collection('tokens').get()).docs.map(d => d.data().token).filter(Boolean);
    if (!tokens.length) continue;
    const corpo = `Hoje: ${retiradas} unidades retiradas em ${retiradasReg} registros e ${cadastros} produtos cadastrados. Veja em Configurações > Resumo do dia.`;
    if (DRY) { console.log(`[simulação] ${u.id}: ${corpo}`); continue; }
    const r = await messaging.sendEachForMulticast({
      tokens,
      notification: { title: 'Resumo do dia · Promotor Ajudante', body: corpo },
      webpush: { fcmOptions: { link: 'https://promotor-ajudante.vercel.app/' } },
    });
    if (r.successCount > 0) enviadas++;
  }
  console.log(`${DRY ? 'Simulação: ' : ''}notificações ${DRY ? 'a enviar' : 'enviadas'}: ${enviadas}`);
})().catch(e => { console.error(e); process.exit(1); });
