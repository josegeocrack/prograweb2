const lista = [];

function agregar() {
  const nombre = document.getElementById("nombre").value;
  const cantidad = document.getElementById("cantidad").value;

  lista.push({ nombre, cantidad });

  document.getElementById("nombre").value = "";
  document.getElementById("cantidad").value = "";

  mostrar();
}

function eliminar(indice) {
  lista.splice(indice, 1);
  mostrar();
}

function mostrar() {
  const ul = document.getElementById("lista");
  ul.innerHTML = "";
  lista.forEach((item, index) => {
    ul.innerHTML += `
      <li>${item.nombre}: ${item.cantidad}
        <button onclick="eliminar(${index})">Eliminar</button>
      </li>
    `;
  });
}
