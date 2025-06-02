// script.js
const libros = [
  {
    id: 1,
    titulo: "Cien años de soledad",
    autor: "Gabriel García Márquez",
    precio: 4500,
    imagen: "img/100anios.webp"
  },
  {
    id: 2,
    titulo: "1984",
    autor: "George Orwell",
    precio: 3900,
    imagen: "img/1984g.png"
  },
  {
    id: 3,
    titulo: "Orgullo y prejuicio",
    autor: "Jane Austen",
    precio: 4100,
    imagen: "img/orgypre.png"
  },
  {
    id: 4,
    titulo: "El Principito",
    autor: "Antoine de Saint-Exupéry",
    precio: 3700,
    imagen: "https://upload.wikimedia.org/wikipedia/en/0/05/Littleprince.JPG"
  }
];

// const contenedor = document.getElementById("libros-container");
// const contadorCarrito = document.getElementById("contador-carrito");

// function renderCatalogo() {
//   libros.forEach(libro => {
//     const div = document.createElement("div");
//     div.className = "libro";
//     div.innerHTML = `
//       <img src="${libro.imagen}" alt="${libro.titulo}" />
//       <h3>${libro.titulo}</h3>
//       <p>${libro.autor}</p>
//       <p>$${libro.precio}</p>
//       <button onclick="agregarAlCarrito(${libro.id})">Agregar al carrito</button>
//     `;
//     contenedor.appendChild(div);
//   });
// }

// function agregarAlCarrito(id) {
//   let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
//   carrito.push(id);
//   localStorage.setItem("carrito", JSON.stringify(carrito));
//   actualizarContador();
// }

// function actualizarContador() {
//   const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
//   contadorCarrito.textContent = carrito.length;
// }

// renderCatalogo();
// actualizarContador();

const contenedor = document.getElementById("libros-container");
const contadorCarrito = document.getElementById("contador-carrito");

function renderCatalogo() {
  libros.forEach(libro => {
    const div = document.createElement("div");
    div.className = "libro";
    div.innerHTML = `
      <a href="libro.html?id=${libro.id}" style="text-decoration: none; color: inherit;">
        <img src="${libro.imagen}" alt="${libro.titulo}" />
        <h3 style="color: inherit; text-decoration: none;">${libro.titulo}</h3>
      </a>
      <p>${libro.autor}</p>
      <p>$${libro.precio}</p>
      <button onclick="agregarAlCarrito(${libro.id})">Agregar al carrito</button>
    `;
    contenedor.appendChild(div);
  });
}

function agregarAlCarrito(id) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.push(id);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContador();
}

function actualizarContador() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  contadorCarrito.textContent = carrito.length;
}

renderCatalogo();
actualizarContador();
