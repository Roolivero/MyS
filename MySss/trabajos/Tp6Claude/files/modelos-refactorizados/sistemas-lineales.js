/* Resuelve coeficientes · solucion = terminosIndependientes sin modificar las entradas. */
"use strict";

function resolverSistemaLineal(coeficientes, terminosIndependientes) {
  const cantidadIncognitas = terminosIndependientes.length;
  const matrizAmpliada = [];

  for (let fila = 0; fila < cantidadIncognitas; fila++) {
    const filaAmpliada = [];
    for (let columna = 0; columna < cantidadIncognitas; columna++) {
      filaAmpliada.push(coeficientes[fila][columna]);
    }
    filaAmpliada.push(terminosIndependientes[fila]);
    matrizAmpliada.push(filaAmpliada);
  }

  // Eliminación gaussiana con pivoteo parcial: se elige el mayor pivote disponible.
  for (let columnaPivote = 0; columnaPivote < cantidadIncognitas; columnaPivote++) {
    let filaPivote = columnaPivote;
    for (let fila = columnaPivote + 1; fila < cantidadIncognitas; fila++) {
      if (Math.abs(matrizAmpliada[fila][columnaPivote])
          > Math.abs(matrizAmpliada[filaPivote][columnaPivote])) {
        filaPivote = fila;
      }
    }

    const filaIntercambiada = matrizAmpliada[columnaPivote];
    matrizAmpliada[columnaPivote] = matrizAmpliada[filaPivote];
    matrizAmpliada[filaPivote] = filaIntercambiada;

    if (Math.abs(matrizAmpliada[columnaPivote][columnaPivote]) < 1e-300) {
      return null;
    }

    for (let fila = columnaPivote + 1; fila < cantidadIncognitas; fila++) {
      const factorEliminacion = matrizAmpliada[fila][columnaPivote]
        / matrizAmpliada[columnaPivote][columnaPivote];
      for (let columna = columnaPivote; columna <= cantidadIncognitas; columna++) {
        matrizAmpliada[fila][columna] -= factorEliminacion * matrizAmpliada[columnaPivote][columna];
      }
    }
  }

  // Sustitución hacia atrás: la matriz ya es triangular superior.
  const solucion = new Array(cantidadIncognitas);
  for (let fila = cantidadIncognitas - 1; fila >= 0; fila--) {
    let terminoRestante = matrizAmpliada[fila][cantidadIncognitas];
    for (let columna = fila + 1; columna < cantidadIncognitas; columna++) {
      terminoRestante -= matrizAmpliada[fila][columna] * solucion[columna];
    }
    solucion[fila] = terminoRestante / matrizAmpliada[fila][fila];
  }

  return solucion;
}

const SistemasLineales = { resolver: resolverSistemaLineal };

if (typeof module !== "undefined") {
  module.exports = SistemasLineales;
}
