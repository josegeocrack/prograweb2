/*
Javascript: variables, tipos de datos (variable, constante, array, objeto), array de objetos, operadores logicos(&& ||), aritmeticos(<>) y matematicos(+-* /), parseo de datos,thurty y flasy
*/

let nombre ="Esteban";
var edad = 32;


// camelCase
let nombreAlumno = "Manuel"

const PI = 3.14
//PI = 4

// ARRAY (LISTA)
const NUMEROS = [1,2,3,4,5]
console.log(NUMEROS[0]) //print de python
NUMEROS.push("HOLA") // append
console.log(NUMEROS)
NUMEROS.pop()
NUMEROS.shift()//remueve el primero
NUMEROS.unshift("Javier")

// Objeto Literal

let profesor = {
    nombre: "Esteban", //propiedad
    edad : 32,
    profesor : true,
    cumplirAnios : function (){ //metodo
        this.edad = this.edad +1
    }
}

console.log(profesor.nombre)
console.log(profesor.cumplirAnios())

// Array de objetos literales


let productos = [
    {nombre:"crema",precio:100},
    {nombre:"shampoo",precio:50},
    {nombre:"enguaje",precio:75,stock:false}
]

console.log( productos[0].nombre )

/******************************************/


console.log ( 3 > 1 && 2 > 1)
// AND - &&
console.log ( 3 > 1 || 2 > 1)
// OR - || 

console.log ( 1 && 3)
console.log(1 || 3)

const ARRAY1 = [1]
console.log(ARRAY1[2])

console.log ( 1+1 )
console.log("esteban"+1)
console.log( typeof("11"+1 ))
console.log(1-1)
console.log("esteban"-1)
console.log(typeof("11"-1))
console.log("asd"-"dsa")
console.log("asd"*3)
console.log("asd"/3) 
console.log(0.1+0.7)
console.log(2**3) // potencia
console.log (10%5)// 0

//operadores aritmeticos
console.log(10>2)
console.log(10<2)
console.log(10>=2)
console.log(10<=2)

//Castear - Parsear
console.log(Number("10"))
console.log((10).toString())
console.log(parseInt("120"))
console.log((3.14157).toFixed(2))