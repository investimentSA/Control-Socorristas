document.addEventListener('DOMContentLoaded', async function () {
    // Inicialización de Supabase
    const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co'; 
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw';

    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Elementos de la UI
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const clockInBtn = document.getElementById('clock-in-btn');
    const clockOutBtn = document.getElementById('clock-out-btn');
    const logoutBtn = document.getElementById('logout-btn');  // Nuevo botón de logout
    const locationSpan = document.getElementById('user-location');
    const userNameSpan = document.getElementById('user-name');
    const modalMessage = document.getElementById('modal-message');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');

    // Funciones para mostrar/ocultar modal
    function showModal(message) {
        modalMessage.textContent = message;
        modal.style.display = 'block';
    }

    function hideModal() {
        modal.style.display = 'none';
    }

    // Función para registrar usuario
    async function registerUser(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            showModal('Error al registrar: ' + error.message);
        } else {
            showModal('¡Registro exitoso! Revisa tu correo para verificar.');
        }
    }

    // Función para iniciar sesión
    async function loginUser(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            showModal('Error al iniciar sesión: ' + error.message);
        } else if (data.user) {
            showAppView(data.user.email);
            getLocation();
        }
    }

    // Función para cerrar sesión
    async function logoutUser() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            showModal('Error al cerrar sesión: ' + error.message);
        } else {
            showLoginView();
        }
    }

    // Función para fichar entrada
    async function clockIn() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showModal('No hay usuario autenticado.');
                return;
            }

            const location = await getLocation();
            const { error } = await supabase
                .from('attendance')
                .insert([{ user_email: user.email, clock_in: new Date().toISOString(), location }]);

            if (error) {
                showModal('Error al fichar entrada: ' + error.message);
            } else {
                showModal('Fichado correctamente a la entrada.');
            }
        } catch (error) {
            showModal('Error al fichar entrada: ' + error);
        }
    }

    // Función para fichar salida
    async function clockOut() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showModal('No hay usuario autenticado.');
                return;
            }

            const location = await getLocation();
            const { error } = await supabase
                .from('attendance')
                .update({ clock_out: new Date().toISOString(), location })
                .eq('user_email', user.email)
                .is('clock_out', null);

            if (error) {
                showModal('Error al fichar salida: ' + error.message);
            } else {
                showModal('Fichado correctamente a la salida.');
            }
        } catch (error) {
            showModal('Error al fichar salida: ' + error);
        }
    }

    // Función para obtener ubicación usando geolocalización
    function getLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        const location = `${position.coords.latitude}, ${position.coords.longitude}`;
                        locationSpan.textContent = location;
                        resolve(location);
                    },
                    error => {
                        reject('Error al obtener ubicación');
                    }
                );
            } else {
                reject('Geolocalización no soportada');
            }
        });
    }

    // Mostrar vista de la aplicación
    function showAppView(email) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        userNameSpan.textContent = email;
    }

    // Mostrar vista de login
    function showLoginView() {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
        userNameSpan.textContent = '';
    }

    // Eventos de los botones
    loginBtn.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        loginUser(email, password);
    });

    registerBtn.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        registerUser(email, password);
    });

    clockInBtn.addEventListener('click', clockIn);
    clockOutBtn.addEventListener('click', clockOut);
    logoutBtn.addEventListener('click', logoutUser);  // Evento de logout
    closeModal.addEventListener('click', hideModal);

    // Verificar sesión al cargar la página
    async function checkUserSession() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            showAppView(user.email);
            await getLocation();
        } else {
            showLoginView();
        }
    }

    checkUserSession();
});
