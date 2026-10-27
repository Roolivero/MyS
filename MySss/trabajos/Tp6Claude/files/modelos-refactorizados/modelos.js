/*
 * Entrada de la versión refactorizada.
 * Los módulos internos usan nombres completos y objetos de parámetros.
 * Este adaptador conserva la API de modelos.js para reutilizar punto3.js sin cambios.
 */
"use strict";

const CatalogoDeLaInterfaz = typeof module !== "undefined"
  ? require("./catalogo-modelos.js") : CatalogoModelos;
const AjusteDeLaInterfaz = typeof module !== "undefined"
  ? require("./ajuste-modelos.js") : AjusteModelos;
const ErroresDeLaInterfaz = typeof module !== "undefined"
  ? require("./errores-ajuste.js") : ErroresAjuste;

function convertirBarridoOriginal(datosOriginales) {
  return {
    frecuenciasHz: datosOriginales.f,
    resistenciasOhm: datosOriginales.R,
    reactanciasOhm: datosOriginales.X,
  };
}

function convertirVectorAParametros(modelo, vectorParametros) {
  const parametros = {};
  for (let indice = 0; indice < modelo.parametros.length; indice++) {
    parametros[modelo.parametros[indice].clave] = vectorParametros[indice];
  }
  return parametros;
}

function convertirParametrosAVector(modelo, parametros) {
  const vectorParametros = [];
  for (let indice = 0; indice < modelo.parametros.length; indice++) {
    vectorParametros.push(parametros[modelo.parametros[indice].clave]);
  }
  return vectorParametros;
}

function evaluarModeloCompatible(identificadorModelo, frecuenciaHz, vectorParametros) {
  const modelo = CatalogoDeLaInterfaz.modelosPorIdentificador[identificadorModelo];
  const parametros = convertirVectorAParametros(modelo, vectorParametros);
  const impedancia = modelo.calcularImpedancia(frecuenciaHz, parametros);
  return { re: impedancia.real, im: impedancia.imaginaria };
}

// Funciones con nombre para mantener también la propiedad z de cada modelo original.
function evaluarDebyeCompatible(frecuenciaHz, vectorParametros) {
  return evaluarModeloCompatible("debye", frecuenciaHz, vectorParametros);
}
function evaluarColeCompatible(frecuenciaHz, vectorParametros) {
  return evaluarModeloCompatible("cole", frecuenciaHz, vectorParametros);
}
function evaluarColeConRetardoCompatible(frecuenciaHz, vectorParametros) {
  return evaluarModeloCompatible("cole_td", frecuenciaHz, vectorParametros);
}
function evaluarHavriliakNegamiCompatible(frecuenciaHz, vectorParametros) {
  return evaluarModeloCompatible("hn", frecuenciaHz, vectorParametros);
}
function evaluarColeDobleCompatible(frecuenciaHz, vectorParametros) {
  return evaluarModeloCompatible("cole2", frecuenciaHz, vectorParametros);
}

function ajustarTodosCompatible(datosOriginales) {
  const barrido = convertirBarridoOriginal(datosOriginales);
  const resultados = AjusteDeLaInterfaz.ajustarTodosLosModelos(barrido);
  const resultadosCompatibles = [];
  for (let indice = 0; indice < resultados.length; indice++) {
    const resultado = resultados[indice];
    const modelo = CatalogoDeLaInterfaz.modelosPorIdentificador[resultado.identificadorModelo];
    resultadosCompatibles.push({
      id: resultado.identificadorModelo,
      p: convertirParametrosAVector(modelo, resultado.parametros),
      rmse: resultado.metricas.rmseOhm,
      nrmse: resultado.metricas.nrmsePorcentaje,
      bic: resultado.metricas.bic,
    });
  }
  return resultadosCompatibles;
}

function calcularMetricasCompatibles(modeloOriginal, datosOriginales, vectorParametros) {
  const modelo = CatalogoDeLaInterfaz.modelosPorIdentificador[modeloOriginal.id];
  const parametros = convertirVectorAParametros(modelo, vectorParametros);
  const metricas = ErroresDeLaInterfaz.calcularMetricas(modelo, convertirBarridoOriginal(datosOriginales), parametros);
  return { rmse: metricas.rmseOhm, nrmse: metricas.nrmsePorcentaje, bic: metricas.bic };
}

const tiposParametrosCompatibles = {
  resistenciaPositiva: "pos",
  resistenciaConSigno: "libre",
  logFrecuencia: "lfc",
  exponenteFraccionario: "frac",
  retardo: "td",
};
const evaluacionesCompatibles = {
  debye: evaluarDebyeCompatible,
  cole: evaluarColeCompatible,
  cole_td: evaluarColeConRetardoCompatible,
  hn: evaluarHavriliakNegamiCompatible,
  cole2: evaluarColeDobleCompatible,
};
const listaModelosCompatibles = [];
const modelosCompatiblesPorIdentificador = {};

for (let indiceModelo = 0; indiceModelo < CatalogoDeLaInterfaz.listaModelos.length; indiceModelo++) {
  const modelo = CatalogoDeLaInterfaz.listaModelos[indiceModelo];
  const parametrosCompatibles = [];
  for (let indiceParametro = 0; indiceParametro < modelo.parametros.length; indiceParametro++) {
    const definicion = modelo.parametros[indiceParametro];
    parametrosCompatibles.push([definicion.etiqueta, tiposParametrosCompatibles[definicion.tipo]]);
  }
  const modeloCompatible = {
    id: modelo.identificador,
    nombre: modelo.nombre,
    k: modelo.parametros.length,
    desc: modelo.descripcion,
    params: parametrosCompatibles,
    z: evaluacionesCompatibles[modelo.identificador],
  };
  listaModelosCompatibles.push(modeloCompatible);
  modelosCompatiblesPorIdentificador[modelo.identificador] = modeloCompatible;
}

// Los nombres breves sólo se conservan en esta frontera con la página existente.
const Modelos = {
  LISTA: listaModelosCompatibles,
  POR_ID: modelosCompatiblesPorIdentificador,
  ajustarTodos: ajustarTodosCompatible,
  evaluar: evaluarModeloCompatible,
  metricas: calcularMetricasCompatibles,
};

if (typeof module !== "undefined") {
  module.exports = Modelos;
}
