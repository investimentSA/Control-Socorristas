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
    const userLocationSpan = document.getElementById('user-location');
    const modalMessage = document.getElementById('modal-message');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');

    // Mostrar mensaje en el modal
    function showModal(message) {
        modalMessage.textContent = message;
        modal.style.display = 'block';
    }

    function hideModal() {
        modal.style.display = 'none';
    }

    // Función para registrar un nuevo usuario
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
            // Una vez logueado, mostrar la vista de la aplicación
            showAppView(data.user.email);
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

    // Función para mostrar la vista de la aplicación después de iniciar sesión
    function showAppView(email) {
        // Cambiar el nombre de usuario
        userNameSpan.textContent = email;
        // Mostrar el contenedor principal de la app
        document.getElementById('app-container').style.display = 'block';
        // Esconder el contenedor de inicio de sesión
        document.getElementById('login-container').style.display = 'none';
        // Mostrar los botones de fichar entrada y salida
        clockInBtn.style.display = 'inline-block';
        clockOutBtn.style.display = 'inline-block';
        // Mostrar el botón de cerrar sesión
        logoutBtn.style.display = 'inline-block';
    }

    // Función para mostrar la vista de inicio de sesión
    function showLoginView() {
        // Mostrar el contenedor de login
        document.getElementById('login-container').style.display = 'block';
        // Esconder el contenedor de la app
        document.getElementById('app-container').style.display = 'none';
        // Esconder los botones de fichar
        clockInBtn.style.display = 'none';
        clockOutBtn.style.display = 'none';
        // Esconder el botón de cerrar sesión
        logoutBtn.style.display = 'none';
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

    // Función para obtener la ubicación del usuario
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

    // Verificar si hay una sesión activa al cargar la página
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showAppView(session.user.email);
    } else {
        showLoginView();
    }
});
