// 1. Crea un sistema de gestión de tareas donde se puedan agregar, eliminar y modificar tareas.
// 2. Las tareas se almacenarán en un array de objetos, donde cada objeto representa una tarea con los siguientes atributos:
//    - `id` (número único)
//    - `nombre` (string)
//    - `completado` (booleano)
// 3. Verifica si una tarea existe y si está completa por id.
// 4. El sistema debe tener funciones para agreganor tareas, marcar tareas como completadas, y eliminar tareas por id.
// 5. Desarrollar una función para mostrar todas las tareas, y que se pueda filtrar si están completadas o no.

// var student = {                 // object name
//     firstName:"Jane",           // list of properties and values
//     lastName:"Doe",
//     age:18,
//     height:170,
//     fullName : function() {     // object function
//        return this.firstName + " " + this.lastName;
//     }
//     }; 
//     student.age = 19;           // setting value
//     student[age]++;             // incrementing
//     name = student.fullName();  // call object function


class Tarea {
    static lista_ids= new Set(); //con esto chequeas si 

    constructor(nombre, completado=false) {
        
        
       function crearId() {
            let id= Math.floor(Math.random() * 1000)
            while (lista_ids.has(id)) {
                id=Math.floor(Math.random() * 1000)
            }
        }

        this.id= crearId()
        Tarea.lista_ids.add(id);

        this.nombre=nombre
        this.completado=completado;
    }
};

class sistema {
    constructor(nombre) {
        let tareas=[];
        this.tareas =tareas;
    }
    agregarTarea() {
        const nombre = prompt("Ingresar el nombre de la tarea: ")
        const tareaCreada = new Tarea(nombre);
    }

    eliminarTarea() {
        let id = prompt("Ingresar el ID de la tarea: ")
        id= parseFloat(id)

        let ind= this.tareas.findIndex(tarea => tarea.id == id)

        this.tareas.slice(ind, 1)
    }

    modificarTarea() {

    }
    }