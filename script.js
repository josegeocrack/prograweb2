// script.js

document.addEventListener('DOMContentLoaded', () => {
  const botones = document.querySelectorAll('.agregar');

  botones.forEach(boton => {
    boton.addEventListener('click', () => {
      const nombre = boton.getAttribute('data-nombre');
      const precio = parseFloat(boton.getAttribute('data-precio'));

      let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
      carrito.push({ nombre, precio });
      localStorage.setItem('carrito', JSON.stringify(carrito));
      alert(`${nombre} agregado al carrito.`);
    });
  });

  const lista = document.getElementById('listaCarrito');
  if (lista) {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.forEach((item, index) => {
      const li = document.createElement('li');
      li.textContent = `${item.nombre} - $${item.precio}`;
      const btn = document.createElement('button');
      btn.textContent = 'Eliminar';
      btn.onclick = () => {
        carrito.splice(index, 1);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        location.reload();
      };
      li.appendChild(btn);
      lista.appendChild(li);
    });
  }
});