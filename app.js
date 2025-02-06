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
        // Aquí puedes redirigir a la pantalla principal del trabajador
    }
}
