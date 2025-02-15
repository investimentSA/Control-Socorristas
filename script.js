document.addEventListener("DOMContentLoaded", () => {
  // Obtener createClient desde window.supabase
  const { createClient } = window.supabase;

  // Configuración de Supabase
  const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw';

  // Inicializar Supabase correctamente
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Asegurarse de que el formulario de inicio de sesión esté disponible en el DOM
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    // Manejar el inicio de sesión
    loginForm.addEventListener("submit", async function(event) {
      event.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      // Validar campos
      if (!email || !password) {
        alert("Por favor, completa ambos campos.");
        return;
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          alert('Correo o contraseña incorrectos');
        } else {
          alert('¡Inicio de sesión exitoso!');
          window.location.href = 'fichaje.html';
        }
      } catch (error) {
        alert('Error al intentar iniciar sesión');
        console.error(error);
      }
    });
  } else {
    console.error("Formulario de inicio de sesión no encontrado.");
  }
});


