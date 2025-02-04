document.addEventListener('DOMContentLoaded', async function () {
    const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Referencias a los elementos HTML
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const goToRegisterBtn = document.getElementById('go-to-register-btn');
    const goToLoginBtn = document.getElementById('go-to-login-btn');
    const clockInBtn = document.getElementById('clock-in-btn');
    const clockOutBtn = document.getElementById('clock-out-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userNameSpan = document.getElementById('user-name');
    const userPhoto = document.getElementById('user-photo');
    const modalMessage = document.getElementById('modal-message');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');

    async function registerUser(email, password) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            showModal('Error al registrar: ' + error.message);
        } else {
            showModal('Registro exitoso. Inicia sesión para completar tu perfil.');
        }
    }

    async function loginUser(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            showModal('Error al iniciar sesión: ' + error.message);
        } else {
            clearUserFichajes(data.user.id); 
            checkUserProfile(data.user.id, email);  
        }
    }

    async function logoutUser() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            showModal('Error al cerrar sesión: ' + error.message);
        } else {
            showLoginView();
        }
    }

    function showModal(message) {
        modalMessage.textContent = message;
        modal.style.display = 'block';
    }

    function hideModal() {
        modal.style.display = 'none';
    }

    function showAppView(name, photoUrl) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('register-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        userNameSpan.textContent = name;
        if (photoUrl) {
            userPhoto.src = `${supabaseUrl}/storage/v1/object/public/avatars/${photoUrl}`;
            userPhoto.style.display = 'block';
        }
    }

    function showLoginView() {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('register-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'none';
        userNameSpan.textContent = '';
        userPhoto.style.display = 'none';
    }

    function showRegisterView() {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('register-container').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
    }

    // Eventos
    loginBtn.addEventListener('click', () => loginUser(emailInput.value, passwordInput.value));
    registerBtn.addEventListener('click', () => registerUser(emailInput.value, passwordInput.value));
    goToRegisterBtn.addEventListener('click', showRegisterView);
    goToLoginBtn.addEventListener('click', showLoginView);
    logoutBtn.addEventListener('click', logoutUser);
    closeModal.addEventListener('click', hideModal);

    // Verificar si ya hay sesión activa
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        clearUserFichajes(user.id);
        checkUserProfile(user.id, user.email);
    } else {
        showLoginView();
    }
});

