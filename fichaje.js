document.addEventListener('DOMContentLoaded', async () => {
  // Asegúrate de que la librería de Supabase esté disponible
  if (!window.supabase) {
    console.error('La librería de Supabase no está cargada.');
    return;
  }

  const { createClient } = window.supabase;

  // Configuración de Supabase
  const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co'; // URL de tu Supabase
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw'; // **Aquí está tu clave API**

  if (!supabaseKey) {
    console.error('La clave de Supabase no está configurada.');
    return;
  }

  // Inicializar el cliente de Supabase con la URL y la clave API
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Referencias a los elementos del DOM
  const clockDisplay = document.getElementById('clockDisplay');
  const btnEntrada = document.getElementById('btnEntrada');
  const btnSalida = document.getElementById('btnSalida');
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  const statusMessage = document.getElementById('status');
  const nombreUsuario = document.getElementById('nombreUsuario');

  let user = null;

  // Obtener el usuario autenticado desde Supabase
  try {
    const { data: { user: authenticatedUser }, error } = await supabase.auth.getUser();

    if (error || !authenticatedUser) {
      window.location.href = 'index.html';
      return;
    }

    user = authenticatedUser;
    nombreUsuario.textContent = user.email;

  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    window.location.href = 'index.html';
    return;
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
        reject('La geolocalización no está soportada en este navegador.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error.message)
      );
    });
  }

  // Función para mostrar mensajes en pantalla
  function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + (isError ? 'error' : 'active');
  }

  // Función para comprobar si el usuario ya tiene un fichaje de ese tipo (entrada/salida)
  async function checkExistingFichaje(tipo) {
    const { data, error } = await supabase
      .from('fichajes')
      .select('*')
      .eq('user_id', user.id)
      .eq('tipo', tipo)
      .is('check_out', null) // Para fichajes de entrada sin salida
      .limit(1); // Limitar a solo 1 resultado

    if (error) {
      console.error('Error al comprobar fichaje:', error);
      return false;
    }

    // Si se encuentra un fichaje, devolver 'true'
    return data && data.length > 0;
  }

  // Función para registrar el fichaje en Supabase
  async function handleFichaje(tipo) {
    try {
      if (!user) {
        showStatus('Usuario no autenticado', true);
        return;
      }

      // Verificar si el usuario ya tiene un fichaje de ese tipo (entrada/salida) sin salida registrada
      const existing = await checkExistingFichaje(tipo);
      if (existing) {
        showStatus(`${tipo} ya registrada. No puedes registrar otro ${tipo.toLowerCase()}.`, true);
        return;
      }

      showStatus('Obteniendo ubicación...');

      // Obtener la ubicación
      const position = await getLocation();

      const timestamp = new Date().toISOString();

      // Crear el objeto de fichaje
      const fichaje = {
        user_id: user.id,
        tipo,
        check_in: tipo === 'Entrada' ? timestamp : null, // Si es entrada, registramos la hora de entrada
        check_out: tipo === 'Salida' ? timestamp : null, // Si es salida, registramos la hora de salida
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      // Insertar el fichaje en Supabase
      const { error } = await supabase
        .from('fichajes')
        .insert([fichaje]);

      if (error) throw error;

      // Mostrar mensaje de éxito
      showStatus(`${tipo} registrada correctamente a las ${new Date().toLocaleTimeString()}`);

      // Actualizar el dashboard (función para actualizar la vista)
      updateDashboard();

    } catch (error) {
      showStatus(`Error al registrar ${tipo.toLowerCase()}: ${error.message}`, true);
    }
  }

  // Evento de fichaje de entrada
  btnEntrada.addEventListener('click', () => handleFichaje('Entrada'));

  // Evento de fichaje de salida
  btnSalida.addEventListener('click', () => handleFichaje('Salida'));

  // Función para actualizar el dashboard con los nuevos fichajes
  async function updateDashboard() {
    try {
      const { data: fichajes, error } = await supabase
        .from('fichajes')
        .select('id, tipo, check_in, check_out, latitude, longitude')
        .eq('user_id', user.id)
        .order('check_in', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Actualizar el dashboard con los últimos fichajes
      console.log(fichajes);  // Aquí podrías actualizar la UI con los datos obtenidos.
    } catch (error) {
      console.error('Error al obtener los fichajes:', error);
    }
  }

  // Evento de cierre de sesión
  btnCerrarSesion.addEventListener('click', async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error al cerrar sesión', error.message);
    }
  });
});

