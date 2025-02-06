document.getElementById('registroForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const nombreCompleto = document.getElementById('nombreCompleto').value;
  
  // Validación básica
  if (nombreCompleto.trim()) {
    if (nombreCompleto.split(' ').length >= 2) {
      // Aquí se procesaría el nombre y se continuaría con el registro
      console.log('Nombre registrado:', nombreCompleto);
      alert('¡Nombre registrado correctamente!');
      // Aquí se podría redirigir a la siguiente página del proceso de registro
    } else {
      alert('Por favor, ingrese nombre y apellido');
    }
  } else {
    alert('Por favor, ingrese su nombre completo');
  }
});