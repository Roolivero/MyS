/* Ajuste iterativo desde un único punto inicial. No decide qué modelo es mejor. */
"use strict";

const ParametrosDelOptimizador = typeof module !== "undefined"
  ? require("./parametros-ajuste.js") : ParametrosAjuste;
const ErroresDelOptimizador = typeof module !== "undefined"
  ? require("./errores-ajuste.js") : ErroresAjuste;
const SistemasDelOptimizador = typeof module !== "undefined"
  ? require("./sistemas-lineales.js") : SistemasLineales;

const CONFIGURACION_OPTIMIZADOR = {
  maximoIteraciones: 400,
  maximoIntentosPorIteracion: 12,
  amortiguacionInicial: 1e-3,
  amortiguacionMinima: 1e-12,
  incrementoDerivadaRelativo: 1e-6,
  mejoraRelativaMinima: 1e-12,
  estabilizacionDiagonal: 1e-12,
};

function calcularDerivadasResiduos(modelo, barrido, limites, variablesBusqueda, residuosActuales) {
  const derivadasPorParametro = [];

  for (let indiceParametro = 0; indiceParametro < variablesBusqueda.length; indiceParametro++) {
    const incremento = CONFIGURACION_OPTIMIZADOR.incrementoDerivadaRelativo
      * (1 + Math.abs(variablesBusqueda[indiceParametro]));
    const variablesPerturbadas = variablesBusqueda.slice();
    variablesPerturbadas[indiceParametro] += incremento;

    const parametrosPerturbados = ParametrosDelOptimizador.convertirBusquedaAParametros(
      modelo, limites, variablesPerturbadas
    );
    const residuosPerturbados = ErroresDelOptimizador.calcularResiduos(modelo, barrido, parametrosPerturbados);
    const derivadasParametro = [];

    for (let indiceResiduo = 0; indiceResiduo < residuosActuales.length; indiceResiduo++) {
      const derivada = (residuosPerturbados[indiceResiduo] - residuosActuales[indiceResiduo]) / incremento;
      derivadasParametro.push(derivada);
    }
    // Se guarda una columna del jacobiano por parámetro, no una fila por residuo.
    derivadasPorParametro.push(derivadasParametro);
  }

  return derivadasPorParametro;
}

function construirSistemaNormal(derivadasPorParametro, residuos) {
  const cantidadParametros = derivadasPorParametro.length;
  const matrizNormal = [];
  const proyeccionResiduos = [];

  for (let fila = 0; fila < cantidadParametros; fila++) {
    const filaNormal = [];
    for (let columna = 0; columna < cantidadParametros; columna++) {
      let productoDerivadas = 0;
      for (let indiceResiduo = 0; indiceResiduo < residuos.length; indiceResiduo++) {
        productoDerivadas += derivadasPorParametro[fila][indiceResiduo]
          * derivadasPorParametro[columna][indiceResiduo];
      }
      filaNormal.push(productoDerivadas);
    }
    matrizNormal.push(filaNormal);

    let productoConResiduos = 0;
    for (let indiceResiduo = 0; indiceResiduo < residuos.length; indiceResiduo++) {
      productoConResiduos += derivadasPorParametro[fila][indiceResiduo] * residuos[indiceResiduo];
    }
    proyeccionResiduos.push(productoConResiduos);
  }

  // Son JᵀJ y Jᵀr. El paso se obtiene resolviendo el sistema amortiguado contra -Jᵀr.
  return { matrizNormal: matrizNormal, proyeccionResiduos: proyeccionResiduos };
}

function amortiguarMatrizNormal(matrizNormal, amortiguacion) {
  const matrizAmortiguada = [];
  for (let fila = 0; fila < matrizNormal.length; fila++) {
    const filaAmortiguada = [];
    for (let columna = 0; columna < matrizNormal.length; columna++) {
      let coeficiente = matrizNormal[fila][columna];
      if (fila === columna) {
        coeficiente = coeficiente * (1 + amortiguacion) + CONFIGURACION_OPTIMIZADOR.estabilizacionDiagonal;
      }
      filaAmortiguada.push(coeficiente);
    }
    matrizAmortiguada.push(filaAmortiguada);
  }
  return matrizAmortiguada;
}

function esPasoFinito(paso) {
  if (paso === null) {
    return false;
  }
  for (let indice = 0; indice < paso.length; indice++) {
    if (!Number.isFinite(paso[indice])) {
      return false;
    }
  }
  return true;
}

function ajustarConLevenbergMarquardt(modelo, barrido, parametrosIniciales, limites) {
  let variablesActuales = ParametrosDelOptimizador.convertirParametrosABusqueda(modelo, limites, parametrosIniciales);
  let parametrosActuales = ParametrosDelOptimizador.convertirBusquedaAParametros(modelo, limites, variablesActuales);
  let residuosActuales = ErroresDelOptimizador.calcularResiduos(modelo, barrido, parametrosActuales);
  let costoActual = ErroresDelOptimizador.calcularSumaCuadrados(residuosActuales);
  let amortiguacion = CONFIGURACION_OPTIMIZADOR.amortiguacionInicial;

  for (let iteracion = 0; iteracion < CONFIGURACION_OPTIMIZADOR.maximoIteraciones; iteracion++) {
    const derivadas = calcularDerivadasResiduos(modelo, barrido, limites, variablesActuales, residuosActuales);
    const sistemaNormal = construirSistemaNormal(derivadas, residuosActuales);
    const terminosIndependientes = [];
    for (let indice = 0; indice < sistemaNormal.proyeccionResiduos.length; indice++) {
      terminosIndependientes.push(-sistemaNormal.proyeccionResiduos[indice]);
    }

    let seAceptoPaso = false;
    for (let intento = 0; intento < CONFIGURACION_OPTIMIZADOR.maximoIntentosPorIteracion && !seAceptoPaso; intento++) {
      const matrizAmortiguada = amortiguarMatrizNormal(sistemaNormal.matrizNormal, amortiguacion);
      const paso = SistemasDelOptimizador.resolver(matrizAmortiguada, terminosIndependientes);
      if (!esPasoFinito(paso)) {
        amortiguacion *= 10;
        continue;
      }

      const variablesPropuestas = [];
      for (let indice = 0; indice < variablesActuales.length; indice++) {
        variablesPropuestas.push(variablesActuales[indice] + paso[indice]);
      }
      const parametrosPropuestos = ParametrosDelOptimizador.convertirBusquedaAParametros(modelo, limites, variablesPropuestas);
      const residuosPropuestos = ErroresDelOptimizador.calcularResiduos(modelo, barrido, parametrosPropuestos);
      const costoPropuesto = ErroresDelOptimizador.calcularSumaCuadrados(residuosPropuestos);

      if (Number.isFinite(costoPropuesto) && costoPropuesto < costoActual) {
        const mejoraRelativa = (costoActual - costoPropuesto) / costoActual;
        variablesActuales = variablesPropuestas;
        residuosActuales = residuosPropuestos;
        costoActual = costoPropuesto;
        amortiguacion = Math.max(amortiguacion / 3, CONFIGURACION_OPTIMIZADOR.amortiguacionMinima);
        seAceptoPaso = true;

        if (mejoraRelativa < CONFIGURACION_OPTIMIZADOR.mejoraRelativaMinima) {
          parametrosActuales = ParametrosDelOptimizador.convertirBusquedaAParametros(modelo, limites, variablesActuales);
          return { parametros: parametrosActuales, sumaCuadradosResiduos: costoActual };
        }
      } else {
        // Se rechaza el paso y se intenta uno más amortiguado desde el mismo estado.
        amortiguacion *= 4;
      }
    }

    if (!seAceptoPaso) {
      break;
    }
  }

  // Igual que el original, devuelve el mejor estado alcanzado, sin certificar convergencia.
  parametrosActuales = ParametrosDelOptimizador.convertirBusquedaAParametros(modelo, limites, variablesActuales);
  return { parametros: parametrosActuales, sumaCuadradosResiduos: costoActual };
}

const LevenbergMarquardt = { ajustar: ajustarConLevenbergMarquardt };

if (typeof module !== "undefined") {
  module.exports = LevenbergMarquardt;
}
