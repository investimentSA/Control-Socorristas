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
    loginForm.addEventListener("submit", async function (event) {
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

  // Asegurarse de que el formulario de registro esté disponible en el DOM
  const registroForm = document.getElementById("registroForm");
  if (registroForm) {
    // Manejar el registro de usuario
    registroForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const nombreCompleto = document.getElementById("nombreCompleto").value.trim();
      const email = document.getElementById("emailRegistro").value.trim();
      const password = document.getElementById("passwordRegistro").value.trim();

      // Validar campos
      if (!nombreCompleto || !email || !password) {
        alert("Por favor, completa todos los campos.");
        return;
      }

      try {
        // Verificar si el correo ya está registrado
        const { data: existingUser, error: emailCheckError } = await supabase
          .from("usuarios")
          .select("correo")
          .eq("correo", email)
          .single();

        // Manejar error de verificación de correo
        if (emailCheckError && emailCheckError.code !== "PGRST116") {
          console.error("⚠️ Error al verificar el correo:", emailCheckError.message);
          alert("Hubo un problema al verificar el correo.");
          return;
        }

        // Si ya existe un usuario con el correo
        if (existingUser) {
          alert("Este correo electrónico ya está registrado.");
          return;
        }

        // Registro en Supabase Auth
        const { error: authError, user } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nombre: nombreCompleto } },
        });

        if (authError) {
          console.error("⚠️ Error en la autenticación:", authError.message);
          alert("Error al crear la cuenta: " + authError.message);
          return;
        }

        // Verificar si la autenticación fue exitosa
        if (!user) {
          alert("No se pudo autenticar el usuario. Intenta nuevamente.");
          return;
        }

        // Si el registro fue exitoso en Auth, ahora insertamos en la tabla 'usuarios'
        const { error: insertError } = await supabase
          .from("usuarios")
          .upsert([{ nombre: nombreCompleto, correo: email }]);

        if (insertError) {
          console.error("⚠️ Error al registrar los datos del usuario:", insertError.message);
          alert("Error al registrar los datos del usuario: " + insertError.message);
          return;
        }

        alert("¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.");
        window.location.href = "index.html"; // Redirigir al inicio

      } catch (error) {
        console.error("⚠️ Error en el registro:", error);
        alert("Error en el registro: " + error.message);
      }
    });
  } else {
    console.error("Formulario de registro no encontrado.");
  }
});


