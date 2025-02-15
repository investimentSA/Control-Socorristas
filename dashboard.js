import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw'; // Usa una variable de entorno real aquí
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
  const workersTableBody = document.getElementById('workersTableBody');
  const refreshButton = document.getElementById('refreshButton');

  async function fetchWorkers() {
    try {
      const { data: fichajes, error: fichajesError } = await supabase
        .from('fichajes')
        .select('id, user_id, check_in, check_out, latitude, longitude')
        .order('check_in', { ascending: false });

      if (fichajesError) throw new Error('Error al obtener fichajes.');

      const { data: users, error: usersError } = await supabase
        .from('socorristas')
        .select('id, name');

      if (usersError) throw new Error('Error al obtener socorristas.');

      const workersWithFichajes = fichajes.map(fichaje => {
        const user = users.find(u => u.id === fichaje.user_id) || {};
        return {
          id: fichaje.user_id,
          name: user.name || 'Desconocido',
          lastCheckIn: fichaje.check_in ? new Date(fichaje.check_in).toLocaleString() : '---',
          lastCheckOut: fichaje.check_out ? new Date(fichaje.check_out).toLocaleString() : '---',
          location: `${fichaje.latitude?.toFixed(4) || 0}, ${fichaje.longitude?.toFixed(4) || 0}`,
          isActive: !fichaje.check_out
        };
      });

      const workerCheckins = fichajes.reduce((acc, fichaje) => {
        const userId = fichaje.user_id;
        acc[userId] = (acc[userId] || 0) + 1;
        return acc;
      }, {});

      return workersWithFichajes.map(worker => ({
        ...worker,
        totalCheckins: workerCheckins[worker.id] || 0
      }));

    } catch (error) {
      console.error(error.message);
      showError('Error al cargar los datos. Intenta de nuevo más tarde.');
      return [];
    }
  }

  async function renderWorkers() {
    const workers = await fetchWorkers();
    workersTableBody.innerHTML = workers.length
      ? workers.map(worker => `
          <tr>
            <td><span class="status-indicator ${worker.isActive ? 'status-active' : 'status-inactive'}"></span></td>
            <td>${worker.name}</td>
            <td>${worker.lastCheckIn}</td>
            <td>${worker.lastCheckOut}</td>
            <td>${worker.location}</td>
            <td>${worker.totalCheckins}</td>
          </tr>`).join('')
      : '<tr><td colspan="6">No se han encontrado fichajes.</td></tr>';
  }

  function showError(message) {
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = message;
    document.body.appendChild(errorMessage);
    setTimeout(() => {
      errorMessage.remove();
    }, 5000);
  }

  refreshButton?.addEventListener('click', renderWorkers);
  await renderWorkers();
});


