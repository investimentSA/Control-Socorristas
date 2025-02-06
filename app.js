document.addEventListener('DOMContentLoaded', async function () {
    const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const clockInBtn = document.getElementById('clock-in-btn');
    const clockOutBtn = document.getElementById('clock-out-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userNameSpan = document.getElementById('user-name');
    const modalMessage = document.getElementById('modal-message');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');
    let map;

    // Función para mostrar modal de mensaje
    function showModal(message) {
        modalMessage.textContent = message;
        modal.style.display = 'block';
    }

    function hideModal() {
        modal.style.display = 'none';
    }

    // Función para registrar usuario
    async function registerUser(email, password) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            showModal('Error al registrar: ' + error.message);
        } else {
            showModal('¡Registro exitoso! Ahora inicia sesión.');
        }
    }

    // Función para iniciar sesión
    async function loginUser(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            showModal('Error al iniciar sesión: ' + error.message);
        } else {
            showAppView(data.user.email); // Pasamos el email del usuario autenticado
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

    // Función para mostrar vista de la app (fichaje)
    function showAppView(email) {
        userNameSpan.textContent = email;
        clockInBtn.style.display = 'inline-block';  // Muestra el botón de fichaje de entrada
        clockOutBtn.style.display = 'inline-block'; // Muestra el botón de fichaje de salida
        loginBtn.style.display = 'none'; // Oculta el botón de inicio de sesión
        registerBtn.style.display = 'none'; // Oculta el botón de registro
        logoutBtn.style.display = 'inline-block'; // Muestra el botón de cerrar sesión
    }

    // Función para mostrar vista de inicio de sesión
    function showLoginView() {
        loginBtn.style.display = 'inline-block'; // Muestra el botón de inicio de sesión
        registerBtn.style.display = 'inline-block'; // Muestra el botón de registro
        clockInBtn.style.display = 'none'; // Oculta el botón de fichaje de entrada
        clockOutBtn.style.display = 'none'; // Oculta el botón de fichaje de salida
        logoutBtn.style.display = 'none'; // Oculta el botón de cerrar sesión
    }

    // Función para fichar entrada
    async function clockIn() {
        const { data } = await supabase.auth.getSession();
        if (!data.session) return showModal('No hay usuario autenticado.');

        const { data: attendanceData, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', data.session.user.id)
            .is('clock_out', null)
            .single();

        if (attendanceData) {
            showModal('Ya has fichado entrada.');
            return;
        }

        try {
            const location = await getLocation();
            await supabase.from('attendance').insert([{
                user_id: data.session.user.id,
                clock_in: new Date().toISOString(),
                location
            }]);
            showModal('Fichado correctamente.');
        } catch (err) {
            showModal('Error al obtener ubicación: ' + err);
        }
    }

    // Función para fichar salida
    async function clockOut() {
        const { data } = await supabase.auth.getSession();
        if (!data.session) return showModal('No hay usuario autenticado.');

        const { data: attendanceData, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', data.session.user.id)
            .is('clock_out', null)
            .single();

        if (!attendanceData) {
            showModal('Primero debes fichar la entrada.');
            return;
        }

        try {
            const location = await getLocation();
            await supabase.from('attendance')
                .update({ clock_out: new Date().toISOString(), location })
                .eq('user_id', data.session.user.id)
                .is('clock_out', null);

            showModal('Fichado correctamente.');
        } catch (err) {
            showModal('Error al obtener ubicación: ' + err);
        }
    }

    // Función para obtener ubicación
    function getLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        resolve(`${latitude}, ${longitude}`);
                    },
                    (error) => {
                        reject('Error al obtener ubicación: ' + error.message);
                    }
                );
            } else {
                reject('Geolocalización no soportada');
            }
        });
    }

    loginBtn.addEventListener('click', () => loginUser(emailInput.value, passwordInput.value));
    registerBtn.addEventListener('click', () => registerUser(emailInput.value, passwordInput.value));
    logoutBtn.addEventListener('click', logoutUser);
    clockInBtn.addEventListener('click', clockIn);
    clockOutBtn.addEventListener('click', clockOut);
    closeModal.addEventListener('click', hideModal);

    // Comprobamos si el usuario ya está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showAppView(session.user.email);
    } else {
        showLoginView();
    }
});
