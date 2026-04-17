// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB84bwuO6LXTUUMasOKdjyBsWtBAvdhLQo",
  authDomain: "elder-care-monitoring-db.firebaseapp.com",
  projectId: "elder-care-monitoring-db",
  storageBucket: "elder-care-monitoring-db.firebasestorage.app",
  messagingSenderId: "840854331942",
  appId: "1:840854331942:web:154cbc30d488efc08ffce7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);