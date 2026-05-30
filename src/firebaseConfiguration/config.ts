import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBaxI4_VEzDBrUSnZQM1pHy4bdCBvah7NA",
  authDomain: "exegesis-app.firebaseapp.com",
  projectId: "exegesis-app",
  storageBucket: "exegesis-app.firebasestorage.app",
  messagingSenderId: "270479211517",
  appId: "1:270479211517:web:9e4e18a6a4ef821342b794",
  measurementId: "G-5QT2L5D26Z"
};

// const firebaseConfig = {
//   apiKey: "AIzaSyDb7YnYD4e-yGpUr8yXrR4ayIswk-A0QCQ",
//   authDomain: "exegesis-bd116.firebaseapp.com",
//   projectId: "exegesis-bd116",
//   storageBucket: "exegesis-bd116.firebasestorage.app",
//   messagingSenderId: "683836491679",
//   appId: "1:683836491679:web:709b41503c6e2a8ef11faa",
//   measurementId: "G-ME331TJNRE",
// };

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
