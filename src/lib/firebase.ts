
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAOnRgf3OSlJ4F516dmtoylNZpVi1ofSLA",
  authDomain: "familyverse-5xnxn.firebaseapp.com",
  projectId: "familyverse-5xnxn",
  storageBucket: "familyverse-5xnxn.firebasestorage.app",
  messagingSenderId: "314321317316",
  appId: "1:314321317316:web:4077473d0083408bb68891",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get a messaging instance
let messaging;
if (typeof window !== "undefined") {
    messaging = getMessaging(app);
}

export const requestForToken = async () => {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, { vapidKey: 'BBiqGgVOrDqA3mUjA_FmUnA-Fk-SSUi_yDkS-yGqH4t-6Lp3-zFpL5vX1f8mJ1hZ1g9wYjX2jV3k4eI' });
      if (currentToken) {
        console.log('FCM Token:', currentToken);
        // You would typically save this token to your server against the user's profile
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return null;
      }
    } else {
        console.log('Permission not granted for notifications');
        return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
      if (!messaging) return;
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
});

export { app, auth, db, messaging };
