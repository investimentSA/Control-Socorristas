document.addEventListener("DOMContentLoaded", () => {
  const { createClient } = window.supabase;

  const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Registro de usuario
  const registroForm = document.getElementById("registroForm");
  if (registroForm) {
    registroForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      // Se actualizan los ids para coincidir con los del HTML
      const nombreCompleto = document.getElementById("nombreCompleto").value.trim();
      const email = document.getElementById("email").value.trim();  // Cambié emailRegistro por email
      const password = document.getElementById("password").value.trim();  // Cambié passwordRegistro por password

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

        if (emailCheckError && emailCheckError.code !== "PGRST116") {
          console.error("⚠️ Error al verificar el correo:", emailCheckError.message);
          alert("Hubo un problema al verificar el correo.");
          return;
        }

        if (existingUser) {
          alert("Este correo electrónico ya está registrado.");
          return;
        }

        // Crear el usuario en Supabase Auth
        const { error: authError, user } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nombre: nombreCompleto } },
        });

        if (authError) {
          alert("Error al crear la cuenta: " + authError.message);
          return;
        }

        // Registrar el usuario en la tabla 'usuarios'
        const { error: insertError } = await supabase
          .from("usuarios")
          .upsert([{ nombre: nombreCompleto, correo: email }]);

        if (insertError) {
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
  }
});


