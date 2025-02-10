import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://lgvmxoamdxbhtmicawlv.supabase.co';
// Asegúrate de no dejar la clave API en el código fuente para producción
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm14b2FtZHhiaHRtaWNhd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjA0NDIsImV4cCI6MjA1NDIzNjQ0Mn0.0HpIAqpg3gPOAe714dAJPkWF8y8nQBOK7_zf_76HFKw';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
  const workersTableBody = document.getElementById('workersTableBody');
  const sortBySelect = document.getElementById('sortBy');
  const refreshButton = document.getElementById('refreshButton');

  // Función para obtener los datos de los fichajes
  async function fetchWorkers() {
    const { data: fichajes, error } = await supabase
      .from('fichajes')
      .select('id, user_id, check_in, check_out, location, total_checkins')
      .order('check_in', { ascending: false }); // Ordenar por fecha de entrada

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
        isActive: !fichaje.check_out, // Si no hay check-out, está activo
        recentAction: true,
      };
    });
  }

  // Función para formatear la fecha y hora
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

  // Función para formatear la ubicación
  function formatLocation(location) {
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  }

  // Función para renderizar la tabla de trabajadores
  async function renderWorkers() {
    const workers = await fetchWorkers();
    workersTableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

    if (workers.length === 0) {
      workersTableBody.innerHTML = '<tr><td colspan="6">No se han encontrado fichajes.</td></tr>';
      return;
    }

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

  // Evento para refrescar los datos de los fichajes
  refreshButton.addEventListener('click', async () => {
    refreshButton.disabled = true; // Deshabilitar el botón mientras se actualizan los datos
    await renderWorkers();
    refreshButton.disabled = false; // Habilitar el botón después de la actualización
  });

  // Cargar los datos de los fichajes al cargar la página
  await renderWorkers();
});
