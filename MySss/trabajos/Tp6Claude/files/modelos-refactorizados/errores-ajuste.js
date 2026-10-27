/* Diferencias entre predicciones y mediciones, y métricas para comparar modelos. */
"use strict";

function calcularResiduos(modelo, barrido, parametros) {
  const residuos = new Array(2 * barrido.frecuenciasHz.length);

  for (let indice = 0; indice < barrido.frecuenciasHz.length; indice++) {
    const impedancia = modelo.calcularImpedancia(barrido.frecuenciasHz[indice], parametros);
    // Cada frecuencia aporta dos observaciones: resistencia y reactancia.
    residuos[2 * indice] = impedancia.real - barrido.resistenciasOhm[indice];
    residuos[2 * indice + 1] = impedancia.imaginaria - barrido.reactanciasOhm[indice];
  }

  return residuos;
}

function calcularSumaCuadrados(valores) {
  let sumaCuadrados = 0;
  for (let indice = 0; indice < valores.length; indice++) {
    sumaCuadrados += valores[indice] * valores[indice];
  }
  return sumaCuadrados;
}

function calcularMetricasAjuste(modelo, barrido, parametros) {
  const cantidadFrecuencias = barrido.frecuenciasHz.length;
  const residuos = calcularResiduos(modelo, barrido, parametros);
  const sumaCuadradosResiduos = calcularSumaCuadrados(residuos);
  let sumaCuadradosImpedancias = 0;

  for (let indice = 0; indice < cantidadFrecuencias; indice++) {
    sumaCuadradosImpedancias += barrido.resistenciasOhm[indice] ** 2
      + barrido.reactanciasOhm[indice] ** 2;
  }

  // El RMSE combina las dos componentes y se expresa por frecuencia, en Ω.
  const rmseOhm = Math.sqrt(sumaCuadradosResiduos / cantidadFrecuencias);
  const impedanciaRmsOhm = Math.sqrt(sumaCuadradosImpedancias / cantidadFrecuencias);
  const cantidadObservaciones = 2 * cantidadFrecuencias;
  const cantidadParametros = modelo.parametros.length;

  return {
    rmseOhm: rmseOhm,
    nrmsePorcentaje: (100 * rmseOhm) / impedanciaRmsOhm,
    bic: cantidadObservaciones * Math.log(sumaCuadradosResiduos / cantidadObservaciones)
      + cantidadParametros * Math.log(cantidadObservaciones),
  };
}

const ErroresAjuste = {
  calcularResiduos: calcularResiduos,
  calcularSumaCuadrados: calcularSumaCuadrados,
  calcularMetricas: calcularMetricasAjuste,
};

if (typeof module !== "undefined") {
  module.exports = ErroresAjuste;
}
