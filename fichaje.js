document.addEventListener('DOMContentLoaded', async () => {
  // Obtener createClient desde window.supabase
  const { createClient } = window.supabase;

  // Configuración de Supabase
  const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co'; // Cambia por tu URL real
  const supabaseKey = 'tu-api-key-de-supabase'; // Cambia por tu clave API
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Referencias a elementos del DOM
  const clockDisplay = document.getElementById('clockDisplay');
  const btnEntrada = document.getElementById('btnEntrada');
  const btnSalida = document.getElementById('btnSalida');
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  const statusMessage = document.getElementById('status');
  const nombreUsuario = document.getElementById('nombreUsuario');

  // ✅ Obtener el usuario autenticado en Supabase
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    window.location.href = 'index.html'; // 🔄 Redirigir si no hay usuario
    return;
  }

  // Mostrar el correo del usuario en la UI
  nombreUsuario.textContent = user.email;

  // ⏰ Función para actualizar el reloj
  function updateClock() {
    const now = new Date();
    clockDisplay.textContent = now.toLocaleTimeString();
  }

  setInterval(updateClock, 1000);
  updateClock();

  // 📍 Función para obtener ubicación
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

  // ✅ Función para registrar fichaje en Supabase
  async function handleFichaje(tipo) {
    try {
      showStatus('Obteniendo ubicación...');
      const position = await getLocation();

      const timestamp = new Date().toISOString();
      const fichaje = {
        usuario_id: user.id, // ID del usuario autenticado
        tipo,
        timestamp,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      // 📤 Enviar datos a Supabase
      const { error } = await supabase
        .from('fichajes') // Asegúrate de que esta tabla existe en tu BD
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
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error al cerrar sesión', error.message);
    }
  });
});
