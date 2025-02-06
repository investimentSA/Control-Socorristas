// Configuración de Supabase
const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co'; // Tu URL de Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw'; // Tu clave de API de Supabase

const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Lógica de registro de usuario
document.getElementById("registroForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  // Obtener los valores del formulario
  const nombreCompleto = document.getElementById("nombreCompleto").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // Registro en Supabase Auth
    const { user, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      alert("Error al crear la cuenta: " + error.message);
    } else {
      // Si la cuenta se crea correctamente, guardar los datos del usuario en la base de datos
      const { data, error: insertError } = await supabase
        .from("usuarios") // La tabla donde se guardan los usuarios
        .insert([
          {
            nombre: nombreCompleto,
            correo: email,
            contraseña: password, // Puedes cifrar la contraseña en lugar de guardarla en texto claro.
          },
        ]);

      if (insertError) {
        alert("Error al registrar los datos del usuario: " + insertError.message);
      } else {
        alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
        window.location.href = "index.html"; // Redirigir al inicio de sesión
      }
    }
  } catch (error) {
    alert('Hubo un error al intentar registrar el usuario: ' + error.message);
  }
});
