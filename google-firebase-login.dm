// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBaxI4_VEzDBrUSnZQM1pHy4bdCBvah7NA",
  authDomain: "exegesis-app.firebaseapp.com",
  projectId: "exegesis-app",
  storageBucket: "exegesis-app.firebasestorage.app",
  messagingSenderId: "270479211517",
  appId: "1:270479211517:web:9e4e18a6a4ef821342b794",
  measurementId: "G-5QT2L5D26Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);