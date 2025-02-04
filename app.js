import { auth, db } from './firebase.js'; // Importamos las funciones de Firebase

const loginBtn = document.getElementById('login-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

loginBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // Evitar que el formulario se envíe automáticamente

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Si todo está bien, redirigimos a la página principal o mostramos el mensaje de éxito
        console.log('Usuario logueado', userCredential.user);
    } catch (error) {
        errorMessage.textContent = 'Error de autenticación: ' + error.message;
    }
});

