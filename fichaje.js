document.addEventListener('DOMContentLoaded', async () => {
  if (!window.supabase) {
    console.error('La librería de Supabase no está cargada.');
    return;
  }

  const { createClient } = window.supabase;

  // ** Usa un entorno seguro o variable de entorno para la URL y la clave.
  const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw';  // Usa una variable de entorno real aquí

  if (!supabaseKey) {
    console.error('La clave de Supabase no está configurada.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const clockDisplay = document.getElementById('clockDisplay');
  const btnEntrada = document.getElementById('btnEntrada');
  const btnSalida = document.getElementById('btnSalida');
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  const statusMessage = document.getElementById('status');
  const nombreUsuario = document.getElementById('nombreUsuario');

  let user = null;

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

  async function getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('La geolocalización no está soportada en este navegador.');
        return;
      }
      navigator.geolocation.getCurrentPosition(position => resolve(position), error => reject(error.message));
    });
  }

  function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + (isError ? 'error' : 'active');
  }

  async function checkEntradaDelDia() {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('fichajes')
      .select('*')
      .eq('user_id', user.id)
      .eq('tipo', 'Entrada')
      .gte('check_in', `${today}T00:00:00`)
      .lte('check_in', `${today}T23:59:59`)
      .is('check_out', null);

    if (error) {
      console.error('Error al comprobar la entrada:', error);
      return false;
    }

    return data && data.length > 0;
  }

  async function checkSalidaRegistrada() {
    const { data, error } = await supabase
      .from('fichajes')
      .select('*')
      .eq('user_id', user.id)
      .eq('tipo', 'Salida')
      .is('check_out', null);

    if (error) {
      console.error('Error al comprobar salida:', error);
      return false;
    }

    return data && data.length > 0;
  }

  async function handleFichaje(tipo) {
    try {
      if (!user) {
        showStatus('Usuario no autenticado', true);
        return;
      }

      if (tipo === 'Entrada') {
        const hasEntradaHoy = await checkEntradaDelDia();
        if (hasEntradaHoy) {
          showStatus('Ya has fichado entrada hoy. Espera al día siguiente para fichar de nuevo.', true);
          return;
        }
      }

      if (tipo === 'Salida') {
        const hasSalidaRegistrada = await checkSalidaRegistrada();
        if (hasSalidaRegistrada) {
          showStatus('Salida ya registrada. No puedes registrar otra salida.', true);
          return;
        }
      }

      showStatus('Obteniendo ubicación...');

      const position = await getLocation();
      const timestamp = new Date().toISOString();

      const fichaje = {
        user_id: user.id,
        tipo,
        check_in: tipo === 'Entrada' ? timestamp : null,
        check_out: tipo === 'Salida' ? timestamp : null,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      const { error } = await supabase.from('fichajes').insert([fichaje]);

      if (error) throw error;

      showStatus(`${tipo} registrada correctamente a las ${new Date().toLocaleTimeString()}`);
      updateDashboard();

    } catch (error) {
      showStatus(`Error al registrar ${tipo.toLowerCase()}: ${error.message}`, true);
    }
  }

  btnEntrada.addEventListener('click', () => handleFichaje('Entrada'));
  btnSalida.addEventListener('click', () => handleFichaje('Salida'));

  async function updateDashboard() {
    try {
      const { data: fichajes, error } = await supabase
        .from('fichajes')
        .select('id, tipo, check_in, check_out, latitude, longitude')
        .eq('user_id', user.id)
        .order('check_in', { ascending: false })
        .limit(5);

      if (error) throw error;

      console.log(fichajes);
    } catch (error) {
      console.error('Error al obtener los fichajes:', error);
    }
  }

  btnCerrarSesion.addEventListener('click', async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error al cerrar sesión', error.message);
    }
  });
});



