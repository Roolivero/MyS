/*
 * Modelos y Simulación 2026 - TP 6
 * Punto 1: implementación del Modelo de Cole
 *
 *   Z(ω) = R∞ + (R0 − R∞) / (1 + (jωτ)^α)
 *
 *   ω = 2πf          frecuencia angular [rad/s]
 *   τ = 1 / (2π fc)  constante de tiempo de relajación [s]
 *
 * Este archivo no depende de la página: se puede probar solo
 * (por ejemplo con Node) y lo usa app.js para graficar.
 */
const Cole = (() => {
  /** τ a partir de la frecuencia característica fc [Hz]. */
  function tauDesdeFc(fcHz) {
    return 1 / (2 * Math.PI * fcHz);
  }

  /**
   * Impedancia del modelo en una frecuencia f [Hz].
   *
   * La potencia compleja se resuelve en forma polar, usando j = e^(jπ/2):
   *   (jωτ)^a = (ωτ)^a · [cos(aπ/2) + j·sen(aπ/2)]
   *
   * Con D = 1 + (jωτ)^a, se divide multiplicando por el conjugado de D.
   *
   * @param {number} f   frecuencia [Hz]
   * @param {{R0:number, Rinf:number, fcHz:number, exponente:number}} p
   * @returns {{f:number, R:number, X:number, modulo:number, faseGrados:number}}
   *          R = parte real (resistencia), X = parte imaginaria (reactancia)
   */
  function impedancia(f, p) {
    const w = 2 * Math.PI * f;
    const tau = tauDesdeFc(p.fcHz);
    const a = p.exponente;

    const m = Math.pow(w * tau, a);      // módulo de (jωτ)^a
    const fi = (a * Math.PI) / 2;         // argumento de (jωτ)^a

    const reD = 1 + m * Math.cos(fi);     // parte real de D
    const imD = m * Math.sin(fi);         // parte imaginaria de D
    const modD2 = reD * reD + imD * imD;  // |D|²

    const dR = p.R0 - p.Rinf;
    const R = p.Rinf + (dR * reD) / modD2;
    const X = (-dR * imD) / modD2;        // negativa: comportamiento capacitivo

    return {
      f,
      R,
      X,
      modulo: Math.hypot(R, X),
      faseGrados: (Math.atan2(X, R) * 180) / Math.PI,
    };
  }

  /** n frecuencias espaciadas logarítmicamente entre fmin y fmax [Hz]. */
  function logspace(fmin, fmax, n) {
    const a = Math.log10(fmin);
    const b = Math.log10(fmax);
    return Array.from({ length: n }, (_, i) => Math.pow(10, a + ((b - a) * i) / (n - 1)));
  }

  /** Simula el modelo en todo un vector de frecuencias. */
  function simular(p, frecuencias) {
    return frecuencias.map((f) => impedancia(f, p));
  }

  return { tauDesdeFc, impedancia, logspace, simular };
})();

if (typeof module !== "undefined") module.exports = Cole;
