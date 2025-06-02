
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registroForm = document.getElementById('registro-form');
  const userStatus = document.getElementById('user-status');

  const mostrarRegistro = () => {
    loginForm.style.display = 'none';
    registroForm.style.display = 'block';
  };
  window.mostrarRegistro = mostrarRegistro;

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const username = localStorage.getItem('username');
    if (username) {
      userStatus.innerText = 'Bienvenidx @' + username;
      loginForm.style.display = 'none';
    } else {
      alert('Usuario no registrado. Registrate primero.');
    }
  });

  registroForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('nuevo-usuario').value;
    localStorage.setItem('username', username);
    userStatus.innerText = 'Bienvenidx @' + username;
    registroForm.style.display = 'none';
  });

  const savedUser = localStorage.getItem('username');
  if (savedUser) {
    userStatus.innerText = 'Bienvenidx @' + savedUser;
    loginForm.style.display = 'none';
  }
});
