import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-K0FIaaM_p6_DIPBS0KTwatVMzisRciI",
  authDomain: "control-gastos-fam-f0cf.firebaseapp.com",
  projectId: "control-gastos-fam-f0cf",
  storageBucket: "control-gastos-fam-f0cf.firebasestorage.app",
  messagingSenderId: "532419731492",
  appId: "1:532419731492:web:d8607eb40f4dcd7f64f8b1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
