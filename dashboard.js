document.addEventListener('DOMContentLoaded', () => {
  // Datos de ejemplo para simular trabajadores
  let workers = [
    {
      id: 1,
      name: "Juan Pérez",
      lastCheckIn: "2024-01-20T08:00:00",
      lastCheckOut: "2024-01-20T16:00:00",
      location: { lat: 40.4168, lng: -3.7038 },
      totalCheckins: 45,
      isActive: true,
      recentAction: true
    },
    {
      id: 2,
      name: "Ana García",
      lastCheckIn: "2024-01-20T09:15:00",
      lastCheckOut: null,
      location: { lat: 40.4169, lng: -3.7039 },
      totalCheckins: 38,
      isActive: true,
      recentAction: false
    }
  ];

  const workersTableBody = document.getElementById('workersTableBody');
  const sortBySelect = document.getElementById('sortBy');
  const refreshButton = document.getElementById('refreshButton');
  
  function updateStats() {
    document.getElementById('totalWorkers').textContent = workers.length;
    document.getElementById('activeWorkers').textContent = 
      workers.filter(w => w.isActive).length;
    document.getElementById('totalCheckins').textContent = 
      workers.reduce((acc, w) => acc + w.totalCheckins, 0);
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

  function renderWorkers() {
    workersTableBody.innerHTML = '';
    
    workers.forEach(worker => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <span class="status-indicator ${worker.isActive ? 'status-active' : 'status-inactive'} 
            ${worker.recentAction ? 'recent-action' : ''}"></span>
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

  function sortWorkers(criteria) {
    switch(criteria) {
      case 'name':
        workers.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'lastCheckIn':
        workers.sort((a, b) => new Date(b.lastCheckIn) - new Date(a.lastCheckIn));
        break;
      case 'lastCheckOut':
        workers.sort((a, b) => {
          if (!a.lastCheckOut) return 1;
          if (!b.lastCheckOut) return -1;
          return new Date(b.lastCheckOut) - new Date(a.lastCheckOut);
        });
        break;
    }
    renderWorkers();
  }

  // Event Listeners
  sortBySelect.addEventListener('change', (e) => {
    sortWorkers(e.target.value);
  });

  refreshButton.addEventListener('click', () => {
    // Simular actualización de datos
    const refreshAnimation = document.querySelector('.mdi-refresh');
    refreshAnimation.style.animation = 'rotate 1s linear';
    
    // Simular nueva entrada/salida
    const randomWorker = workers[Math.floor(Math.random() * workers.length)];
    randomWorker.recentAction = true;
    randomWorker.lastCheckIn = new Date().toISOString();
    randomWorker.totalCheckins++;

    setTimeout(() => {
      refreshAnimation.style.animation = '';
      renderWorkers();
      updateStats();
    }, 1000);
  });

  // Inicialización
  sortWorkers('name');
  updateStats();
});