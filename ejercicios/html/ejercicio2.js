const lista=[]

function agregar() {
    nombre=document.getElementById("nombre").value;
    lista.push(nombre);

    document.getElementById("nombre").value="";

    mostrar();

}


function borrarTodo() {
    lista.length=0;
    mostrar();
}

// function mostrar() {
//     const ul = document.getElementById("listaNombres");
//     ul.innerHTML ="";

//     lista.forEach((item) => {
//         ul.innerHTML+=
//         `<li>${item}</li>`;
//     });

// }

function mostrar() {
        const ul = document.getElementById("listaNombres");
        ul.innerHTML ="";

        
        lista.forEach((item) => {
            const li=document.createElement("li")
            li.textContent = item
            ul.appendChild(li)
        });
    
    }
