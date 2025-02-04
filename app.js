// Importa los módulos necesarios desde Firebase
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
const auth = getAuth(app);

// Manejadores de evento para login y registro
document.getElementById('login-btn').addEventListener('click', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('Usuario logueado:', user);
      showModal('Éxito', '¡Has iniciado sesión correctamente!', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html'; // Redirigir al dashboard
      }, 2000);
    })
    .catch((error) => {
      const errorMessage = error.message;
      showModal('Error', errorMessage, 'error');
    });
});

// Función para mostrar modal de éxito o error
function showModal(title, message, type) {
  const modal = document.createElement('div');
  modal.classList.add('modal', type);

  const modalContent = `
    <div class="modal-header">
      <h3>${title}</h3>
      <button onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <p>${message}</p>
    </div>
  `;
  modal.innerHTML = modalContent;
  document.body.appendChild(modal);
}

// Cerrar el modal
function closeModal() {
  const modal = document.querySelector('.modal');
  if (modal) {
    modal.remove();
  }
}

