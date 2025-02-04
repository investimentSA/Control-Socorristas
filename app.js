// app.js

import { auth, db } from './firebase.js'; // Importa las funciones necesarias de Firebase

const loginBtn = document.getElementById('login-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

// Iniciar sesión
loginBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // Evitar el comportamiento predeterminado del formulario

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Si todo está bien, muestra un mensaje de éxito
        console.log('Usuario logueado', userCredential.user);
    } catch (error) {
        // Si hay un error, muestra el mensaje de error
        errorMessage.textContent = 'Error de autenticación: ' + error.message;
    }
});

