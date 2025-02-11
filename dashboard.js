import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
  const workersTableBody = document.getElementById('workersTableBody');
  const refreshButton = document.getElementById('refreshButton');

  async function fetchWorkers() {
    const { data: fichajes, error } = await supabase
      .from('fichajes')
      .select('id, user_id, check_in, check_out, latitude, longitude, total_checkins')
      .order('check_in', { ascending: false });

    if (error) {
      console.error('Error al obtener fichajes:', error);
      return [];
    }

    const { data: users } = await supabase
      .from('socorristas')
      .select('id, name');

    return fichajes.map(fichaje => {
      const user = users?.find(u => u.id === fichaje.user_id) || {};
      return {
        id: fichaje.id,
        name: user.name || 'Desconocido',
        lastCheckIn: fichaje.check_in,
        lastCheckOut: fichaje.check_out,
        location: `${fichaje.latitude?.toFixed(4) || 0}, ${fichaje.longitude?.toFixed(4) || 0}`,
        totalCheckins: fichaje.total_checkins || 0,
        isActive: !fichaje.check_out
      };
    });
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

  refreshButton?.addEventListener('click', renderWorkers);
  await renderWorkers();
});

