// firebase.js

// Importa Firebase y las funciones necesarias
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBRes8aywKH_6sSAL_hQUTIDddEMYMu50U",
  authDomain: "control-socorristas.firebaseapp.com",
  projectId: "control-socorristas",
  storageBucket: "control-socorristas.firebasestorage.app",
  messagingSenderId: "1014959454657",
  appId: "1:1014959454657:web:7c9b113d223555f3b65740",
  measurementId: "G-BEEQ96MH8B"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Auth y Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Exporta las variables necesarias
export { auth, db };

