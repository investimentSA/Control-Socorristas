// Inicialización de Supabase
const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw';
const supabase = supabase.createClient(supabaseUrl, supabaseKey); // Esta es la inicialización correcta de Supabase

// Variables de los elementos de la interfaz
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const clockInBtn = document.getElementById('clock-in-btn');
const clockOutBtn = document.getElementById('clock-out-btn');
const locationSpan = document.getElementById('user-location');
const userNameSpan = document.getElementById('user-name');
const modalMessage = document.getElementById('modal-message');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('close-modal');

// Funciones para mostrar/ocultar modales
function showModal(message) {
    modalMessage.textContent = message;
    modal.style.display = 'block';
}

function hideModal() {
    modal.style.display = 'none';
}

// Función para registrar un nuevo usuario
async function registerUser(email, password) {
    const { user, error } = await supabase.auth.signUp({ email, password });
    if (error) {
        showModal('Error al registrar: ' + error.message);
    } else {
        showModal('¡Registro exitoso! Revisa tu correo para verificar.');
    }
}

// Función para iniciar sesión
async function loginUser(email, password) {
    const { user, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        showModal('Error al iniciar sesión: ' + error.message);
    } else {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        userNameSpan.textContent = user.email;
        getLocation();  // Obtener ubicación del usuario
    }
}

// Función para fichar entrada
async function clockIn() {
    const location = await getLocation();
    const { data, error } = await supabase
        .from('attendance')
        .insert([{ user_email: supabase.auth.user().email, clock_in: new Date(), location }]);

    if (error) {
        showModal('Error al fichar entrada: ' + error.message);
    } else {
        showModal('Fichado correctamente a la entrada.');
    }
}

// Función para fichar salida
async function clockOut() {
    const location = await getLocation();
    const { data, error } = await supabase
        .from('attendance')
        .update({ clock_out: new Date(), location })
        .match({ user_email: supabase.auth.user().email, clock_out: null });

    if (error) {
        showModal('Error al fichar salida: ' + error.message);
    } else {
        showModal('Fichado correctamente a la salida.');
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

clockInBtn.addEventListener('click', () => {
    clockIn();
});

clockOutBtn.addEventListener('click', () => {
    clockOut();
});

closeModal.addEventListener('click', hideModal);

// Si ya está autenticado, mostrar la vista de la app
async function checkUserSession() {
    const user = supabase.auth.user();
    if (user) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        userNameSpan.textContent = user.email;
        await getLocation();  // Obtener ubicación si ya está autenticado
    }
}

// Comprobar si ya hay un usuario autenticado al cargar la página
checkUserSession();

