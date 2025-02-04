// Importamos las funciones necesarias de Firebase.
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

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Firebase Auth
const db = getFirestore(app); // Firestore (si lo usas)

export { auth, db };  // Exportamos para ser usados en otros archivos

