function mostrarMensaje() {
  alert("¡Gracias por visitarnos! Te invitamos a recorrer nuestra historia.");
}

document.getElementById('formContacto').addEventListener('submit', function(e) {
  e.preventDefault();
  alert("Mensaje enviado correctamente. ¡Gracias por contactarnos!");
});
