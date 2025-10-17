
// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker
// "Default" Firebase app (important for initialization)
const firebaseConfig = {
  apiKey: "AIzaSyAOnRgf3OSlJ4F516dmtoylNZpVi1ofSLA",
  authDomain: "familyverse-5xnxn.firebaseapp.com",
  projectId: "familyverse-5xnxn",
  storageBucket: "familyverse-5xnxn.firebasestorage.app",
  messagingSenderId: "314321317316",
  appId: "1:314321317316:web:4077473d0083408bb68891",
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192x192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
