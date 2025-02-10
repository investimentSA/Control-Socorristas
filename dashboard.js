import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'TU_SUPABASE_URL';
const supabaseKey = 'TU_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
  const workersTableBody = document.getElementById('workersTableBody');
  const sortBySelect = document.getElementById('sortBy');
  const refreshButton = document.getElementById('refreshButton');

  async function fetchWorkers() {
    const { data: fichajes, error } = await supabase
      .from('fichajes')
      .select('id, user_id, check_in, check_out, location, total_checkins');

    if (error) {
      console.error('Error al obtener fichajes:', error);
      return [];
    }

    const { data: users, error: userError } = await supabase
      .from('socorristas')
      .select('id, name');

    if (userError) {
      console.error('Error al obtener usuarios:', userError);
      return [];
    }

    return fichajes.map(fichaje => {
      const user = users.find(u => u.id === fichaje.user_id) || {};
      return {
        id: fichaje.id,
        name: user.name || 'Desconocido',
        lastCheckIn: fichaje.check_in,
        lastCheckOut: fichaje.check_out,
        location: fichaje.location || { lat: 0, lng: 0 },
        totalCheckins: fichaje.total_checkins || 0,
        isActive: !fichaje.check_out,
        recentAction: true,
      };
    });
  }

  function formatDateTime(dateString) {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatLocation(location) {
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  }

  async function renderWorkers() {
    const workers = await fetchWorkers();
    workersTableBody.innerHTML = '';

    workers.forEach(worker => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <span class="status-indicator ${worker.isActive ? 'status-active' : 'status-inactive'}"></span>
        </td>
        <td>${worker.name}</td>
        <td>${formatDateTime(worker.lastCheckIn)}</td>
        <td>${formatDateTime(worker.lastCheckOut)}</td>
        <td>${formatLocation(worker.location)}</td>
        <td>${worker.totalCheckins}</td>
      `;
      workersTableBody.appendChild(row);
    });
  }

  refreshButton.addEventListener('click', async () => {
    refreshButton.disabled = true;
    await renderWorkers();
    refreshButton.disabled = false;
  });

  await renderWorkers();
});
