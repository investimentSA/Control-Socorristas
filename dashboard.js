import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
  const workersTableBody = document.getElementById('workersTableBody');
  const refreshButton = document.getElementById('refreshButton');

  async function fetchWorkers() {
    // Obtener los fichajes
    const { data: fichajes, error: fichajesError } = await supabase
      .from('fichajes')
      .select('id, user_id, check_in, check_out, latitude, longitude')
      .order('check_in', { ascending: false });

    if (fichajesError) {
      console.error('Error al obtener fichajes:', fichajesError);
      return [];
    }

    // Obtener todos los socorristas
    const { data: users, error: usersError } = await supabase
      .from('socorristas')
      .select('id, name');

    if (usersError) {
      console.error('Error al obtener socorristas:', usersError);
      return [];
    }

    // Crear una lista de socorristas con fichajes
    const workersWithFichajes = fichajes.map(fichaje => {
      const user = users.find(u => u.id === fichaje.user_id) || {};
      return {
        id: fichaje.id,
        name: user.name || 'Desconocido',
        lastCheckIn: fichaje.check_in,
        lastCheckOut: fichaje.check_out,
        location: `${fichaje.latitude?.toFixed(4) || 0}, ${fichaje.longitude?.toFixed(4) || 0}`,
        isActive: !fichaje.check_out
      };
    });

    // Para obtener el total de fichajes de cada trabajador
    const workerCheckins = {};

    // Contar el total de fichajes por trabajador
    fichajes.forEach(fichaje => {
      const userId = fichaje.user_id;
      workerCheckins[userId] = (workerCheckins[userId] || 0) + 1;
    });

    // Incluir el total de fichajes en cada trabajador
    return workersWithFichajes.map(worker => ({
      ...worker,
      totalCheckins: workerCheckins[worker.id] || 0
    }));
  }

  async function renderWorkers() {
    const workers = await fetchWorkers();
    workersTableBody.innerHTML = workers.length
      ? workers.map(worker => `
          <tr>
            <td><span class="status-indicator ${worker.isActive ? 'status-active' : 'status-inactive'}"></span></td>
            <td>${worker.name}</td>
            <td>${worker.lastCheckIn || '---'}</td>
            <td>${worker.lastCheckOut || '---'}</td>
            <td>${worker.location}</td>
            <td>${worker.totalCheckins}</td>
          </tr>`).join('')
      : '<tr><td colspan="6">No se han encontrado fichajes.</td></tr>';
  }

  // Refrescar los datos cuando el botón es clickeado
  refreshButton?.addEventListener('click', renderWorkers);

  // Llamar a la función para renderizar los trabajadores al cargar la página
  await renderWorkers();
});

