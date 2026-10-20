/*
 * Interfaz del TP 6: controles, tabla y gráficos (Chart.js).
 * El modelo en sí está en cole.js.
 */

// ---------- Datos de la Tabla 1 (fc en kHz) ----------
const TABLA_1 = [
  { nombre: "Músculo long.",  R0: 385, Rinf: 70,  fc: 37,  alpha: 0.27, color: "#c0462f" },
  { nombre: "Músculo trans.", R0: 730, Rinf: 75,  fc: 27,  alpha: 0.24, color: "#d9932a" },
  { nombre: "Hígado",         R0: 540, Rinf: 100, fc: 72,  alpha: 0.45, color: "#7b4fa3" },
  { nombre: "Pulmón",         R0: 440, Rinf: 70,  fc: 100, alpha: 0.59, color: "#2f86c4" },
  { nombre: "Bazo",           R0: 550, Rinf: 60,  fc: 373, alpha: 0.36, color: "#3c9a57" },
];

const estado = {
  convencion: "tp",   // "tp": exponente = α  |  "dielectrica": exponente = 1 − α
  fmin: 100,          // Hz
  fmax: 1e8,          // Hz
  puntos: 400,
  p1: { R0: 385, Rinf: 70, fc: 37, alpha: 0.27 },
  referencias: [],    // curvas fijadas para comparar (punto 1)
  tejidos: TABLA_1.map((t) => ({ ...t, visible: true })),
};

// ---------- Utilidades ----------
const $ = (s) => document.querySelector(s);
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

const exponente = (alpha) => (estado.convencion === "tp" ? alpha : 1 - alpha);

const parametros = (t) => ({
  R0: t.R0,
  Rinf: t.Rinf,
  fcHz: t.fc * 1e3,
  exponente: exponente(t.alpha),
});

const frecuencias = () => Cole.logspace(estado.fmin, estado.fmax, estado.puntos);

function fmtHz(v) {
  const u = [[1e9, "GHz"], [1e6, "MHz"], [1e3, "kHz"], [1, "Hz"]];
  for (const [d, s] of u) if (v >= d) return `${+(v / d).toPrecision(3)} ${s}`;
  return `${+v.toPrecision(3)} Hz`;
}
const fmtOhm = (v) => `${v.toFixed(1)} Ω`;
const techo = (v) => Math.ceil((v * 1.08) / 50) * 50;

function validos(p) {
  if ([p.R0, p.Rinf, p.fc, p.alpha].some((v) => !Number.isFinite(v))) return "Completá todos los parámetros.";
  if (p.fc <= 0) return "fc tiene que ser mayor a 0.";
  if (p.alpha <= 0 || p.alpha > 1) return "α tiene que estar entre 0 y 1.";
  if (p.R0 <= p.Rinf) return "R0 tiene que ser mayor que R∞.";
  return "";
}

// ---------- Gráficos ----------
function configurarChart() {
  Chart.defaults.font.family = css("--sans");
  Chart.defaults.font.size = 13;
  Chart.defaults.color = css("--tinta-2");
  Chart.defaults.borderColor = css("--grilla");
  Chart.defaults.animation = false;
}

const ejeFrecuencia = {
  type: "logarithmic",
  title: { display: true, text: "f [Hz]" },
  ticks: {
    autoSkip: false,
    maxRotation: 0,
    callback(v) {
      const l = Math.log10(v);
      return Math.abs(l - Math.round(l)) < 1e-9 ? fmtHz(v) : "";
    },
  },
  grid: { color: (c) => (c.tick && c.tick.label ? css("--grilla") : "transparent") },
};

function opcionesBase(extra) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "nearest", intersect: false },
    plugins: {
      legend: { labels: { boxWidth: 14, boxHeight: 3, usePointStyle: false } },
      tooltip: {
        callbacks: {
          label: (c) => `${c.dataset.label}: (${c.parsed.x.toPrecision(4)}, ${c.parsed.y.toFixed(1)})`,
        },
      },
    },
    ...extra,
  };
}

function graficoNyquist(id) {
  return new Chart($(id), {
    type: "scatter",
    data: { datasets: [] },
    options: opcionesBase({
      scales: {
        x: { min: 0, title: { display: true, text: "R [Ω]" } },
        y: { min: 0, title: { display: true, text: "−X [Ω]" } },
      },
      plugins: {
        legend: { labels: { boxWidth: 14, boxHeight: 3 } },
        tooltip: {
          callbacks: {
            label: (c) => {
              const f = c.raw.f;
              return `${c.dataset.label}: R = ${fmtOhm(c.parsed.x)}, −X = ${fmtOhm(c.parsed.y)}${f ? ` (f = ${fmtHz(f)})` : ""}`;
            },
          },
        },
      },
    }),
  });
}

function graficoFrecuencia(id, textoY) {
  return new Chart($(id), {
    type: "scatter",
    data: { datasets: [] },
    options: opcionesBase({
      scales: {
        x: ejeFrecuencia,
        y: { min: 0, title: { display: true, text: textoY } },
      },
      plugins: {
        legend: { labels: { boxWidth: 14, boxHeight: 3 } },
        tooltip: {
          callbacks: {
            label: (c) => `${c.dataset.label}: ${fmtOhm(c.parsed.y)} en ${fmtHz(c.parsed.x)}`,
          },
        },
      },
    }),
  });
}

const curva = (label, color, data, guiones) => ({
  label,
  data,
  showLine: true,
  pointRadius: 0,
  borderWidth: 2.2,
  borderColor: color,
  backgroundColor: color,
  borderDash: guiones ? [6, 4] : [],
});

const marcador = (label, color, punto) => ({
  label,
  data: [punto],
  showLine: false,
  pointRadius: 6,
  pointHoverRadius: 7,
  pointBackgroundColor: color,
  pointBorderColor: css("--papel"),
  pointBorderWidth: 2,
});

// Ajusta los ejes del Cole-Cole para que 1 Ω mida lo mismo en X y en Y
// (así el arco se ve como arco de circunferencia y no como elipse).
function escalaIgual(chart, xmax) {
  const area = chart.chartArea;
  const relacion = area ? area.height / area.width : 0.5;
  chart.options.scales.x.max = xmax;
  chart.options.scales.y.max = Math.max(50, Math.round((xmax * relacion) / 25) * 25);
}

let g1Nyq, g1Frec, g2Nyq, g2R, g2X;

// ---------- Punto 1 ----------
const MAX_REF = 4;
const COLORES_REF = ["#8c9997", "#b07d62", "#7d8fb3", "#a3a35c"];

function actualizarEstadoRef() {
  const n = estado.referencias.length;
  $("#estado-ref").textContent = n === 0
    ? "Fijá la curva actual y después mové un parámetro para comparar el antes y el después."
    : n < MAX_REF
      ? `${n} de ${MAX_REF} referencias fijadas. Las líneas finas son las referencias.`
      : `Llegaste a ${MAX_REF} referencias. Borralas para fijar nuevas.`;
}

function iniciarReferencias() {
  $("#fijar").addEventListener("click", () => {
    if (validos(estado.p1)) return;
    if (estado.referencias.length >= MAX_REF) { actualizarEstadoRef(); return; }
    estado.referencias.push({ ...estado.p1 });
    actualizarEstadoRef();
    actualizarP1();
  });
  $("#borrar-ref").addEventListener("click", () => {
    estado.referencias = [];
    actualizarEstadoRef();
    actualizarP1();
  });
}
const CAMPOS = ["R0", "Rinf", "fc", "alpha"];

function escribirControles() {
  for (const k of CAMPOS) {
    $(`#${k}-r`).value = estado.p1[k];
    $(`#${k}-n`).value = estado.p1[k];
  }
}

function actualizarP1() {
  const p = estado.p1;
  const error = validos(p);
  $("#error-p1").textContent = error;
  if (error) return;

  const par = parametros(p);
  const sim = Cole.simular(par, frecuencias());
  const zc = Cole.impedancia(par.fcHz, par);
  const color = css("--acento");

  // Las referencias se recalculan con el rango y la convención actuales
  const fs = frecuencias();
  const refs = estado.referencias.map((r, i) => ({
    nombre: `Ref. ${i + 1} (${r.R0}/${r.Rinf} Ω, ${r.fc} kHz, α ${r.alpha})`,
    color: COLORES_REF[i],
    z: Cole.simular(parametros(r), fs),
  }));

  g1Nyq.data.datasets = [
    ...refs.map((r) => ({ ...curva(r.nombre, r.color, r.z.map((q) => ({ x: q.R, y: -q.X, f: q.f }))), borderWidth: 1.6 })),
    curva("Actual", color, sim.map((z) => ({ x: z.R, y: -z.X, f: z.f }))),
    marcador("f = fc", "#d9532a", { x: zc.R, y: -zc.X, f: zc.f }),
  ];
  escalaIgual(g1Nyq, techo(Math.max(p.R0, ...estado.referencias.map((r) => r.R0))));
  g1Nyq.update("none");

  g1Frec.data.datasets = [
    ...refs.flatMap((r) => [
      { ...curva(r.nombre, r.color, r.z.map((q) => ({ x: q.f, y: q.R }))), borderWidth: 1.6 },
      { ...curva(`${r.nombre} −X`, r.color, r.z.map((q) => ({ x: q.f, y: -q.X })), true), borderWidth: 1.6 },
    ]),
    curva("R actual", color, sim.map((z) => ({ x: z.f, y: z.R }))),
    curva("−X actual", "#d9532a", sim.map((z) => ({ x: z.f, y: -z.X })), true),
  ];
  g1Frec.options.plugins.legend.labels.filter = (item) => !/^Ref\..* −X$/.test(item.text);
  g1Frec.options.scales.x.min = estado.fmin;
  g1Frec.options.scales.x.max = estado.fmax;
  g1Frec.update("none");

  const tau = Cole.tauDesdeFc(par.fcHz);
  $("#l-tau").textContent = `${(tau * 1e6).toPrecision(4)} µs`;
  $("#l-z").textContent = `${zc.R.toFixed(1)} ${zc.X < 0 ? "−" : "+"} j${Math.abs(zc.X).toFixed(1)} Ω`;
  $("#l-mod").textContent = fmtOhm(zc.modulo);
  $("#l-fase").textContent = `${zc.faseGrados.toFixed(2)}°`;

  // Circuito equivalente: Re = R0 (camino de afuera) y R∞ = Re ∥ Ri (los dos caminos en paralelo)
  const Re = p.R0;
  const Ri = (p.R0 * p.Rinf) / (p.R0 - p.Rinf);
  $("#l-re").textContent = fmtOhm(Re);
  $("#l-ri").textContent = fmtOhm(Ri);
}

function iniciarP1() {
  const sel = $("#precarga");
  estado.tejidos.forEach((t, i) => sel.add(new Option(t.nombre, i)));
  sel.addEventListener("change", () => {
    if (sel.value === "") return;
    const t = estado.tejidos[+sel.value];
    for (const k of CAMPOS) estado.p1[k] = t[k];
    escribirControles();
    actualizarP1();
  });

  for (const k of CAMPOS) {
    const barra = $(`#${k}-r`);
    const numero = $(`#${k}-n`);
    barra.addEventListener("input", () => {
      estado.p1[k] = +barra.value;
      numero.value = barra.value;
      sel.value = "";
      actualizarP1();
    });
    numero.addEventListener("input", () => {
      estado.p1[k] = numero.value === "" ? NaN : +numero.value;
      if (Number.isFinite(estado.p1[k])) barra.value = estado.p1[k];
      sel.value = "";
      actualizarP1();
    });
  }
  sel.value = "0";
  escribirControles();
}

// ---------- Punto 2 ----------
function dibujarTabla() {
  const cuerpo = $("#tabla tbody");
  cuerpo.innerHTML = "";
  estado.tejidos.forEach((t, i) => {
    const fila = document.createElement("tr");
    fila.className = t.visible ? "" : "oculto";
    fila.innerHTML = `
      <td><input type="checkbox" ${t.visible ? "checked" : ""} aria-label="Mostrar ${t.nombre}" data-i="${i}" data-k="visible"></td>
      <td><span class="nombre"><span class="muestra" style="background:${t.color}"></span>${t.nombre}</span></td>
      ${CAMPOS.map((k) => `<td><input type="number" step="any" value="${t[k]}" aria-label="${k} de ${t.nombre}" data-i="${i}" data-k="${k}"></td>`).join("")}
    `;
    cuerpo.appendChild(fila);
  });
}

function actualizarP2() {
  const fs = frecuencias();
  const errores = [];
  const visibles = estado.tejidos.filter((t) => {
    if (!t.visible) return false;
    const e = validos(t);
    if (e) errores.push(`${t.nombre}: ${e}`);
    return !e;
  });
  $("#error-p2").textContent = errores.join(" ");

  const sims = visibles.map((t) => ({ t, z: Cole.simular(parametros(t), fs) }));

  g2Nyq.data.datasets = sims.flatMap(({ t, z }) => {
    const par = parametros(t);
    const zc = Cole.impedancia(par.fcHz, par);
    return [
      curva(t.nombre, t.color, z.map((q) => ({ x: q.R, y: -q.X, f: q.f }))),
      { ...marcador(`${t.nombre} en fc`, t.color, { x: zc.R, y: -zc.X, f: zc.f }), pointRadius: 4 },
    ];
  });
  const r0max = Math.max(100, ...visibles.map((t) => t.R0));
  escalaIgual(g2Nyq, techo(r0max));
  g2Nyq.options.plugins.legend.labels.filter = (item) => !item.text.endsWith("en fc");
  g2Nyq.update("none");

  g2R.data.datasets = sims.map(({ t, z }) => curva(t.nombre, t.color, z.map((q) => ({ x: q.f, y: q.R }))));
  g2X.data.datasets = sims.map(({ t, z }) => curva(t.nombre, t.color, z.map((q) => ({ x: q.f, y: -q.X }))));
  for (const g of [g2R, g2X]) {
    g.options.scales.x.min = estado.fmin;
    g.options.scales.x.max = estado.fmax;
    g.update("none");
  }
}

function descargarCSV() {
  const fs = frecuencias();
  const visibles = estado.tejidos.filter((t) => t.visible && !validos(t));
  if (!visibles.length) {
    $("#error-p2").textContent = "Activá al menos un tejido con valores válidos para descargar los datos.";
    return;
  }
  const sims = visibles.map((t) => Cole.simular(parametros(t), fs));
  const cab = ["f_Hz", ...visibles.flatMap((t) => [`R_${t.nombre} [ohm]`, `X_${t.nombre} [ohm]`])];
  const filas = fs.map((f, i) => [f.toPrecision(8), ...sims.flatMap((z) => [z[i].R.toFixed(6), z[i].X.toFixed(6)])]);
  const texto = [cab, ...filas].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob(["\ufeff" + texto], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "tp6_modelo_cole.csv" });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function iniciarP2() {
  dibujarTabla();
  $("#tabla").addEventListener("input", (e) => {
    const el = e.target;
    if (!el.dataset.k) return;
    const t = estado.tejidos[+el.dataset.i];
    if (el.dataset.k === "visible") {
      t.visible = el.checked;
      el.closest("tr").className = t.visible ? "" : "oculto";
    } else {
      t[el.dataset.k] = el.value === "" ? NaN : +el.value;
    }
    actualizarP2();
  });
  $("#restaurar").addEventListener("click", () => {
    estado.tejidos = TABLA_1.map((t) => ({ ...t, visible: true }));
    dibujarTabla();
    actualizarP2();
  });
  $("#csv").addEventListener("click", descargarCSV);
}

// ---------- Opciones globales ----------
function iniciarOpciones() {
  document.querySelectorAll('input[name="convencion"]').forEach((r) =>
    r.addEventListener("change", () => {
      estado.convencion = r.value;
      actualizarTodo();
    })
  );
  const leerRango = () => {
    const a = +$("#fmin").value;
    const b = +$("#fmax").value;
    if (!(a > 0) || !(b > 0) || a >= b) {
      $("#error-rango").textContent = "El rango tiene que cumplir 0 < desde < hasta.";
      return;
    }
    $("#error-rango").textContent = "";
    estado.fmin = a;
    estado.fmax = b;
    actualizarTodo();
  };
  $("#fmin").addEventListener("input", leerRango);
  $("#fmax").addEventListener("input", leerRango);
}

function actualizarTodo() {
  actualizarP1();
  actualizarP2();
}

// ---------- Arranque ----------
document.addEventListener("DOMContentLoaded", () => {
  if (typeof Chart === "undefined") {
    document.querySelectorAll(".lienzo").forEach((d) => {
      d.innerHTML = '<p class="error">No se pudo cargar Chart.js. Revisá la conexión a internet y recargá la página.</p>';
    });
    return;
  }
  configurarChart();
  g1Nyq = graficoNyquist("#g1-nyquist");
  g1Frec = graficoFrecuencia("#g1-frec", "Ω");
  g2Nyq = graficoNyquist("#g2-nyquist");
  g2R = graficoFrecuencia("#g2-r", "R [Ω]");
  g2X = graficoFrecuencia("#g2-x", "−X [Ω]");

  iniciarOpciones();
  iniciarP1();
  iniciarReferencias();
  iniciarP2();
  actualizarTodo();
  // Segunda pasada: el área real de cada gráfico ya está medida y la escala queda pareja.
  requestAnimationFrame(actualizarTodo);

  let espera;
  window.addEventListener("resize", () => {
    clearTimeout(espera);
    espera = setTimeout(actualizarTodo, 150);
  });
});