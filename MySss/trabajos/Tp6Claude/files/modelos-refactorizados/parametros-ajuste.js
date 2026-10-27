/* Límites y conversión entre parámetros con nombre y variables numéricas de búsqueda. */
"use strict";

function calcularLimitesParametros(barrido) {
  let frecuenciaMinimaHz = Infinity;
  let frecuenciaMaximaHz = -Infinity;
  let resistenciaMaximaOhm = -Infinity;

  for (let indice = 0; indice < barrido.frecuenciasHz.length; indice++) {
    frecuenciaMinimaHz = Math.min(frecuenciaMinimaHz, barrido.frecuenciasHz[indice]);
    frecuenciaMaximaHz = Math.max(frecuenciaMaximaHz, barrido.frecuenciasHz[indice]);
    resistenciaMaximaOhm = Math.max(resistenciaMaximaOhm, barrido.resistenciasOhm[indice]);
  }

  return {
    resistenciaMaximaOhm: resistenciaMaximaOhm * 20,
    logFrecuenciaMinima: Math.log10(frecuenciaMinimaHz) - 3,
    logFrecuenciaMaxima: Math.log10(frecuenciaMaximaHz) + 3,
    retardoMaximoNanosegundos: 1e9 / (4 * frecuenciaMaximaHz),
  };
}

function convertirBusquedaAParametros(modelo, limites, variablesBusqueda) {
  const parametros = {};

  for (let indice = 0; indice < modelo.parametros.length; indice++) {
    const definicion = modelo.parametros[indice];
    const variableBusqueda = variablesBusqueda[indice];
    let valorParametro;

    switch (definicion.tipo) {
      case "resistenciaPositiva":
        valorParametro = Math.min(Math.exp(variableBusqueda), limites.resistenciaMaximaOhm);
        break;
      case "resistenciaConSigno":
        valorParametro = Math.max(-limites.resistenciaMaximaOhm,
          Math.min(limites.resistenciaMaximaOhm, variableBusqueda * limites.resistenciaMaximaOhm));
        break;
      case "logFrecuencia":
        // Se limita log10(fc); todavía no se convierte a Hz.
        valorParametro = Math.max(limites.logFrecuenciaMinima,
          Math.min(limites.logFrecuenciaMaxima, variableBusqueda));
        break;
      case "exponenteFraccionario": {
        const valorSigmoide = 1 / (1 + Math.exp(-variableBusqueda));
        valorParametro = 0.01 + 0.99 * valorSigmoide;
        break;
      }
      case "retardo":
        valorParametro = limites.retardoMaximoNanosegundos * Math.tanh(variableBusqueda);
        break;
      default:
        throw new Error("Tipo de parámetro desconocido: " + definicion.tipo);
    }

    parametros[definicion.clave] = valorParametro;
  }

  return parametros;
}

function convertirParametrosABusqueda(modelo, limites, parametros) {
  const variablesBusqueda = [];

  for (let indice = 0; indice < modelo.parametros.length; indice++) {
    const definicion = modelo.parametros[indice];
    const valorParametro = parametros[definicion.clave];
    let variableBusqueda;

    switch (definicion.tipo) {
      case "resistenciaPositiva":
        variableBusqueda = Math.log(Math.max(valorParametro, 1e-6));
        break;
      case "resistenciaConSigno":
        variableBusqueda = valorParametro / limites.resistenciaMaximaOhm;
        break;
      case "logFrecuencia":
        variableBusqueda = valorParametro;
        break;
      case "exponenteFraccionario": {
        // Inversa de la sigmoide. Los márgenes evitan log(0) y divisiones por cero.
        const proporcion = Math.min(Math.max((valorParametro - 0.01) / 0.99, 1e-6), 1 - 1e-6);
        variableBusqueda = Math.log(proporcion / (1 - proporcion));
        break;
      }
      case "retardo": {
        const proporcion = Math.max(-0.999999,
          Math.min(0.999999, valorParametro / limites.retardoMaximoNanosegundos));
        variableBusqueda = Math.atanh(proporcion);
        break;
      }
      default:
        throw new Error("Tipo de parámetro desconocido: " + definicion.tipo);
    }

    variablesBusqueda.push(variableBusqueda);
  }

  return variablesBusqueda;
}

const ParametrosAjuste = {
  calcularLimites: calcularLimitesParametros,
  convertirBusquedaAParametros: convertirBusquedaAParametros,
  convertirParametrosABusqueda: convertirParametrosABusqueda,
};

if (typeof module !== "undefined") {
  module.exports = ParametrosAjuste;
}
