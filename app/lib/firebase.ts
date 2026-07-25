import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBzyz0_tTDQ63KQd2hHnFW3FyohKmTKcWg",
  authDomain: "surplex-experience.firebaseapp.com",
  projectId: "surplex-experience",
  storageBucket: "surplex-experience.firebasestorage.app",
  messagingSenderId: "1001898107127",
  appId: "1:1001898107127:web:67a5ce939ab314d9bd33f2",
};

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);