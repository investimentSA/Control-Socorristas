// Configuración de Supabase usando el CDN
const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co';  // Tu URL de Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw';  // Tu clave de API de Supabase

// Crear el cliente de Supabase
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Lógica de inicio de sesión
document.getElementById("loginForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // Intentar iniciar sesión con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert('Correo o contraseña incorrectos');
    } else {
      alert('¡Inicio de sesión exitoso!');
      // Redirigir a la pantalla principal o dashboard
      window.location.href = 'dashboard.html'; // Cambia la URL si es necesario
    }
  } catch (error) {
    alert('Error al intentar iniciar sesión');
  }
});
