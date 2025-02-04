// Inicializar Supabase
const supabaseUrl = 'https://<tu-supabase-url>.supabase.co'; // Reemplaza con tu URL de Supabase
const supabaseKey = '<tu-supabase-api-key>'; // Reemplaza con tu clave de API de Supabase
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Elementos del DOM
const loginContainer = document.getElementById('login-container');
const socorristaContainer = document.getElementById('socorrista-container');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const checkInBtn = document.getElementById('check-in');
const checkOutBtn = document.getElementById('check-out');
const locationDisplay = document.getElementById('location');
const messageDisplay = document.getElementById('message');

// Verificar si el usuario está logueado
let currentUser = null;

// Obtener la ubicación actual del usuario
async function getLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            locationDisplay.textContent = `${latitude}, ${longitude}`;
            return { latitude, longitude };
        }, error => {
            locationDisplay.textContent = "Error al obtener la ubicación.";
        });
    } else {
        locationDisplay.textContent = "Geolocalización no soportada.";
    }
}

// Registrar un nuevo usuario
registerBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (email && password) {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            messageDisplay.textContent = `Error: ${error.message}`;
        } else {
            messageDisplay.textContent = `¡Registro exitoso! Revisa tu correo para confirmar la cuenta.`;
        }
    } else {
        messageDisplay.textContent = "Por favor ingresa el correo y la contraseña.";
    }
});

// Iniciar sesión
loginBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (email && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            messageDisplay.textContent = `Error: ${error.message}`;
        } else {
            currentUser = data.user;
            loginContainer.style.display = 'none';
            socorristaContainer.style.display = 'block';
            messageDisplay.textContent = `Bienvenido, ${data.user.email}`;
            getLocation(); // Mostrar ubicación actual
        }
    } else {
        messageDisplay.textContent = "Por favor ingresa el correo y la contraseña.";
    }
});

// Fichar entrada
checkInBtn.addEventListener('click', async () => {
    if (currentUser) {
        const location = await getLocation(); // Obtener ubicación
        const horaEntrada = new Date().toISOString();

        const { data, error } = await supabase
            .from('socorristas')
            .upsert([
                {
                    id: currentUser.id, // Usa el ID de usuario de Supabase
                    nombre: currentUser.email,
                    hora_entrada: horaEntrada,
                    latitude: location.latitude,
                    longitude: location.longitude
                }
            ]);

        if (error) {
            messageDisplay.textContent = `Error: ${error.message}`;
        } else {
            messageDisplay.textContent = `¡Hora de entrada registrada a las ${horaEntrada}!`;
        }
    }
});

// Fichar salida
checkOutBtn.addEventListener('click', async () => {
    if (currentUser) {
        const location = await getLocation(); // Obtener ubicación
        const horaSalida = new Date().toISOString();

        const { data, error } = await supabase
            .from('socorristas')
            .update({
                hora_salida: horaSalida,
                latitude: location.latitude,
                longitude: location.longitude
            })
            .eq('id', currentUser.id);

        if (error) {
            messageDisplay.textContent = `Error: ${error.message}`;
        } else {
            messageDisplay.textContent = `¡Hora de salida registrada a las ${horaSalida}!`;
        }
    }
});
