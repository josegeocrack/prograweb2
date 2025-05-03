numero= document.getElementById("numero")

function aumentar() {
    numero.innerHTML=parseInt(numero.innerHTML)+1
}

function disminuir() {
    numero.innerHTML=parseInt(numero.innerHTML)-1
}

function reiniciar() {
    numero.innerHTML=0
}