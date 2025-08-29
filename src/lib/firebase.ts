import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "familyverse-5xnxn",
  "appId": "1:314321317316:web:4077473d0083408bb68891",
  "storageBucket": "familyverse-5xnxn.firebasestorage.app",
  "apiKey": "AIzaSyAOnRgf3OSlJ4F516dmtoylNZpVi1ofSLA",
  "authDomain": "familyverse-5xnxn.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "314321317316"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
