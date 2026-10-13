// Service worker das notificações. Precisa ficar na mesma pasta do index.html.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
importScripts('firebase-config.js');

firebase.initializeApp(self.FIREBASE_CONFIG);

// Com o app fechado, o próprio Firebase exibe a notificação enviada pelo servidor
// e abre o link definido nela ao tocar.
firebase.messaging();
