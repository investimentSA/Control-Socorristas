document.addEventListener("DOMContentLoaded", () => {
  // 📌 DOM completamente cargado
  console.log("📌 DOM completamente cargado");

  // 🔹 Configuración de Supabase
  const supabaseUrl = "https://lgvmxoamdxbhtmicawlv.supabase.co";  
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw";  // ⚠️ Usa variables de entorno en producción

  // Crear el cliente de Supabase
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  // 🟢 Esperar a que el formulario esté disponible
  const registroForm = document.getElementById("registroForm");

  // Verifica si el formulario existe en el DOM
  if (!registroForm) {
    console.error("❌ Error: Formulario de registro no encontrado. Verifica el id='registroForm' en tu HTML.");
    return;
  }

  // Manejar el envío del formulario
  registroForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nombreCompleto = document.getElementById("nombreCompleto")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

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

      // Manejar el error de la verificación de correo
      if (emailCheckError && emailCheckError.code !== "PGRST116") {
        console.error("⚠️ Error al verificar el correo:", emailCheckError.message);
        alert("Hubo un problema al verificar el correo.");
        return;
      }

      // Si ya existe un usuario con ese correo
      if (existingUser) {
        alert("Este correo electrónico ya está registrado.");
        return;
      }

      // Registro en Supabase Auth
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre: nombreCompleto } },
      });

      if (authError) {
        alert("Error al crear la cuenta: " + authError.message);
        return;
      }

      // Insertar usuario en la tabla 'usuarios'
      const { error: insertError } = await supabase
        .from("usuarios")
        .insert([{ nombre: nombreCompleto, correo: email }]);

      if (insertError) {
        alert("Error al registrar los datos del usuario: " + insertError.message);
        return;
      }

      alert("¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.");
      window.location.href = "index.html"; // Redirigir al inicio

    } catch (error) {
      alert("Error en el registro: " + error.message);
    }
  });
});


