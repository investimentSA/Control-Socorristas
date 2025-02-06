// Configuración de Supabase
const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Mostrar pantalla de registro
function mostrarRegistro() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('registro').style.display = 'block';
}

// Mostrar pantalla de login
function mostrarLogin() {
    document.getElementById('registro').style.display = 'none';
    document.getElementById('login').style.display = 'block';
}

// Función para registrar usuario
async function registrarUsuario() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const foto = document.getElementById('foto').files[0];

    // Subir la foto a Supabase Storage
    const { data: photoData, error: uploadError } = await supabase
        .storage
        .from('profile-pics')
        .upload(`public/${email}.jpg`, foto);

    if (uploadError) {
        alert("Error subiendo la foto");
        return;
    }

    // Crear el usuario
    const { user, error } = await supabase.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        alert(error.message);
    } else {
        // Guardar la URL de la foto en la base de datos
        await supabase
            .from('usuarios')
            .insert([{ nombre: email, correo: email, contraseña: password, foto_url: photoData.Key }]);

        alert('Usuario registrado con éxito');
        mostrarLogin();  // Mostrar la pantalla de login
    }
}

// Función para iniciar sesión
async function iniciarSesion() {
    const email = document.getElementById('emailLogin').value;
    const password = document.getElementById('passwordLogin').value;

    const { session, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert(error.message);
    } else {
        alert('Bienvenido ' + session.user.email);
        mostrarDashboard();  // Mostrar la pantalla del Dashboard
    }
}

// Mostrar el Dashboard después de iniciar sesión
function mostrarDashboard() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('registro').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    initMap();  // Inicializar el mapa
}

// Función para obtener las ubicaciones de los trabajadores desde Supabase
async function obtenerUbicaciones() {
    const { data, error } = await supabase
        .from('registro_entradas')
        .select('latitud, longitud, usuarios.nombre')
        .eq('tipo_evento', 'entrada')  // Aquí estamos obteniendo las ubicaciones de las entradas
        .order('fecha_hora', { ascending: false })  // Ordenar para obtener las más recientes
        .limit(10);  // Limitar a las últimas 10 entradas

    if (error) {
        console.error(error);
        return [];
    }

    return data;
}

// Función que se ejecuta cuando la API de Google Maps se ha cargado
function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.4168, lng: -3.7038 },  // Madrid, España (puedes cambiarlo)
        zoom: 12
    });

    obtenerUbicaciones().then(trabajadores => {
        trabajadores.forEach(trabajador => {
            const marker = new google.maps.Marker({
                position: { lat: trabajador.latitud, lng: trabajador.longitud },
                map: map,
                title: trabajador.nombre
            });

            const infowindow = new google.maps.InfoWindow({
                content: `<h3>${trabajador.nombre}</h3>`
            });

            marker.addListener('click', function () {
                infowindow.open(map, marker);
            });
        });
    });
}

