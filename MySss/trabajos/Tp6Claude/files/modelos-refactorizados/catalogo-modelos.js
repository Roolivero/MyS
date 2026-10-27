/* Fórmulas y definiciones de parámetros. Este módulo no realiza ajustes. */
"use strict";

const ComplejosDelCatalogo = typeof module !== "undefined"
  ? require("./numeros-complejos.js")
  : NumerosComplejos;

function calcularTerminoCole(frecuenciaHz, diferenciaResistencias, logFrecuenciaCaracteristica, exponenteAlpha) {
  // Se conserva log10(fc) como parámetro. La conversión a Hz ocurre sólo al evaluar.
  const frecuenciaCaracteristicaHz = 10 ** logFrecuenciaCaracteristica;
  const relacionFrecuencias = frecuenciaHz / frecuenciaCaracteristicaHz;
  const potenciaImaginaria = ComplejosDelCatalogo.elevarImaginarioPositivo(relacionFrecuencias, exponenteAlpha);
  const denominador = ComplejosDelCatalogo.sumar(ComplejosDelCatalogo.crear(1), potenciaImaginaria);
  return ComplejosDelCatalogo.dividir(ComplejosDelCatalogo.crear(diferenciaResistencias), denominador);
}

function calcularImpedanciaDebye(frecuenciaHz, parametros) {
  const terminoDebye = calcularTerminoCole(
    frecuenciaHz, parametros.diferenciaResistencias, parametros.logFrecuenciaCaracteristica, 1
  );
  return ComplejosDelCatalogo.sumar(ComplejosDelCatalogo.crear(parametros.resistenciaInfinita), terminoDebye);
}

function calcularImpedanciaCole(frecuenciaHz, parametros) {
  const terminoCole = calcularTerminoCole(
    frecuenciaHz, parametros.diferenciaResistencias,
    parametros.logFrecuenciaCaracteristica, parametros.exponenteAlpha
  );
  return ComplejosDelCatalogo.sumar(ComplejosDelCatalogo.crear(parametros.resistenciaInfinita), terminoCole);
}

function calcularImpedanciaColeConRetardo(frecuenciaHz, parametros) {
  const impedanciaCole = calcularImpedanciaCole(frecuenciaHz, parametros);
  const anguloRetardo = -2 * Math.PI * frecuenciaHz * parametros.retardoNanosegundos * 1e-9;
  const factorRetardo = ComplejosDelCatalogo.crear(Math.cos(anguloRetardo), Math.sin(anguloRetardo));
  return ComplejosDelCatalogo.multiplicar(impedanciaCole, factorRetardo);
}

function calcularImpedanciaHavriliakNegami(frecuenciaHz, parametros) {
  const frecuenciaCaracteristicaHz = 10 ** parametros.logFrecuenciaCaracteristica;
  const relacionFrecuencias = frecuenciaHz / frecuenciaCaracteristicaHz;
  const potenciaImaginaria = ComplejosDelCatalogo.elevarImaginarioPositivo(relacionFrecuencias, parametros.exponenteAlpha);
  const denominadorCole = ComplejosDelCatalogo.sumar(ComplejosDelCatalogo.crear(1), potenciaImaginaria);
  const denominadorGeneralizado = ComplejosDelCatalogo.elevar(denominadorCole, parametros.exponenteBeta);
  const terminoGeneralizado = ComplejosDelCatalogo.dividir(
    ComplejosDelCatalogo.crear(parametros.diferenciaResistencias), denominadorGeneralizado
  );
  return ComplejosDelCatalogo.sumar(ComplejosDelCatalogo.crear(parametros.resistenciaInfinita), terminoGeneralizado);
}

function calcularImpedanciaColeDoble(frecuenciaHz, parametros) {
  const primerTermino = calcularTerminoCole(
    frecuenciaHz, parametros.diferenciaResistenciasUno,
    parametros.logFrecuenciaCaracteristicaUno, parametros.exponenteAlphaUno
  );
  const segundoTermino = calcularTerminoCole(
    frecuenciaHz, parametros.diferenciaResistenciasDos,
    parametros.logFrecuenciaCaracteristicaDos, parametros.exponenteAlphaDos
  );
  const impedanciaPrimerTermino = ComplejosDelCatalogo.sumar(
    ComplejosDelCatalogo.crear(parametros.resistenciaInfinita), primerTermino
  );
  return ComplejosDelCatalogo.sumar(impedanciaPrimerTermino, segundoTermino);
}

// El orden de estas definiciones establece el orden del vector numérico del optimizador.
// Las resistencias están en Ω, las frecuencias en log10(Hz) y el retardo en ns.
const listaModelosImpedancia = [
  {
    identificador: "debye",
    nombre: "Debye",
    descripcion: "Semicírculo perfecto: Cole con α = 1.",
    parametros: [
      { clave: "resistenciaInfinita", etiqueta: "R∞", tipo: "resistenciaPositiva" },
      { clave: "diferenciaResistencias", etiqueta: "ΔR", tipo: "resistenciaPositiva" },
      { clave: "logFrecuenciaCaracteristica", etiqueta: "fc", tipo: "logFrecuencia" },
    ],
    calcularImpedancia: calcularImpedanciaDebye,
  },
  {
    identificador: "cole",
    nombre: "Cole",
    descripcion: "El modelo del TP: una sola loma, achatada según α.",
    parametros: [
      { clave: "resistenciaInfinita", etiqueta: "R∞", tipo: "resistenciaPositiva" },
      { clave: "diferenciaResistencias", etiqueta: "ΔR", tipo: "resistenciaPositiva" },
      { clave: "logFrecuenciaCaracteristica", etiqueta: "fc", tipo: "logFrecuencia" },
      { clave: "exponenteAlpha", etiqueta: "α", tipo: "exponenteFraccionario" },
    ],
    calcularImpedancia: calcularImpedanciaCole,
  },
  {
    identificador: "cole_td",
    nombre: "Cole con retardo",
    descripcion: "Cole multiplicado por un retardo de tiempo (Td), que representa efectos de los cables y el equipo en alta frecuencia.",
    parametros: [
      { clave: "resistenciaInfinita", etiqueta: "R∞", tipo: "resistenciaPositiva" },
      { clave: "diferenciaResistencias", etiqueta: "ΔR", tipo: "resistenciaPositiva" },
      { clave: "logFrecuenciaCaracteristica", etiqueta: "fc", tipo: "logFrecuencia" },
      { clave: "exponenteAlpha", etiqueta: "α", tipo: "exponenteFraccionario" },
      { clave: "retardoNanosegundos", etiqueta: "Td", tipo: "retardo" },
    ],
    calcularImpedancia: calcularImpedanciaColeConRetardo,
  },
  {
    identificador: "hn",
    nombre: "Havriliak-Negami",
    descripcion: "Generalización de Cole con un exponente más (β) que permite lomas asimétricas.",
    parametros: [
      { clave: "resistenciaInfinita", etiqueta: "R∞", tipo: "resistenciaPositiva" },
      { clave: "diferenciaResistencias", etiqueta: "ΔR", tipo: "resistenciaPositiva" },
      { clave: "logFrecuenciaCaracteristica", etiqueta: "fc", tipo: "logFrecuencia" },
      { clave: "exponenteAlpha", etiqueta: "α", tipo: "exponenteFraccionario" },
      { clave: "exponenteBeta", etiqueta: "β", tipo: "exponenteFraccionario" },
    ],
    calcularImpedancia: calcularImpedanciaHavriliakNegami,
  },
  {
    identificador: "cole2",
    nombre: "Cole doble",
    descripcion: "Suma de dos términos de Cole (dos lomas). La segunda puede tener tamaño negativo.",
    parametros: [
      { clave: "resistenciaInfinita", etiqueta: "R∞", tipo: "resistenciaPositiva" },
      { clave: "diferenciaResistenciasUno", etiqueta: "ΔR₁", tipo: "resistenciaPositiva" },
      { clave: "logFrecuenciaCaracteristicaUno", etiqueta: "fc₁", tipo: "logFrecuencia" },
      { clave: "exponenteAlphaUno", etiqueta: "α₁", tipo: "exponenteFraccionario" },
      { clave: "diferenciaResistenciasDos", etiqueta: "ΔR₂", tipo: "resistenciaConSigno" },
      { clave: "logFrecuenciaCaracteristicaDos", etiqueta: "fc₂", tipo: "logFrecuencia" },
      { clave: "exponenteAlphaDos", etiqueta: "α₂", tipo: "exponenteFraccionario" },
    ],
    calcularImpedancia: calcularImpedanciaColeDoble,
  },
];

const modelosImpedanciaPorIdentificador = {};
for (let indiceModelo = 0; indiceModelo < listaModelosImpedancia.length; indiceModelo++) {
  const modelo = listaModelosImpedancia[indiceModelo];
  modelosImpedanciaPorIdentificador[modelo.identificador] = modelo;
}

const CatalogoModelos = {
  listaModelos: listaModelosImpedancia,
  modelosPorIdentificador: modelosImpedanciaPorIdentificador,
};

if (typeof module !== "undefined") {
  module.exports = CatalogoModelos;
}
