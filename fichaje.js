import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

document.addEventListener('DOMContentLoaded', async () => {
  const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw';  // ⚠️ NO expongas esta clave en producción
  const supabase = createClient(supabaseUrl, supabaseKey);  // ✅ Ahora está bien inicializado

  // Referencias a los elementos del DOM
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

  function updateClock() {
    clockDisplay.textContent = new Date().toLocaleTimeString();
  }
  setInterval(updateClock, 1000);
  updateClock();

  async function getLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, err => reject(err.message));
    });
  }

  async function handleFichaje(tipo) {
    try {
      if (!user) {
        statusMessage.textContent = 'Usuario no autenticado';
        return;
      }

      statusMessage.textContent = 'Obteniendo ubicación...';
      const position = await getLocation();
      const { latitude, longitude } = position.coords;

      const { error } = await supabase
        .from('fichajes')
        .insert([{ user_id: user.id, tipo, timestamp: new Date().toISOString(), latitude, longitude }]);

      if (error) throw error;

      statusMessage.textContent = `${tipo} registrada correctamente.`;
    } catch (error) {
      statusMessage.textContent = `Error al registrar ${tipo}: ${error.message}`;
    }
  }

  btnEntrada?.addEventListener('click', () => handleFichaje('Entrada'));
  btnSalida?.addEventListener('click', () => handleFichaje('Salida'));

  btnCerrarSesion?.addEventListener('click', async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error al cerrar sesión', error.message);
    }
  });
});



