/* Puntos iniciales, búsqueda desde varios inicios y coordinación de los cinco modelos. */
"use strict";

const CatalogoDelAjuste = typeof module !== "undefined"
  ? require("./catalogo-modelos.js") : CatalogoModelos;
const ParametrosDelAjuste = typeof module !== "undefined"
  ? require("./parametros-ajuste.js") : ParametrosAjuste;
const ErroresDelAjuste = typeof module !== "undefined"
  ? require("./errores-ajuste.js") : ErroresAjuste;
const OptimizadorDelAjuste = typeof module !== "undefined"
  ? require("./levenberg-marquardt.js") : LevenbergMarquardt;

function estimarParametrosIniciales(barrido) {
  let frecuenciaMinimaHz = Infinity;
  let frecuenciaMaximaHz = -Infinity;
  let resistenciaMinimaOhm = Infinity;
  let resistenciaMaximaOhm = -Infinity;
  for (let indice = 0; indice < barrido.frecuenciasHz.length; indice++) {
    frecuenciaMinimaHz = Math.min(frecuenciaMinimaHz, barrido.frecuenciasHz[indice]);
    frecuenciaMaximaHz = Math.max(frecuenciaMaximaHz, barrido.frecuenciasHz[indice]);
    resistenciaMinimaOhm = Math.min(resistenciaMinimaOhm, barrido.resistenciasOhm[indice]);
    resistenciaMaximaOhm = Math.max(resistenciaMaximaOhm, barrido.resistenciasOhm[indice]);
  }

  const resistenciaInfinita = Math.max(resistenciaMinimaOhm * 0.95, 1e-3);
  return {
    resistenciaInfinita: resistenciaInfinita,
    diferenciaResistencias: Math.max(resistenciaMaximaOhm * 1.05 - resistenciaInfinita, 1e-3),
    logFrecuenciaMinima: Math.log10(frecuenciaMinimaHz),
    logFrecuenciaMaxima: Math.log10(frecuenciaMaximaHz),
  };
}

function crearIniciosCole(estimaciones) {
  const inicios = [];
  const exponentesIniciales = [0.5, 0.9];
  for (let posicionFrecuencia = 1; posicionFrecuencia <= 3; posicionFrecuencia++) {
    const logFrecuencia = estimaciones.logFrecuenciaMinima
      + ((estimaciones.logFrecuenciaMaxima - estimaciones.logFrecuenciaMinima) * posicionFrecuencia) / 4;
    for (let indice = 0; indice < exponentesIniciales.length; indice++) {
      inicios.push({
        resistenciaInfinita: estimaciones.resistenciaInfinita,
        diferenciaResistencias: estimaciones.diferenciaResistencias,
        logFrecuenciaCaracteristica: logFrecuencia,
        exponenteAlpha: exponentesIniciales[indice],
      });
    }
  }
  return inicios;
}

function crearIniciosDebye(estimaciones, parametrosCole) {
  return [
    {
      resistenciaInfinita: parametrosCole.resistenciaInfinita,
      diferenciaResistencias: parametrosCole.diferenciaResistencias,
      logFrecuenciaCaracteristica: parametrosCole.logFrecuenciaCaracteristica,
    },
    {
      resistenciaInfinita: estimaciones.resistenciaInfinita,
      diferenciaResistencias: estimaciones.diferenciaResistencias,
      logFrecuenciaCaracteristica: (estimaciones.logFrecuenciaMinima + estimaciones.logFrecuenciaMaxima) / 2,
    },
  ];
}

function crearIniciosColeConRetardo(parametrosCole) {
  const inicios = [];
  const retardosInicialesNanosegundos = [0, 5];
  for (let indice = 0; indice < retardosInicialesNanosegundos.length; indice++) {
    inicios.push({
      resistenciaInfinita: parametrosCole.resistenciaInfinita,
      diferenciaResistencias: parametrosCole.diferenciaResistencias,
      logFrecuenciaCaracteristica: parametrosCole.logFrecuenciaCaracteristica,
      exponenteAlpha: parametrosCole.exponenteAlpha,
      retardoNanosegundos: retardosInicialesNanosegundos[indice],
    });
  }
  return inicios;
}

function crearIniciosHavriliakNegami(parametrosCole) {
  return [
    {
      resistenciaInfinita: parametrosCole.resistenciaInfinita,
      diferenciaResistencias: parametrosCole.diferenciaResistencias,
      logFrecuenciaCaracteristica: parametrosCole.logFrecuenciaCaracteristica,
      exponenteAlpha: parametrosCole.exponenteAlpha,
      exponenteBeta: 1,
    },
    {
      resistenciaInfinita: parametrosCole.resistenciaInfinita,
      diferenciaResistencias: parametrosCole.diferenciaResistencias,
      logFrecuenciaCaracteristica: parametrosCole.logFrecuenciaCaracteristica,
      exponenteAlpha: 0.9,
      exponenteBeta: parametrosCole.exponenteAlpha,
    },
  ];
}

function crearIniciosColeDoble(estimaciones, parametrosCole) {
  const inicios = [];
  const logFrecuenciaMedia = (estimaciones.logFrecuenciaMinima + estimaciones.logFrecuenciaMaxima) / 2;
  const logFrecuenciasSegundaDispersion = [estimaciones.logFrecuenciaMinima, logFrecuenciaMedia, estimaciones.logFrecuenciaMaxima];
  const signosSegundaAmplitud = [1, -1];

  for (let indiceFrecuencia = 0; indiceFrecuencia < logFrecuenciasSegundaDispersion.length; indiceFrecuencia++) {
    for (let indiceSigno = 0; indiceSigno < signosSegundaAmplitud.length; indiceSigno++) {
      inicios.push({
        resistenciaInfinita: parametrosCole.resistenciaInfinita,
        diferenciaResistenciasUno: parametrosCole.diferenciaResistencias,
        logFrecuenciaCaracteristicaUno: parametrosCole.logFrecuenciaCaracteristica,
        exponenteAlphaUno: parametrosCole.exponenteAlpha,
        diferenciaResistenciasDos: signosSegundaAmplitud[indiceSigno] * parametrosCole.diferenciaResistencias * 0.5,
        logFrecuenciaCaracteristicaDos: logFrecuenciasSegundaDispersion[indiceFrecuencia],
        exponenteAlphaDos: 0.9,
      });
    }
  }

  inicios.push({
    resistenciaInfinita: parametrosCole.resistenciaInfinita,
    diferenciaResistenciasUno: parametrosCole.diferenciaResistencias * 0.8,
    logFrecuenciaCaracteristicaUno: parametrosCole.logFrecuenciaCaracteristica,
    exponenteAlphaUno: parametrosCole.exponenteAlpha,
    diferenciaResistenciasDos: parametrosCole.diferenciaResistencias * 0.2,
    logFrecuenciaCaracteristicaDos: parametrosCole.logFrecuenciaCaracteristica + 1.5,
    exponenteAlphaDos: 0.8,
  });

  // Se conserva la posibilidad de una segunda contribución negativa en baja frecuencia.
  const logFrecuenciasBajas = [estimaciones.logFrecuenciaMinima - 0.3, estimaciones.logFrecuenciaMinima + 0.2];
  for (let indice = 0; indice < logFrecuenciasBajas.length; indice++) {
    inicios.push({
      resistenciaInfinita: estimaciones.resistenciaInfinita,
      diferenciaResistenciasUno: estimaciones.diferenciaResistencias * 2,
      logFrecuenciaCaracteristicaUno: parametrosCole.logFrecuenciaCaracteristica,
      exponenteAlphaUno: 0.85,
      diferenciaResistenciasDos: -estimaciones.diferenciaResistencias * 2,
      logFrecuenciaCaracteristicaDos: logFrecuenciasBajas[indice],
      exponenteAlphaDos: 0.95,
    });
  }
  return inicios;
}

function buscarMejoresParametros(modelo, barrido, inicios) {
  const limites = ParametrosDelAjuste.calcularLimites(barrido);
  let mejorResultado = null;
  for (let indiceInicio = 0; indiceInicio < inicios.length; indiceInicio++) {
    const resultado = OptimizadorDelAjuste.ajustar(modelo, barrido, inicios[indiceInicio], limites);
    if (mejorResultado === null || resultado.sumaCuadradosResiduos < mejorResultado.sumaCuadradosResiduos) {
      mejorResultado = resultado;
    }
  }
  return mejorResultado.parametros;
}

function ajustarTodosLosModelos(barrido) {
  const estimaciones = estimarParametrosIniciales(barrido);
  const catalogo = CatalogoDelAjuste.modelosPorIdentificador;
  const parametrosPorModelo = {};

  // Cole se ajusta primero porque sus parámetros sirven de inicio a los otros modelos.
  const parametrosCole = buscarMejoresParametros(catalogo.cole, barrido, crearIniciosCole(estimaciones));
  parametrosPorModelo.cole = parametrosCole;
  parametrosPorModelo.debye = buscarMejoresParametros(catalogo.debye, barrido, crearIniciosDebye(estimaciones, parametrosCole));
  parametrosPorModelo.cole_td = buscarMejoresParametros(catalogo.cole_td, barrido, crearIniciosColeConRetardo(parametrosCole));
  parametrosPorModelo.hn = buscarMejoresParametros(catalogo.hn, barrido, crearIniciosHavriliakNegami(parametrosCole));
  parametrosPorModelo.cole2 = buscarMejoresParametros(catalogo.cole2, barrido, crearIniciosColeDoble(estimaciones, parametrosCole));

  const resultados = [];
  for (let indiceModelo = 0; indiceModelo < CatalogoDelAjuste.listaModelos.length; indiceModelo++) {
    const modelo = CatalogoDelAjuste.listaModelos[indiceModelo];
    const parametros = parametrosPorModelo[modelo.identificador];
    resultados.push({
      identificadorModelo: modelo.identificador,
      parametros: parametros,
      metricas: ErroresDelAjuste.calcularMetricas(modelo, barrido, parametros),
    });
  }
  return resultados;
}

const AjusteModelos = { ajustarTodosLosModelos: ajustarTodosLosModelos };

if (typeof module !== "undefined") {
  module.exports = AjusteModelos;
}
