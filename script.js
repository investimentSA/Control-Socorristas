

document.addEventListener('DOMContentLoaded', async () => {
  // Asegurarnos de que la librería de Supabase esté cargada correctamente
  if (!window.supabase) {
    console.error('Error: Supabase no está disponible');
    return;
  }

  // Referencias a los elementos del DOM
  const clockDisplay = document.getElementById('clockDisplay');
  const btnEntrada = document.getElementById('btnEntrada');
  const btnSalida = document.getElementById('btnSalida');
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  const statusMessage = document.getElementById('status');
  const nombreUsuario = document.getElementById('nombreUsuario');

// Configuración de Supabase (asegúrate de declararlo solo una vez)
const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co';  // URL de tu Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw';  // Tu API Key de Supabase

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

