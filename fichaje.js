document.addEventListener('DOMContentLoaded', () => {
  const clockDisplay = document.getElementById('clockDisplay');
  const btnEntrada = document.getElementById('btnEntrada');
  const btnSalida = document.getElementById('btnSalida');
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  const statusMessage = document.getElementById('status');

  // Actualizar reloj
  function updateClock() {
    const now = new Date();
    clockDisplay.textContent = now.toLocaleTimeString();
  }
  
  setInterval(updateClock, 1000);
  updateClock();

  // Función para obtener la ubicación
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

  // Función para mostrar mensajes de estado
  function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + (isError ? 'error' : 'active');
  }

  // Manejar fichaje
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

      // Aquí se enviaría la información al servidor
      console.log('Fichaje registrado:', fichaje);
      
      showStatus(`${tipo} registrada correctamente a las ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      showStatus(`Error al registrar ${tipo.toLowerCase()}: ${error}`, true);
    }
  }

  btnEntrada.addEventListener('click', () => handleFichaje('Entrada'));
  btnSalida.addEventListener('click', () => handleFichaje('Salida'));
  
  btnCerrarSesion.addEventListener('click', () => {
    // Aquí iría la lógica de cierre de sesión
    window.location.href = 'index.html';
  });

  // Mostrar nombre del usuario (se obtendría de la sesión actual)
  const nombreUsuario = document.getElementById('nombreUsuario');
  // Simular nombre de usuario - en producción vendría de la sesión
  nombreUsuario.textContent = 'Juan Pérez';
});