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
            showAppView(data.user.email);
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
                        resolve(${latitude}, ${longitude});
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

    function showAppView(email) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        userNameSpan.textContent = email;
    }

    function showLoginView() {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
        userNameSpan.textContent = '';
    }

    loginBtn.addEventListener('click', () => loginUser(emailInput.value, passwordInput.value));
    registerBtn.addEventListener('click', () => registerUser(emailInput.value, passwordInput.value));
    clockInBtn.addEventListener('click', clockIn);
    clockOutBtn.addEventListener('click', clockOut);
    logoutBtn.addEventListener('click', logoutUser);
    closeModal.addEventListener('click', hideModal);

    async function checkUserSession() {
        const { data: { user } } = await supabase.auth.getUser();
        user ? showAppView(user.email) : showLoginView();
    }

    checkUserSession();
});

