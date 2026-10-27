/* Operaciones necesarias para calcular Z = parte real + j · parte imaginaria. */
"use strict";

function crearNumeroComplejo(parteReal, parteImaginaria = 0) {
  return { real: parteReal, imaginaria: parteImaginaria };
}

function sumarComplejos(primerNumero, segundoNumero) {
  const parteReal = primerNumero.real + segundoNumero.real;
  const parteImaginaria = primerNumero.imaginaria + segundoNumero.imaginaria;
  return crearNumeroComplejo(parteReal, parteImaginaria);
}

function multiplicarComplejos(primerNumero, segundoNumero) {
  const parteReal = primerNumero.real * segundoNumero.real
    - primerNumero.imaginaria * segundoNumero.imaginaria;
  const parteImaginaria = primerNumero.real * segundoNumero.imaginaria
    + primerNumero.imaginaria * segundoNumero.real;
  return crearNumeroComplejo(parteReal, parteImaginaria);
}

function dividirComplejos(numerador, denominador) {
  // Multiplicar por el conjugado deja un denominador real: |denominador|².
  const moduloDenominadorAlCuadrado = denominador.real * denominador.real
    + denominador.imaginaria * denominador.imaginaria;
  const parteReal = (numerador.real * denominador.real
    + numerador.imaginaria * denominador.imaginaria) / moduloDenominadorAlCuadrado;
  const parteImaginaria = (numerador.imaginaria * denominador.real
    - numerador.real * denominador.imaginaria) / moduloDenominadorAlCuadrado;
  return crearNumeroComplejo(parteReal, parteImaginaria);
}

function elevarComplejo(numero, exponente) {
  // En forma polar, elevar a una potencia multiplica el ángulo por el exponente.
  const moduloElevado = Math.hypot(numero.real, numero.imaginaria) ** exponente;
  const anguloMultiplicado = Math.atan2(numero.imaginaria, numero.real) * exponente;
  return crearNumeroComplejo(
    moduloElevado * Math.cos(anguloMultiplicado),
    moduloElevado * Math.sin(anguloMultiplicado)
  );
}

function elevarImaginarioPositivo(valorPositivo, exponente) {
  // (j · x)^α = x^α · [cos(απ/2) + j · sen(απ/2)], para x > 0.
  const moduloElevado = valorPositivo ** exponente;
  const anguloMultiplicado = (exponente * Math.PI) / 2;
  return crearNumeroComplejo(
    moduloElevado * Math.cos(anguloMultiplicado),
    moduloElevado * Math.sin(anguloMultiplicado)
  );
}

const NumerosComplejos = {
  crear: crearNumeroComplejo,
  sumar: sumarComplejos,
  multiplicar: multiplicarComplejos,
  dividir: dividirComplejos,
  elevar: elevarComplejo,
  elevarImaginarioPositivo: elevarImaginarioPositivo,
};

if (typeof module !== "undefined") {
  module.exports = NumerosComplejos;
}
