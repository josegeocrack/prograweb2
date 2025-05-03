// function calcularPromedio() {
//     //const n1=document.getElementById("nota1").value;
//     //const n2=document.getElementById("nota2").value;
//     //const n3=document.getElementById("nota3").value;

//     let numeros=[]
//     //notas= [n1,n2,n3]
    
//     if (notas.some(isNaN)) {
//        window.alert("Debe ingresar los 3 números para poder calcular el promedio.");
//     }
//     else {
//         notas=notas.map(Number);

//         texto=document.getElementById("promedio");
//         //let promedio = (n1+n2+n3)/3
    
//         let suma = notas.reduce((a, b) => a + b, 0);
//         let promedio = suma / notas.length;
    
//         texto.innerHTML=""
//         texto.innerHTML =`El promedio obtenido es: ${promedio.toFixed(2)}`; 
//     }
    
// };

function calcularPromedio() {


    let notas=[]
    
    let calcular =true

    for (let index = 1; index < 4; index++) {
        numnota= `nota${index}`;
        nota= document.getElementById(numnota);

        console.log(numnota)
        if (nota) {
            notas.push(parseFloat(nota.value));
            //element='';
        } else if (!nota) {
            window.alert("Debe ingresar los 3 números para poder calcular el promedio.")
            calcular= false
            break;
        }
    }

    if (calcular== true){

        texto=document.getElementById("promedio");
    
        let suma = notas.reduce((a, b) => a + b, 0);
        let promedio = suma / notas.length;
    
        texto.innerHTML=""
        texto.innerHTML =`El promedio obtenido es: ${promedio.toFixed(2)}`; 
    }

    };



