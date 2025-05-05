// 1. Crea un sistema de gestión de tareas donde se puedan agregar, eliminar y modificar tareas.
// 2. Las tareas se almacenarán en un array de objetos, donde cada objeto representa una tarea con los siguientes atributos:
//    - `id` (número único)
//    - `nombre` (string)
//    - `completado` (booleano)
// 3. Verifica si una tarea existe y si está completa por id.
// 4. El sistema debe tener funciones para agregar tareas, marcar tareas como completadas, y eliminar tareas por id.
// 5. Desarrollar una función para mostrar todas las tareas, y que se pueda filtrar si están completadas o no.


let tareas= []

class Tarea {
    constructor(id, nombre, completado=false) {
        id=this.id
        nombre=this.nombre
    }
    completarTarea() {
        this.completado=true
    }
}

//ahora creo el sistema 
function agregarTarea(lista) {
    const id=prompt("Ingrese el ID de la tarea: ")
    const nombre=prompt("Ingrese el nombre de la tarea: ")
    lista.push(Tarea(id, nombre))
}

function eliminarTarea(lista) {
    const id= prompt("Ingrese el ID de la tarea a eliminar: ")
    let indiceElemento= lista.findIndex(elementoLista => elementoLista.id==id)
    lista.splice(indiceElemento,1)
}

function modificarTarea(lista) {
    const id= prompt("Ingrese el ID de la tarea a eliminar: ")
    lista[id].completado=true
}

let listaTareas= []

agregarTarea(listaTareas)
eliminarTarea(listaTareas)
modificarTarea(listaTareas)

console.log(listaTareas)

