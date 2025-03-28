import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDyHIF1zuy-mlVWvUjDxclC83BAdgEkIYo",
    authDomain: "tasgri.firebaseapp.com",
    projectId: "tasgri",
    storageBucket: "tasgri.firebasestorage.app",
    messagingSenderId: "732271426831",
    appId: "1:732271426831:web:85e1b615979797ad5f927a",
    measurementId: "G-N0ZEEDCBZ0"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
