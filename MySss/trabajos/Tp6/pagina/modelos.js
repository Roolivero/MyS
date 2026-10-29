/*
 * Modelos y Simulación 2026 - TP 6
 * Punto 3: modelos candidatos y ajuste por mínimos cuadrados (Levenberg-Marquardt).
 *
 * Cada modelo es una fórmula Z(f) con k parámetros. Para cada barrido se buscan los
 * parámetros que minimizan  S = Σ (ΔR² + ΔX²)  y después se comparan los modelos con
 * el BIC, que premia el buen ajuste pero castiga tener más parámetros.
 *
 * Se programó igual que el análisis en Python (scipy.optimize.least_squares) para poder
 * comparar resultados.
 */
const Modelos = (() => {
  // ---------- Números complejos mínimos ----------
  const C = (re, im = 0) => ({ re, im });
  const sum = (a, b) => C(a.re + b.re, a.im + b.im);
  const mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const div = (a, b) => {
    const d = b.re * b.re + b.im * b.im;
    return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
  };
  const pow = (z, e) => {
    const m = Math.hypot(z.re, z.im) ** e;
    const t = Math.atan2(z.im, z.re) * e;
    return C(m * Math.cos(t), m * Math.sin(t));
  };
  // (j·x)^a con x > 0: tamaño x^a y ángulo a·90°
  const jPow = (x, a) => C(x ** a * Math.cos((a * Math.PI) / 2), x ** a * Math.sin((a * Math.PI) / 2));

  // Término de Cole: ΔR / (1 + (j f/fc)^a)
  const termCole = (f, dR, lfc, a) => div(C(dR), sum(C(1), jPow(f / 10 ** lfc, a)));

  // ---------- Los cinco modelos ----------
  // tipos de parámetro: pos (> 0), libre (cualquier signo), lfc (log10 de fc), frac (0,01 a 1), td (retardo acotado)
  const LISTA = [
    {
      id: "debye", nombre: "Debye", k: 3,
      desc: "Semicírculo perfecto: Cole con α = 1.",
      params: [["R∞", "pos"], ["ΔR", "pos"], ["fc", "lfc"]],
      z: (f, p) => sum(C(p[0]), termCole(f, p[1], p[2], 1)),
    },
    {
      id: "cole", nombre: "Cole", k: 4,
      desc: "El modelo del TP: una sola loma, achatada según α.",
      params: [["R∞", "pos"], ["ΔR", "pos"], ["fc", "lfc"], ["α", "frac"]],
      z: (f, p) => sum(C(p[0]), termCole(f, p[1], p[2], p[3])),
    },
    {
      id: "cole_td", nombre: "Cole con retardo", k: 5,
      desc: "Cole multiplicado por un retardo de tiempo (Td), que representa efectos de los cables y el equipo en alta frecuencia.",
      params: [["R∞", "pos"], ["ΔR", "pos"], ["fc", "lfc"], ["α", "frac"], ["Td", "td"]],
      z: (f, p) => {
        const zc = sum(C(p[0]), termCole(f, p[1], p[2], p[3]));
        const t = -2 * Math.PI * f * p[4] * 1e-9; // Td en nanosegundos
        return mul(zc, C(Math.cos(t), Math.sin(t)));
      },
    },
    {
      id: "hn", nombre: "Havriliak-Negami", k: 5,
      desc: "Generalización de Cole con un exponente más (β) que permite lomas asimétricas.",
      params: [["R∞", "pos"], ["ΔR", "pos"], ["fc", "lfc"], ["α", "frac"], ["β", "frac"]],
      z: (f, p) => sum(C(p[0]), div(C(p[1]), pow(sum(C(1), jPow(f / 10 ** p[2], p[3])), p[4]))),
    },
    {
      id: "cole2", nombre: "Cole doble", k: 7,
      desc: "Suma de dos términos de Cole (dos lomas). La segunda puede tener tamaño negativo.",
      params: [["R∞", "pos"], ["ΔR₁", "pos"], ["fc₁", "lfc"], ["α₁", "frac"], ["ΔR₂", "libre"], ["fc₂", "lfc"], ["α₂", "frac"]],
      z: (f, p) => sum(sum(C(p[0]), termCole(f, p[1], p[2], p[3])), termCole(f, p[4], p[5], p[6])),
    },
  ];
  const POR_ID = Object.fromEntries(LISTA.map((m) => [m.id, m]));

  // ---------- Variables de búsqueda (para respetar los límites) ----------
  const sig = (s) => 1 / (1 + Math.exp(-s));
  function transformador(modelo, datos) {
    const fmin = Math.min(...datos.f);
    const fmax = Math.max(...datos.f);
    const Rm = Math.max(...datos.R) * 20;
    const lo = Math.log10(fmin) - 3;
    const hi = Math.log10(fmax) + 3;
    const tdMax = 1e9 / (4 * fmax);
    const aFis = (q) => q.map((v, i) => {
      switch (modelo.params[i][1]) {
        case "pos": return Math.min(Math.exp(v), Rm);
        case "libre": return Math.max(-Rm, Math.min(Rm, v * Rm));
        case "lfc": return Math.max(lo, Math.min(hi, v));
        case "frac": return 0.01 + 0.99 * sig(v);
        case "td": return tdMax * Math.tanh(v);
      }
    });
    const aBus = (p) => p.map((v, i) => {
      switch (modelo.params[i][1]) {
        case "pos": return Math.log(Math.max(v, 1e-6));
        case "libre": return v / Rm;
        case "lfc": return v;
        case "frac": { const u = Math.min(Math.max((v - 0.01) / 0.99, 1e-6), 1 - 1e-6); return Math.log(u / (1 - u)); }
        case "td": return Math.atanh(Math.max(-0.999999, Math.min(0.999999, v / tdMax)));
      }
    });
    return { aFis, aBus };
  }

  // ---------- Errores ----------
  function residuos(modelo, datos, p) {
    const r = new Array(2 * datos.f.length);
    for (let i = 0; i < datos.f.length; i++) {
      const z = modelo.z(datos.f[i], p);
      r[2 * i] = z.re - datos.R[i];
      r[2 * i + 1] = z.im - datos.X[i];
    }
    return r;
  }
  const ss = (r) => r.reduce((s, v) => s + v * v, 0);

  function metricas(modelo, datos, p) {
    const n = datos.f.length;
    const S = ss(residuos(modelo, datos, p));
    let esc = 0;
    for (let i = 0; i < n; i++) esc += datos.R[i] ** 2 + datos.X[i] ** 2;
    const rmse = Math.sqrt(S / n);
    const N = 2 * n;
    return {
      rmse,
      nrmse: (100 * rmse) / Math.sqrt(esc / n),
      bic: N * Math.log(S / N) + modelo.k * Math.log(N),
    };
  }

  // ---------- Levenberg-Marquardt ----------
  function resolver(A, b) {
    const n = b.length;
    const M = A.map((f, i) => [...f, b[i]]);
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

  function lm(modelo, datos, p0, T) {
    const k = modelo.k;
    let q = T.aBus(p0);
    let r = residuos(modelo, datos, T.aFis(q));
    let costo = ss(r);
    let lambda = 1e-3;
    for (let it = 0; it < 400; it++) {
      const J = [];
      for (let a = 0; a < k; a++) {
        const h = 1e-6 * (1 + Math.abs(q[a]));
        const qh = [...q];
        qh[a] += h;
        const rh = residuos(modelo, datos, T.aFis(qh));
        J.push(rh.map((v, i) => (v - r[i]) / h));
      }
      const A = J.map((Ja) => J.map((Jb) => Ja.reduce((s, v, i) => s + v * Jb[i], 0)));
      const g = J.map((Ja) => Ja.reduce((s, v, i) => s + v * r[i], 0));
      let mejoro = false;
      for (let t = 0; t < 12 && !mejoro; t++) {
        const Ad = A.map((f, i) => f.map((v, j) => (i === j ? v * (1 + lambda) + 1e-12 : v)));
        const paso = resolver(Ad, g.map((v) => -v));
        if (!paso || paso.some((v) => !Number.isFinite(v))) { lambda *= 10; continue; }
        const qn = q.map((v, i) => v + paso[i]);
        const rn = residuos(modelo, datos, T.aFis(qn));
        const cn = ss(rn);
        if (Number.isFinite(cn) && cn < costo) {
          const mejora = (costo - cn) / costo;
          q = qn; r = rn; costo = cn;
          lambda = Math.max(lambda / 3, 1e-12);
          mejoro = true;
          if (mejora < 1e-12) return { p: T.aFis(q), costo };
        } else {
          lambda *= 4;
        }
      }
      if (!mejoro) break;
    }
    return { p: T.aFis(q), costo };
  }

  // ---------- Método de Ayllon (Ayllón et al., 2009, doi:10.1109/IEMBS.2009.5334494) ----------
  // Ajusta una circunferencia a los puntos (R, X) por mínimos cuadrados lineales, sin iterar.
  // Los cortes con el eje real dan R∞ y R0; la altura del centro, α; el pico de −X medido, fc.
  // Sigue la implementación en Python de la cátedra (ayllon_modificado.py), con f en Hz.
  function ayllon(datos) {
    const n = datos.f.length;
    const X = datos.R;
    const Y = datos.X;
    const media = (v) => v.reduce((s, x) => s + x, 0) / n;
    const xm = media(X);
    const ym = media(Y);
    const m2 = media(X.map((x, i) => x * x + Y[i] * Y[i]));
    let a11 = 0, a12 = 0, a22 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < n; i++) {
      const dx = X[i] - xm;
      const dy = Y[i] - ym;
      const d2 = X[i] * X[i] + Y[i] * Y[i] - m2;
      a11 += -2 * dx * dx;
      a12 += -2 * dy * dx;
      a22 += -2 * dy * dy;
      b1 += d2 * dx;
      b2 += d2 * dy;
    }
    const centro = resolver([[a11, a12], [a12, a22]], [-b1, -b2]);
    if (!centro) return null;
    const [x0, y0] = centro;
    const R2 = x0 * x0 + y0 * y0 + media(X.map((x, i) => x * x + Y[i] * Y[i] - 2 * x0 * x - 2 * y0 * Y[i]));
    const geo = Math.sqrt(R2 - y0 * y0); // NaN si la circunferencia no corta el eje real
    const Rinf = x0 - geo;
    const R0 = x0 + geo;
    let alpha = 1 - (2 / Math.PI) * Math.atan(y0 / geo);
    if (alpha > 1) alpha = 1 + Math.atan(y0 / geo) / (2 * Math.PI);
    const fc = datos.f[Y.indexOf(Math.min(...Y))]; // frecuencia del pico de −X medido
    const p = [Rinf, R0 - Rinf, Math.log10(fc), alpha];
    const valido = p.every(Number.isFinite) && Rinf > 0 && R0 > Rinf;
    return { Rinf, R0, fc, tau: 1 / (2 * Math.PI * fc), alpha, x0, y0, radio: Math.sqrt(R2), p, valido };
  }

  function mejorDe(modelo, datos, inicios) {
    const T = transformador(modelo, datos);
    let mejor = null;
    for (const p0 of inicios) {
      const r = lm(modelo, datos, p0, T);
      if (!mejor || r.costo < mejor.costo) mejor = r;
    }
    return mejor.p;
  }

  /**
   * Ajusta los cinco modelos a un barrido. Cole arranca desde el método de Ayllon (y, por si
   * la circunferencia falla, desde puntos repartidos); los más complejos, desde la solución de Cole.
   */
  function ajustarTodos(datos) {
    const fmin = Math.min(...datos.f);
    const fmax = Math.max(...datos.f);
    const Rmin = Math.min(...datos.R);
    const Rmax = Math.max(...datos.R);
    const Ri = Math.max(Rmin * 0.95, 1e-3);
    const dR = Math.max(Rmax * 1.05 - Ri, 1e-3);
    const l0 = Math.log10(fmin);
    const l1 = Math.log10(fmax);
    const lfs = [1, 2, 3].map((i) => l0 + ((l1 - l0) * i) / 4);

    const res = {};
    const ay = ayllon(datos);
    const iniCole = lfs.flatMap((lf) => [0.5, 0.9].map((a) => [Ri, dR, lf, a]));
    if (ay && ay.valido) iniCole.unshift(ay.p);
    res.cole = mejorDe(POR_ID.cole, datos, iniCole);
    const [cRi, cdR, clf, ca] = res.cole;
    res.debye = mejorDe(POR_ID.debye, datos, [[cRi, cdR, clf], [Ri, dR, (l0 + l1) / 2]]);
    res.cole_td = mejorDe(POR_ID.cole_td, datos, [[cRi, cdR, clf, ca, 0], [cRi, cdR, clf, ca, 5]]);
    res.hn = mejorDe(POR_ID.hn, datos, [[cRi, cdR, clf, ca, 1], [cRi, cdR, clf, 0.9, ca]]);
    const ini2 = [];
    for (const lf2 of [l0, (l0 + l1) / 2, l1]) for (const s of [1, -1]) ini2.push([cRi, cdR, clf, ca, s * cdR * 0.5, lf2, 0.9]);
    ini2.push([cRi, cdR * 0.8, clf, ca, cdR * 0.2, clf + 1.5, 0.8]);
    // Arranques extra: segunda loma "invertida" cerca del borde de baja frecuencia
    for (const lf2 of [l0 - 0.3, l0 + 0.2]) ini2.push([Ri, dR * 2, clf, 0.85, -dR * 2, lf2, 0.95]);
    res.cole2 = mejorDe(POR_ID.cole2, datos, ini2);

    return LISTA.map((m) => ({ id: m.id, p: res[m.id], ...metricas(m, datos, res[m.id]) }));
  }

  function evaluar(id, f, p) {
    return POR_ID[id].z(f, p);
  }

  return { LISTA, POR_ID, ajustarTodos, evaluar, metricas, ayllon };
})();

if (typeof module !== "undefined") module.exports = Modelos;
