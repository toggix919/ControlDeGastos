import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAILR8RPR0bgw6EKZaGeO0HF-pGzJRm8HU",
  authDomain: "ctrl-gastos-toggix.firebaseapp.com",
  projectId: "ctrl-gastos-toggix",
  storageBucket: "ctrl-gastos-toggix.firebasestorage.app",
  messagingSenderId: "626719435280",
  appId: "1:626719435280:web:ea4c642ad1cae2cfd6b895"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
