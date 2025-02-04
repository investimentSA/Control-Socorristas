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
    const locationSpan = document.getElementById('user-location');
    const userNameSpan = document.getElementById('user-name');
    const modalMessage = document.getElementById('modal-message');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');
    let map;

    function showModal(message) {
        modalMessage.textContent = message;
        modal.style.display = 'block';
    }

    function hideModal() {
        modal.style.display = 'none';
    }

    async function registerUser(email, password) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            showModal('Error al registrar: ' + error.message);
        } else {
            showModal('¡Registro exitoso!');
        }
    }

    async function loginUser(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            showModal('Error al iniciar sesión: ' + error.message);
        } else {
            // Comprobar si el perfil está completo
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

    async function clockIn() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return showModal('No hay usuario autenticado.');
        
        try {
            // Solo obtenemos la ubicación sin mostrar el modal de error
            const location = await getLocation();
            await supabase.from('attendance').insert([{
                user_id: user.id,  
                clock_in: new Date().toISOString(),
                location
            }]);
            showModal('Fichado correctamente.');  // Mostrar mensaje de éxito sin error
        } catch (err) {
            showModal('Error al obtener ubicación: ' + err);
        }
    }

    async function clockOut() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return showModal('No hay usuario autenticado.');
        
        try {
            // Solo obtenemos la ubicación sin mostrar el modal de error
            const location = await getLocation();
            const { error } = await supabase.from('attendance').update({
                clock_out: new Date().toISOString(),
                location
            }).eq('user_id', user.id).is('clock_out', null);

            if (error) {
                showModal('Error al fichar salida: ' + error.message);
            } else {
                showModal('Fichado correctamente.');
            }
        } catch (err) {
            showModal('Error al obtener ubicación: ' + err);
        }
    }

    function getLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        // Mostrar ubicación en el mapa de Google
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        resolve(`${latitude}, ${longitude}`);
                        showMap(latitude, longitude);
                    },
                    (error) => {
                        if (error.code === error.PERMISSION_DENIED) {
                            reject('El permiso de ubicación ha sido denegado. Por favor, habilita la geolocalización en tu navegador.');
                        } else {
                            reject('Error al obtener ubicación: ' + error.message);
                        }
                    }
                );
            } else {
                reject('Geolocalización no soportada');
            }
        });
    }

    function showMap(latitude, longitude) {
        const location = { lat: latitude, lng: longitude };
        if (!map) {
            map = new google.maps.Map(document.getElementById("map"), {
                zoom: 15,
                center: location
            });
        }
        new google.maps.Marker({
            position: location,
            map: map,
            title: "Tu ubicación"
        });
    }

    function showAppView(email, name, photoUrl) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        userNameSpan.textContent = name || email;
        // Mostrar foto de perfil si está disponible
        if (photoUrl) {
            const userPhoto = document.getElementById('user-photo');
            userPhoto.src = photoUrl;
        }
    }

    function showLoginView() {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
        userNameSpan.textContent = '';
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
        const { data: profile, error } = await supabase
            .from('socorristas')
            .select('name, photo_url')
            .eq('id', userId)
            .single();

        if (error) {
            showModal('Error al cargar el perfil: ' + error.message);
            return;
        }

        // Si el perfil no está completo, mostrar formulario
        if (!profile || !profile.name || !profile.photo_url) {
            showProfileModal();
        } else {
            showAppView(profile.name, profile.photo_url);
        }
    }

    function showProfileModal() {
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
                .upload(`public/${name}-${Date.now()}`, photo);

            if (fileError) {
                showModal('Error al subir la foto: ' + fileError.message);
                return;
            }

            const photoUrl = fileData?.Key;  // URL del archivo subido

            // Actualizar el perfil del usuario en la base de datos
            const { error } = await supabase
                .from('socorristas')
                .upsert({
                    id: user.id,
                    name,
                    photo_url: photoUrl
                });

            if (error) {
                showModal('Error al guardar el perfil: ' + error.message);
            } else {
                showModal('Perfil guardado correctamente.');
                profileModal.remove();
                showAppView(name, photoUrl);
            }
        });
    }

    loginBtn.addEventListener('click', () => loginUser(emailInput.value, passwordInput.value));
    registerBtn.addEventListener('click', () => registerUser(emailInput.value, passwordInput.value));
    clockInBtn.addEventListener('click', clockIn);
    clockOutBtn.addEventListener('click', clockOut);
    logoutBtn.addEventListener('click', logoutUser);
    closeModal.addEventListener('click', hideModal);

    checkUserSession();
});
