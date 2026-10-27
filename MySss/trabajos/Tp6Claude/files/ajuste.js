/*
 * Modelos y Simulación 2026 - TP 6
 * Punto 3: ajuste de curvas del Modelo de Cole a mediciones reales.
 *
 * Método: mínimos cuadrados (Levenberg-Marquardt).
 *   Se busca (R0, R∞, fc, α) que haga lo más chica posible la suma de
 *   (R_modelo − R_medida)² + (X_modelo − X_medida)² en todas las frecuencias.
 *
 * Para que el resultado siempre tenga sentido físico, el programa no busca
 * directamente en R0, R∞, fc y α, sino en versiones transformadas que
 * garantizan R∞ > 0, R0 > R∞, fc > 0 y 0,01 ≤ α ≤ 1.
 *
 * Depende de cole.js (Cole.impedancia).
 */
const Ajuste = (() => {
  const C = typeof Cole !== "undefined" ? Cole : require("./cole.js");

  const A_MIN = 0.01;
  const A_MAX = 1;

  // ---- Transformaciones entre parámetros "físicos" y variables de búsqueda ----
  const sigmoide = (s) => 1 / (1 + Math.exp(-s));
  const logit = (p) => Math.log(p / (1 - p));

  function aFisicos(q) {
    const Rinf = Math.exp(q[0]);
    return {
      Rinf,
      R0: Rinf + Math.exp(q[1]),
      fcHz: Math.exp(q[2]),
      alpha: A_MIN + (A_MAX - A_MIN) * sigmoide(q[3]),
    };
  }

  function aBusqueda(p) {
    const u = Math.min(Math.max((p.alpha - A_MIN) / (A_MAX - A_MIN), 1e-6), 1 - 1e-6);
    return [Math.log(p.Rinf), Math.log(p.R0 - p.Rinf), Math.log(p.fcHz), logit(u)];
  }

  // ---- Modelo y errores ----
  function modelo(f, p) {
    return C.impedancia(f, { R0: p.R0, Rinf: p.Rinf, fcHz: p.fcHz, exponente: p.alpha });
  }

  /** Vector de diferencias modelo − medición: [ΔR1, ΔX1, ΔR2, ΔX2, ...]. */
  function residuos(datos, p) {
    const r = new Array(2 * datos.f.length);
    for (let i = 0; i < datos.f.length; i++) {
      const z = modelo(datos.f[i], p);
      r[2 * i] = z.R - datos.R[i];
      r[2 * i + 1] = z.X - datos.X[i];
    }
    return r;
  }

  const sumaCuadrados = (r) => r.reduce((s, v) => s + v * v, 0);

  /**
   * Errores del modelo frente a los datos.
   *  rmse:  error típico en ohmios.
   *  nrmse: el mismo error, en % del tamaño de la impedancia medida.
   */
  function errores(datos, p) {
    const n = datos.f.length;
    const rmse = Math.sqrt(sumaCuadrados(residuos(datos, p)) / n);
    let escala = 0;
    for (let i = 0; i < n; i++) escala += datos.R[i] ** 2 + datos.X[i] ** 2;
    return { rmse, nrmse: (100 * rmse) / Math.sqrt(escala / n) };
  }

  // ---- Álgebra mínima: resolver un sistema 4x4 ----
  function resolver(A, b) {
    const n = b.length;
    const M = A.map((fila, i) => [...fila, b[i]]);
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let f = c + 1; f < n; f++) if (Math.abs(M[f][c]) > Math.abs(M[piv][c])) piv = f;
      [M[c], M[piv]] = [M[piv], M[c]];
      if (Math.abs(M[c][c]) < 1e-300) return null;
      for (let f = c + 1; f < n; f++) {
        const k = M[f][c] / M[c][c];
        for (let j = c; j <= n; j++) M[f][j] -= k * M[c][j];
      }
    }
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let s = M[i][n];
      for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
      x[i] = s / M[i][i];
    }
    return x;
  }

  // ---- Levenberg-Marquardt desde un punto de partida ----
  function levenbergMarquardt(datos, q0, limitesFc) {
    const acotar = (q) => {
      q[2] = Math.min(Math.max(q[2], limitesFc[0]), limitesFc[1]);
      q[3] = Math.min(Math.max(q[3], -30), 30);
      return q;
    };
    let q = acotar([...q0]);
    let r = residuos(datos, aFisicos(q));
    let costo = sumaCuadrados(r);
    let lambda = 1e-3;

    for (let it = 0; it < 300; it++) {
      // Jacobiano numérico: cuánto cambia cada residuo al mover un poquito cada variable
      const J = [];
      for (let k = 0; k < 4; k++) {
        const h = 1e-6 * (1 + Math.abs(q[k]));
        const qh = [...q];
        qh[k] += h;
        const rh = residuos(datos, aFisicos(qh));
        J.push(rh.map((v, i) => (v - r[i]) / h));
      }
      const A = [0, 1, 2, 3].map((a) => [0, 1, 2, 3].map((b) => J[a].reduce((s, v, i) => s + v * J[b][i], 0)));
      const g = [0, 1, 2, 3].map((a) => J[a].reduce((s, v, i) => s + v * r[i], 0));

      let mejoro = false;
      for (let intento = 0; intento < 12 && !mejoro; intento++) {
        const Ad = A.map((fila, i) => fila.map((v, j) => (i === j ? v * (1 + lambda) + 1e-12 : v)));
        const paso = resolver(Ad, g.map((v) => -v));
        if (!paso) { lambda *= 10; continue; }
        const qn = acotar(q.map((v, i) => v + paso[i]));
        const rn = residuos(datos, aFisicos(qn));
        const cn = sumaCuadrados(rn);
        if (Number.isFinite(cn) && cn < costo) {
          const mejora = (costo - cn) / costo;
          q = qn; r = rn; costo = cn;
          lambda = Math.max(lambda / 3, 1e-12);
          mejoro = true;
          if (mejora < 1e-12) return { q, costo };
        } else {
          lambda *= 4;
        }
      }
      if (!mejoro) break;
    }
    return { q, costo };
  }

  /** Valores iniciales "a ojo" a partir de los datos. */
  function inicial(datos) {
    const Rmin = Math.min(...datos.R);
    const Rmax = Math.max(...datos.R);
    let iMax = 0;
    datos.X.forEach((x, i) => { if (-x > -datos.X[iMax]) iMax = i; });
    return {
      Rinf: Math.max(Rmin * 0.95, 1e-3),
      R0: Math.max(Rmax * 1.05, Rmin * 0.95 + 1),
      fcHz: datos.f[iMax],
      alpha: 0.7,
    };
  }

  /**
   * Ajuste completo: prueba 15 puntos de partida (5 fc × 3 α)
   * y se queda con el de menor error.
   */
  function ajustar(datos) {
    const fmin = Math.min(...datos.f);
    const fmax = Math.max(...datos.f);
    const limitesFc = [Math.log(fmin / 100), Math.log(fmax * 100)];
    const base = inicial(datos);
    const fcs = C.logspace(fmin, fmax, 7).slice(1, 6);

    let mejor = null;
    for (const fc of fcs) {
      for (const alpha of [0.35, 0.7, 0.95]) {
        const res = levenbergMarquardt(datos, aBusqueda({ ...base, fcHz: fc, alpha }), limitesFc);
        if (!mejor || res.costo < mejor.costo) mejor = res;
      }
    }
    const p = aFisicos(mejor.q);
    return { ...p, enLimite: p.alpha > 0.999 || p.alpha < A_MIN + 1e-3, ...errores(datos, p) };
  }

  /** Prueba extra: ajusta con frecuencias alternadas y mide el error en las otras. */
  function validar(datos) {
    const sub = (paridad) => ({
      f: datos.f.filter((_, i) => i % 2 === paridad),
      R: datos.R.filter((_, i) => i % 2 === paridad),
      X: datos.X.filter((_, i) => i % 2 === paridad),
    });
    const p = ajustar(sub(0));
    return errores(sub(1), p);
  }

  return { ajustar, validar, errores, inicial, modelo };
})();

if (typeof module !== "undefined") module.exports = Ajuste;
