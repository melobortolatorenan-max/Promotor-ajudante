// Define uma senha nova para a conta do promotor, direto no Firebase Auth.
// Rodado pelo GitHub Actions ("Trocar senha"). A senha vem de um Secret, nunca do chat.
const admin = require('firebase-admin');

const email = String(process.env.EMAIL || '').trim().toLowerCase();
const senha = String(process.env.NOVA_SENHA || '');

if (!email) { console.error('Informe o e-mail.'); process.exit(1); }
if (senha.length < 6) { console.error('A nova senha precisa ter pelo menos 6 caracteres.'); process.exit(1); }

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });

async function main() {
  const usuario = await admin.auth().getUserByEmail(email);
  await admin.auth().updateUser(usuario.uid, { password: senha });
  console.log('Senha trocada com sucesso para', email);
}

main().catch((e) => { console.error('Não foi possível trocar a senha:', e.message); process.exit(1); });
