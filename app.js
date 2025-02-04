document.addEventListener('DOMContentLoaded', async function () {
    const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw';  //  Usa variables de entorno en producción
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
            checkUserProfile(data.user.id);
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
                await supabase.from('attendance').insert([{ user_id: user.id, clock_in: new Date().toISOString(), location }]);
                showModal('Fichado de entrada correcto.');
            } else {
                const { error } = await supabase.from('attendance')
                    .update({ clock_out: new Date().toISOString(), location })
                    .eq('user_id', user.id)
                    .is('clock_out', null);
                if (error) throw error;
                showModal('Fichado de salida correcto.');
            }
        } catch (err) {
            showModal('Error al fichar: ' + err);
        }
    }

    async function getLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => resolve(`${position.coords.latitude}, ${position.coords.longitude}`),
                    error => reject('Error obteniendo la ubicación: ' + error.message)
                );
            } else {
                reject('Geolocalización no soportada.');
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
            checkUserProfile(user.id);
        } else {
            showLoginView();
        }
    }

    async function checkUserProfile(userId) {
        const profile = await getUserProfile(userId);
        if (!profile || !profile.name || !profile.photo_url) {
            showProfileModal(userId);
        } else {
            showAppView(profile.name, profile.photo_url);
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

    function showProfileModal(userId) {
        const profileModal = document.createElement('div');
        profileModal.innerHTML = `
            <h3>Completa tu perfil</h3>
            <input type="text" id="profile-name" placeholder="Nombre Completo" required>
            <input type="file" id="profile-photo" accept="image/*" required>
            <button id="save-profile">Guardar</button>
        `;
        document.body.appendChild(profileModal);

        document.getElementById('save-profile').addEventListener('click', async () => {
            const name = document.getElementById('profile-name').value;
            const photo = document.getElementById('profile-photo').files[0];

            if (!name || !photo) {
                showModal('Por favor, completa todos los campos.');
                return;
            }

            // Subir la foto a Supabase Storage
            const { data: fileData, error: fileError } = await supabase
                .storage
                .from('avatars')
                .upload(`public/${userId}-${Date.now()}`, photo);

            if (fileError) {
                showModal('Error al subir la foto: ' + fileError.message);
                return;
            }

            const photoUrl = fileData?.path; // URL del archivo subido

            // Actualizar el perfil del usuario en la base de datos
            const { error } = await supabase
                .from('socorristas')
                .upsert({ id: userId, name, photo_url: photoUrl });

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
        userNameSpan.textContent = '';
        userPhoto.style.display = 'none';
    }

    // Eventos
    loginBtn.addEventListener('click', () => loginUser(emailInput.value, passwordInput.value));
    registerBtn.addEventListener('click', () => registerUser(emailInput.value, passwordInput.value));
    clockInBtn.addEventListener('click', () => clockInOrOut(true));
    clockOutBtn.addEventListener('click', () => clockInOrOut(false));
    logoutBtn.addEventListener('click', logoutUser);
    closeModal.addEventListener('click', hideModal);

    checkUserSession();
});
