document.addEventListener('DOMContentLoaded', async function () {
    const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw';  // Usa variables de entorno en producción
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Referencias a los elementos HTML
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
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

    async function clockInOrOut(isClockIn) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return showModal('No hay usuario autenticado.');

        // Validar si el perfil está completo
        const profile = await getUserProfile(user.id);
        if (!profile || !profile.name || !profile.photo_url) {
            showProfileModal(user.id);
            return showModal('Debes completar tu perfil antes de fichar.');
        }

        try {
            const location = await getLocation();

            if (isClockIn) {
                // Comprobar si ya existe un registro de entrada sin salida
                const { data: existingClockInRecords, error: fetchError } = await supabase
                    .from('attendance')
                    .select('*')
                    .eq('user_id', user.id)
                    .is('clock_out', null);

                if (fetchError) throw fetchError;

                if (existingClockInRecords.length > 0) {
                    showModal('Ya tienes un fichaje de entrada sin salida.');
                    return;
                }

                // Registrar fichaje de entrada
                await supabase.from('attendance').insert([{ user_id: user.id, clock_in: new Date().toISOString(), location }]);
                showModal('Fichaje de entrada correcto.');
            } else {
                // Buscar el último registro de entrada sin salida
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

                // Actualizar el fichaje de salida
                const { error: updateError } = await supabase
                    .from('attendance')
                    .update({ clock_out: new Date().toISOString(), location })
                    .eq('id', attendanceRecords[0].id);

                if (updateError) throw updateError;

                showModal('Fichaje de salida correcto.');
            }
        } catch (err) {
            console.log('Error al fichar:', err);
            showModal('Error al fichar: ' + (err.message || 'desconocido.'));
        }
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
                                reject('Error desconocido.');
                        }
                    }
                );
            } else {
                reject('Geolocalización no soportada en este navegador.');
            }
        });
    }

    function showModal(message) {
        modalMessage.textContent = message;
        modal.style.display = 'block';
    }

    function hideModal() {
        modal.style.display = 'none';
    }

    async function checkUserSession() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            checkUserProfile(user.id, user.email);
        } else {
            showLoginView();
        }
    }

    async function checkUserProfile(userId, email) {
        const profile = await getUserProfile(userId);
        if (!profile || !profile.name || !profile.photo_url) {
            showProfileModal(userId, email);
        } else {
            showAppView(profile.name, profile.photo_url);
        }
    }

    async function getUserProfile(userId) {
        const { data, error } = await supabase
            .from('socorristas')
            .select('name, photo_url, email')
            .eq('id', userId)
            .single();
        return error ? null : data;
    }

    function showProfileModal(userId, email) {
        const profileModal = document.createElement('div');
        profileModal.innerHTML = `
            <h3>Completa tu perfil</h3>
            <input type="text" id="profile-name" placeholder="Nombre Completo" required>
            <input type="email" id="profile-email" value="${email}" placeholder="Correo Electrónico" required>
            <input type="file" id="profile-photo" accept="image/*" required>
            <button id="save-profile">Guardar</button>
        `;
        document.body.appendChild(profileModal);

        document.getElementById('save-profile').addEventListener('click', async () => {
            const name = document.getElementById('profile-name').value;
            const email = document.getElementById('profile-email').value;
            const photo = document.getElementById('profile-photo').files[0];

            if (!name || !email || !photo) {
                showModal('Por favor, completa todos los campos.');
                return;
            }

            // Subir foto a Supabase Storage
            const { data: fileData, error: fileError } = await supabase
                .storage
                .from('avatars')
                .upload(`public/${userId}-${Date.now()}`, photo);

            if (fileError) {
                showModal('Error al subir la foto: ' + fileError.message);
                return;
            }

            const photoUrl = fileData?.path;

            // Guardar perfil en la base de datos
            const { error } = await supabase
                .from('socorristas')
                .upsert({ id: userId, name, email, photo_url: photoUrl });

            if (error) {
                showModal('Error al guardar el perfil: ' + error.message);
            } else {
                showModal('Perfil guardado correctamente.');
                profileModal.remove();
                showAppView(name, photoUrl);
            }
        });
    }

    function showAppView(name, photoUrl) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        userNameSpan.textContent = name;
        if (photoUrl) {
            userPhoto.src = `${supabaseUrl}/storage/v1/object/public/avatars/${photoUrl}`;
            userPhoto.style.display = 'block';
        }
    }

    function showLoginView() {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
    }

    loginBtn.addEventListener('click', () => loginUser(emailInput.value, passwordInput.value));
    registerBtn.addEventListener('click', () => registerUser(emailInput.value, passwordInput.value));
    clockInBtn.addEventListener('click', () => clockInOrOut(true));
    clockOutBtn.addEventListener('click', () => clockInOrOut(false));
    logoutBtn.addEventListener('click', logoutUser);
    closeModal.addEventListener('click', hideModal);

    checkUserSession();
});

