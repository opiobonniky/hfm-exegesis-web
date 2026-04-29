// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBaxI4_VEzDBrUSnZQM1pHy4bdCBvah7NA",
  authDomain: "exegesis-app.firebaseapp.com",
  projectId: "exegesis-app",
  storageBucket: "exegesis-app.firebasestorage.app",
  messagingSenderId: "270479211517",
  appId: "1:270479211517:web:9e4e18a6a4ef821342b794",
  measurementId: "G-5QT2L5D26Z",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  client_id:
    "270479211517-kinap7kv1bcd3dlpuodt5fkju361fdqb.apps.googleusercontent.com",
});
