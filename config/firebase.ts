import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB84bwuO6LXTUUMasOKdjyBsWtBAvdhLQo",
  authDomain: "elder-care-monitoring-db.firebaseapp.com",
  projectId: "elder-care-monitoring-db",
  storageBucket: "elder-care-monitoring-db.firebasestorage.app",
  messagingSenderId: "840854331942",
  appId: "1:840854331942:web:154cbc30d488efc08ffce7"
};

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);