document.addEventListener('DOMContentLoaded', async () => {
  // Referencias a los elementos del DOM
  const clockDisplay = document.getElementById('clockDisplay');
  const btnEntrada = document.getElementById('btnEntrada');
  const btnSalida = document.getElementById('btnSalida');
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  const statusMessage = document.getElementById('status');
  const nombreUsuario = document.getElementById('nombreUsuario');

  // Configuración de Supabase
  const supabaseUrl = 'https://tu-url-de-supabase.supabase.co';  // Cambiar por tu URL de Supabase
  const supabaseKey = 'tu-api-key-de-supabase';  // Cambiar por tu clave de API de Supabase
  const supabase = supabase.createClient(supabaseUrl, supabaseKey);

  // Verificar si el usuario está autenticado
  const user = supabase.auth.user();
  if (user) {
    // Mostrar nombre del usuario
    nombreUsuario.textContent = user.email;
  } else {
    // Redirigir al inicio si no hay usuario autenticado
    window.location.href = 'index.html';
  }

  // Función para actualizar el reloj
  function updateClock() {
    const now = new Date();
    clockDisplay.textContent = now.toLocaleTimeString();
  }

  setInterval(updateClock, 1000);
  updateClock();

  // Función para obtener la ubicación del usuario
  async function getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('La geolocalización no está soportada por este navegador.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error.message)
      );
    });
  }

  // Función para mostrar los mensajes de estado
  function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + (isError ? 'error' : 'active');
  }

  // Función para manejar el fichaje (entrada/salida)
  async function handleFichaje(tipo) {
    try {
      showStatus('Obteniendo ubicación...');
      const position = await getLocation();

      const timestamp = new Date().toISOString();
      const fichaje = {
        tipo,
        timestamp,
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      };

      // Aquí se enviaría la información al servidor (puedes integrar esto con Supabase para guardarlo en la base de datos)
      console.log('Fichaje registrado:', fichaje);

      showStatus(`${tipo} registrada correctamente a las ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      showStatus(`Error al registrar ${tipo.toLowerCase()}: ${error}`, true);
    }
  }

  // Eventos de los botones de fichaje
  btnEntrada.addEventListener('click', () => handleFichaje('Entrada'));
  btnSalida.addEventListener('click', () => handleFichaje('Salida'));

  // Lógica de cierre de sesión
  btnCerrarSesion.addEventListener('click', async () => {
    try {
      await supabase.auth.signOut();  // Cerrar sesión con Supabase
      window.location.href = 'index.html';  // Redirigir a la página de inicio
    } catch (error) {
      console.error('Error al cerrar sesión', error.message);
    }
  });
});
