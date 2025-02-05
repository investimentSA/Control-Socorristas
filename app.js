document.addEventListener('DOMContentLoaded', async function () {
    const SUPABASE_URL = 'https://lgvmxoamdxbhtmicawlv.supabase.co';
    const SUPABASE_KEY = 'TU_CLAVE_AQUI'; // ⚠️ Reemplázalo con una variable segura en producción
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    let hasClockedIn = localStorage.getItem('hasClockedIn') === 'true';
    let hasClockedOut = localStorage.getItem('hasClockedOut') === 'true';

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const clockInBtn = document.getElementById('clock-in-btn');
    const clockOutBtn = document.getElementById('clock-out-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const modalMessage = document.getElementById('modal-message');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');

    function showModal(message) {
        modalMessage.textContent = message;
        modal.style.display = 'block';
    }

    function hideModal() {
        modal.style.display = 'none';
    }

    async function getLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) return reject('Geolocalización no soportada.');
            navigator.geolocation.getCurrentPosition(
                position => resolve(`${position.coords.latitude}, ${position.coords.longitude}`),
                error => reject(`Error de geolocalización: ${error.message}`)
            );
        });
    }

    async function registerUser(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return showModal(`Error al registrarse: ${error.message}`);

        const user = data.user;
        if (user) {
            const { error: profileError } = await supabase.from('socorristas').insert([
                { id: user.id, email, name: 'Usuario Nuevo', photo_url: '' }
            ]);
            if (profileError) return showModal(`Error al crear perfil: ${profileError.message}`);
            showModal('Registro exitoso. Ahora inicia sesión.');
        }
    }

    async function loginUser(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return showModal(`Error al iniciar sesión: ${error.message}`);

        const user = data.user;
        if (user) {
            hasClockedIn = false;
            hasClockedOut = false;
            localStorage.setItem('hasClockedIn', 'false');
            localStorage.setItem('hasClockedOut', 'false');
            checkUserProfile(user.id);
        }
    }

    async function checkUserProfile(userId) {
        const profile = await getUserProfile(userId);
        if (!profile || !profile.name) {
            showModal('Debes completar tu perfil antes de continuar.');
        }
    }

    async function getUserProfile(userId) {
        const { data, error } = await supabase.from('socorristas').select('name, photo_url').eq('id', userId).single();
        return error ? null : data;
    }

    async function clockInOrOut(isClockIn) {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return showModal('No hay usuario autenticado.');

        const profile = await getUserProfile(user.id);
        if (!profile || !profile.name) return showModal('Debes completar tu perfil antes de fichar.');

        try {
            const location = await getLocation();
            if (isClockIn) {
                if (hasClockedIn) return showModal('Ya has fichado entrada en esta sesión.');
                await supabase.from('attendance').insert([{ user_id: user.id, clock_in: new Date().toISOString(), location }]);
                hasClockedIn = true;
                localStorage.setItem('hasClockedIn', 'true');
                showModal('Fichaje de entrada correcto.');
            } else {
                if (!hasClockedIn) return showModal('Debes fichar entrada antes de fichar salida.');
                if (hasClockedOut) return showModal('Ya has fichado salida en esta sesión.');
                const { data: attendanceRecords, error } = await supabase.from('attendance').select('id').eq('user_id', user.id).is('clock_out', null).single();
                if (error || !attendanceRecords) return showModal('No tienes una entrada sin salida.');
                await supabase.from('attendance').update({ clock_out: new Date().toISOString(), location }).eq('id', attendanceRecords.id);
                hasClockedOut = true;
                localStorage.setItem('hasClockedOut', 'true');
                showModal('Fichaje de salida correcto.');
            }
        } catch (err) {
            console.error('Error al fichar:', err);
            showModal(`Error al fichar: ${err.message || 'desconocido'}`);
        }
    }

    async function logoutUser() {
        await supabase.auth.signOut();
        hasClockedIn = false;
        hasClockedOut = false;
        localStorage.setItem('hasClockedIn', 'false');
        localStorage.setItem('hasClockedOut', 'false');
        showModal('Sesión cerrada.');
    }

    loginBtn.addEventListener('click', () => loginUser(emailInput.value, passwordInput.value));
    registerBtn.addEventListener('click', () => registerUser(emailInput.value, passwordInput.value));
    clockInBtn.addEventListener('click', () => clockInOrOut(true));
    clockOutBtn.addEventListener('click', () => clockInOrOut(false));
    logoutBtn.addEventListener('click', logoutUser);
    closeModal.addEventListener('click', hideModal);
});

