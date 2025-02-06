document.addEventListener('DOMContentLoaded', async () => {

  // Asegúrate de que la librería de Supabase esté disponible
  const { createClient } = window.supabase;

  // Configuración de Supabase
  const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co'; // Cambia por tu URL real de Supabase
  const supabaseKey = 'tu-api-key-de-supabase'; // Cambia por tu clave API de Supabase

  // Inicializar el cliente de Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Referencias a los elementos del DOM
  const clockDisplay = document.getElementById('clockDisplay');
  const btnEntrada = document.getElementById('btnEntrada');
  const btnSalida = document.getElementById('btnSalida');
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  const statusMessage = document.getElementById('status');
  const nombreUsuario = document.getElementById('nombreUsuario');

  // ✅ Obtener el usuario autenticado desde Supabase
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    // Si no hay usuario autenticado, redirigir a la página de inicio
    window.location.href = 'index.html';
    return;
  }

  // Mostrar el correo del usuario en la UI
  nombreUsuario.textContent = user.email;

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
