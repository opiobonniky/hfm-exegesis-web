import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyDb7YnYD4e-yGpUr8yXrR4ayIswk-A0QCQ",
  authDomain: "exegesis-bd116.firebaseapp.com",
  projectId: "exegesis-bd116",
  storageBucket: "exegesis-bd116.firebasestorage.app",
  messagingSenderId: "683836491679",
  appId: "1:683836491679:web:709b41503c6e2a8ef11faa",
  measurementId: "G-ME331TJNRE",
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
