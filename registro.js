document.addEventListener("DOMContentLoaded", () => {
  // Configuración de Supabase
  const supabaseUrl = "https://lgvmxoamdxbhtmicawlv.supabase.co";  // URL de tu Supabase
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw";  // Tu clave de API

  // Asegúrate de que Supabase.js esté cargado
  if (!window.supabase || !window.supabase.createClient) {
    console.error("La librería de Supabase no está cargada o no es accesible.");
    return;
  }

  // Inicializar el cliente de Supabase
  const { createClient } = window.supabase;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Captura el formulario de registro
  const registroForm = document.getElementById("registroForm");
  if (!registroForm) {
    console.error("Formulario de registro no encontrado.");
    return;
  }

  // Maneja el envío del formulario
  registroForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Obtener valores del formulario
    const nombreCompleto = document.getElementById("nombreCompleto").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!nombreCompleto || !email || !password) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      // Verificar si el correo ya existe en la tabla 'usuarios'
      const { data: existingUser, error: checkError } = await supabase
        .from("usuarios")
        .select("correo")
        .eq("correo", email)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // Si hubo un error distinto a "no se encontró el correo", muestra el error
        alert("Error al verificar el correo: " + checkError.message);
        return;
      }

      if (existingUser) {
        // Si el correo ya está registrado, mostrar un mensaje
        alert("Este correo electrónico ya está registrado.");
        return;
      }

      // Registro en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { nombre: nombreCompleto }, // Guardar el nombre como metadato en Auth
        },
      });

      if (error) {
        alert("Error al crear la cuenta: " + error.message);
        return;
      }

      // Insertar los datos del usuario en la tabla 'usuarios', excluyendo la contraseña
      const { error: insertError } = await supabase
        .from("usuarios")
        .insert([
          {
            nombre: nombreCompleto,
            correo: email,
          },
        ]);

      if (insertError) {
        alert("Error al registrar los datos del usuario: " + insertError.message);
        return;
      }

      alert("¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.");
      window.location.href = "index.html"; // Redirigir al login

    } catch (error) {
      alert("Hubo un error en el registro: " + error.message);
    }
  });
});

