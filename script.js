// document.addEventListener('DOMContentLoaded', () => {
//   const botones = document.querySelectorAll('.agregar');

//   botones.forEach(boton => {
//     boton.addEventListener('click', () => {
//       const nombre = boton.getAttribute('data-nombre');
//       const precio = parseFloat(boton.getAttribute('data-precio'));

//       let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
//       carrito.push({ nombre, precio });
//       localStorage.setItem('carrito', JSON.stringify(carrito));
//       alert(`${nombre} agregado al carrito.`);
//     });
//   });

//   const lista = document.getElementById('listaCarrito');
//   if (lista) {
//     const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
//     carrito.forEach((item, index) => {
//       const li = document.createElement('li');
//       li.textContent = `${item.nombre} - $${item.precio}`;
//       const btn = document.createElement('button');
//       btn.textContent = 'Eliminar';
//       btn.onclick = () => {
//         carrito.splice(index, 1);
//         localStorage.setItem('carrito', JSON.stringify(carrito));
//         location.reload();
//       };
//       li.appendChild(btn);
//       lista.appendChild(li);
//     });
//   }
// });

const dataProductos = {
  toros: [
    { nombre: "Toro Angus", precio: 3500, img: "img/tangus.jpg" },
    { nombre: "Toro Brangus", precio: 3600, img: "img/tbrangus.jpeg" },
    { nombre: "Toro Hereford", precio: 3400, img: "img/thereford.jpg" }
  ],
  vacas: [
    { nombre: "Vaca Hereford", precio: 2900, img: "img/vhereford.jpg" },
    { nombre: "Vaca Angus", precio: 3100, img: "img/vangus.jpg" },
    { nombre: "Vaca Brangus", precio: 3200, img: "img/vbrangus.webp" }
  ],
  terneros: [
    { nombre: "Ternero Brangus", precio: 1800, img: "img/tebrangus.jpg" },
    { nombre: "Ternero Angus", precio: 1900, img: "img/teangus.jpg" },
    { nombre: "Ternero Hereford", precio: 1750, img: "img/tehereford.jpg" }
  ]
};

function cargarProductos(tipo) {
  const contenedor = document.getElementById(`lista-${tipo}`);
  if (!contenedor) return;

  contenedor.innerHTML = '';
  const filtro = document.getElementById('filtroPrecio')?.value || 'todos';

  let productos = [...dataProductos[tipo]];
  if (filtro.startsWith('<')) {
    const valor = parseInt(filtro.slice(1));
    productos = productos.filter(p => p.precio < valor);
  } else if (filtro.startsWith('>')) {
    const valor = parseInt(filtro.slice(1));
    productos = productos.filter(p => p.precio > valor);
  }

  productos.forEach(p => {
    const card = document.createElement('div');
    card.className = 'producto-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}" />
      <h3>${p.nombre}</h3>
      <p>$${p.precio}</p>
      <button class="agregar" data-nombre="${p.nombre}" data-precio="${p.precio}">Agregar al carrito</button>
    `;
    contenedor.appendChild(card);
  });

  conectarBotones();
}

function conectarBotones() {
  const botones = document.querySelectorAll('.agregar');

  botones.forEach(boton => {
    boton.addEventListener('click', () => {
      const nombre = boton.getAttribute('data-nombre');
      const precio = parseFloat(boton.getAttribute('data-precio'));

      let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
      carrito.push({ nombre, precio });
      localStorage.setItem('carrito', JSON.stringify(carrito));

      // Mensaje visual
      const mensaje = document.createElement('div');
      mensaje.textContent = `${nombre} agregado al carrito`;
      mensaje.className = 'mensaje-carrito';
      document.body.appendChild(mensaje);
      setTimeout(() => mensaje.remove(), 2000);
    });
  });
}

function filtrarProductos(tipo) {
  cargarProductos(tipo);
}

document.addEventListener('DOMContentLoaded', () => {
  // Carga inicial de productos si corresponde
  ['toros', 'vacas', 'terneros'].forEach(tipo => {
    if (document.getElementById(`lista-${tipo}`)) {
      cargarProductos(tipo);
    }
  });

  // Mostrar carrito si estamos en esa página
  const lista = document.getElementById('listaCarrito');
  if (lista) {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let total = 0;
    carrito.forEach((item, index) => {
      total += item.precio;
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

    const totalItem = document.createElement('li');
    totalItem.style.marginTop = '1rem';
    totalItem.style.fontWeight = 'bold';
    totalItem.textContent = `Total: $${total}`;
    lista.appendChild(totalItem);
  }
});

