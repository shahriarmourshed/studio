
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

export { app, auth, db };
