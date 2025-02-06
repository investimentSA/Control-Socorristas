document.addEventListener('DOMContentLoaded', async () => {
  // Asegúrate de que la librería de Supabase esté disponible
  if (!window.supabase) {
    console.error('La librería de Supabase no está cargada.');
    return;  // Salir si Supabase no está disponible
  }

  const { createClient } = window.supabase;

  // Configuración de Supabase (evita dejar la clave directamente en el código)
  const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co'; // Tu URL de Supabase
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw'; // Usar una variable de entorno o una forma más segura

  // Inicializar el cliente de Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Referencias a los elementos del DOM
  const clockDisplay = document.getElementById('clockDisplay');
  const btnEntrada = document.getElementById('btnEntrada');
  const btnSalida = document.getElementById('btnSalida');
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  const statusMessage = document.getElementById('status');
  const nombreUsuario = document.getElementById('nombreUsuario');

  // Verificar si los elementos del DOM existen antes de añadir eventos
  if (!btnEntrada || !btnSalida || !btnCerrarSesion) {
    console.error('Algunos botones no están presentes en el DOM.');
    return;  // Salir si no se encuentran los botones
  }

  // ✅ Obtener el usuario autenticado desde Supabase
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      // Si no hay usuario autenticado, redirigir a la página de inicio
      window.location.href = 'index.html';
      return;
    }

    // Mostrar el correo del usuario en la UI
    nombreUsuario.textContent = user.email;

  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    window.location.href = 'index.html';  // Redirigir si hay un error
    return;
  }

  // ⏰ Función para actualizar el reloj en la UI
  function updateClock() {
    const now = new Date();
    clockDisplay.textContent = now.toLocaleTimeString();
  }

  // Actualizar el reloj cada segundo
  setInterval(updateClock, 1000);
  updateClock();

  // 📍 Función para obtener la ubicación del usuario
  async function getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('La geolocalización no está soportada en este navegador.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error.message)
      );
    });
  }

  // 📢 Función para mostrar mensajes en pantalla
  function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + (isError ? 'error' : 'active');
  }

  // ✅ Función para registrar el fichaje en Supabase
  async function handleFichaje(tipo) {
    try {
      showStatus('Obteniendo ubicación...');

      // Obtener la ubicación
      const position = await getLocation();

      const timestamp = new Date().toISOString();

      // Crear el objeto de fichaje
      const fichaje = {
        usuario_id: user.id, // ID del usuario autenticado
        tipo,
        timestamp,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      // 📤 Enviar los datos a Supabase
      const { error } = await supabase
        .from('fichajes') // Asegúrate de que esta tabla exista en tu base de datos
        .insert(fichaje);

      if (error) throw error;

      showStatus(`${tipo} registrada correctamente a las ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      showStatus(`Error al registrar ${tipo.toLowerCase()}: ${error.message}`, true);
    }
  }

  // 🎯 Eventos de fichaje
  btnEntrada.addEventListener('click', () => handleFichaje('Entrada'));
  btnSalida.addEventListener('click', () => handleFichaje('Salida'));

  // 🔴 Cierre de sesión
  btnCerrarSesion.addEventListener('click', async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = 'index.html'; // Redirigir a la página de inicio
    } catch (error) {
      console.error('Error al cerrar sesión', error.message);
    }
  });
});
