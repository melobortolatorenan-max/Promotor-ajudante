// Service worker da agência: recebe as notificações de solicitações de aprovação,
// mesmo com o app fechado. A configuração vem do firebase-config.js.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
importScripts('firebase-config.js');

try {
  firebase.initializeApp(self.FIREBASE_CONFIG);
  firebase.messaging();
} catch (e) { /* aparelho sem suporte a notificações: o app continua normalmente */ }
