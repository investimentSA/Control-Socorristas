document.addEventListener('DOMContentLoaded', async function () {
    const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    let hasClockedIn = false;
    let hasClockedOut = false;

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
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => resolve(`${position.coords.latitude}, ${position.coords.longitude}`),
                    error => {
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                reject('No has permitido acceder a tu ubicación.');
                                break;
                            case error.POSITION_UNAVAILABLE:
                                reject('Ubicación no disponible.');
                                break;
                            case error.TIMEOUT:
                                reject('Tiempo de espera agotado.');
                                break;
                            default:
                                reject('Error desconocido al obtener la ubicación.');
                        }
                    }
                );
            } else {
                reject('Geolocalización no soportada en este navegador.');
            }
        });
    }

    async function loginUser(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            showModal('Error al iniciar sesión: ' + error.message);
        } else {
            hasClockedIn = false;
            hasClockedOut = false;
            checkUserProfile(data.user.id, email);
        }
    }

    async function checkUserProfile(userId, email) {
        const profile = await getUserProfile(userId);
        if (!profile || !profile.name || !profile.photo_url) {
            showModal('Debes completar tu perfil antes de continuar.');
        }
    }

    async function getUserProfile(userId) {
        const { data, error } = await supabase
            .from('socorristas')
            .select('name, photo_url')
            .eq('id', userId)
            .single();
        return error ? null : data;
    }

    async function clockInOrOut(isClockIn) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return showModal('No hay usuario autenticado.');

        const profile = await getUserProfile(user.id);
        if (!profile || !profile.name || !profile.photo_url) {
            return showModal('Debes completar tu perfil antes de fichar.');
        }

        try {
            const location = await getLocation();

            if (isClockIn) {
                if (hasClockedIn) {
                    showModal('Ya has registrado una entrada en esta sesión.');
                    return;
                }

                await supabase.from('attendance').insert([{ user_id: user.id, clock_in: new Date().toISOString(), location }]);
                hasClockedIn = true;
                showModal('Fichaje de entrada correcto.');
            } else {
                if (!hasClockedIn) {
                    showModal('Debes fichar la entrada antes de fichar la salida.');
                    return;
                }
                if (hasClockedOut) {
                    showModal('Ya has registrado una salida en esta sesión.');
                    return;
                }

                const { data: attendanceRecords, error } = await supabase
                    .from('attendance')
                    .select('*')
                    .eq('user_id', user.id)
                    .is('clock_out', null);

                if (error) throw error;

                if (attendanceRecords.length === 0) {
                    showModal('No tienes un fichaje de entrada para registrar la salida.');
                    return;
                }

                await supabase
                    .from('attendance')
                    .update({ clock_out: new Date().toISOString(), location })
                    .eq('id', attendanceRecords[0].id);

                hasClockedOut = true;
                showModal('Fichaje de salida correcto.');
            }
        } catch (err) {
            console.log('Error al fichar:', err);
            showModal('Error al fichar: ' + (err.message || 'desconocido.'));
        }
    }

    loginBtn.addEventListener('click', () => loginUser(emailInput.value, passwordInput.value));
    registerBtn.addEventListener('click', () => registerUser(emailInput.value, passwordInput.value));
    clockInBtn.addEventListener('click', () => clockInOrOut(true));
    clockOutBtn.addEventListener('click', () => clockInOrOut(false));
    logoutBtn.addEventListener('click', () => {
        hasClockedIn = false;
        hasClockedOut = false;
        logoutUser();
    });

    closeModal.addEventListener('click', hideModal);
});
