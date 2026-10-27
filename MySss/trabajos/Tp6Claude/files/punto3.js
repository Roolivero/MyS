/*
 * Interfaz del punto 3: mediciones reales + ajuste del Modelo de Cole.
 * Usa BARRIDOS (datos-punto3.js), Ajuste (ajuste.js) y las utilidades de app.js.
 */
(() => {
  const P3 = {
    actual: 0,
    // Parámetros que muestra cada barrido (empiezan "a ojo", el usuario los mueve o los ajusta)
    params: BARRIDOS.map((b) => ({ ...Ajuste.inicial(b) })),
    validacion: BARRIDOS.map(() => null),
    resultados: BARRIDOS.map(() => null),
  };
  let gNyq, gFrec;

  const barrido = () => BARRIDOS[P3.actual];
  const fmtNum = (v, d = 1) => v.toLocaleString("es-AR", { minimumFractionDigits: d, maximumFractionDigits: d });

  function calidad(nrmse) {
    if (nrmse < 2) return ["muy-bueno", "Muy bueno: la curva pasa casi por encima de los puntos."];
    if (nrmse < 5) return ["bueno", "Bueno: el modelo sigue bien la forma de la medición."];
    if (nrmse < 10) return ["regular", "Regular: se parece, pero hay diferencias visibles."];
    return ["malo", "No ajusta: el modelo no describe esta medición."];
  }

  // ---------- Controles ----------
  function rangos() {
    const b = barrido();
    const fmin = Math.min(...b.f);
    const fmax = Math.max(...b.f);
    const rmax = Math.ceil((Math.max(...b.R) * 2) / 50) * 50;
    $("#p3-R0-r").max = rmax;
    $("#p3-Rinf-r").max = rmax;
    $("#p3-fc-r").min = Math.log10(fmin / 100).toFixed(2);
    $("#p3-fc-r").max = Math.log10(fmax * 100).toFixed(2);
  }

  function escribirControles() {
    const p = P3.params[P3.actual];
    $("#p3-R0-r").value = p.R0;
    $("#p3-R0-n").value = +p.R0.toFixed(2);
    $("#p3-Rinf-r").value = p.Rinf;
    $("#p3-Rinf-n").value = +p.Rinf.toFixed(2);
    $("#p3-fc-r").value = Math.log10(p.fcHz);
    $("#p3-fc-n").value = +p.fcHz.toPrecision(5);
    $("#p3-alpha-r").value = p.alpha;
    $("#p3-alpha-n").value = +p.alpha.toFixed(3);
  }

  function vincularControles() {
    const campos = [
      ["R0", (v) => v, (v) => v],
      ["Rinf", (v) => v, (v) => v],
      ["fc", (v) => 10 ** v, (v) => Math.log10(v)], // la barra de fc es logarítmica
      ["alpha", (v) => v, (v) => v],
    ];
    for (const [k, deBarra, aBarra] of campos) {
      const clave = k === "fc" ? "fcHz" : k;
      const barra = $(`#p3-${k}-r`);
      const numero = $(`#p3-${k}-n`);
      barra.addEventListener("input", () => {
        const v = deBarra(+barra.value);
        P3.params[P3.actual][clave] = v;
        numero.value = k === "fc" ? +v.toPrecision(4) : +v.toFixed(k === "alpha" ? 2 : 1);
        P3.validacion[P3.actual] = null;
        actualizar();
      });
      numero.addEventListener("input", () => {
        const v = numero.value === "" ? NaN : +numero.value;
        P3.params[P3.actual][clave] = v;
        if (Number.isFinite(v) && v > 0) barra.value = aBarra(v);
        P3.validacion[P3.actual] = null;
        actualizar();
      });
    }
  }

  // ---------- Gráficos ----------
  // Cole-Cole con la misma escala en los dos ejes, incluyendo puntos con −X negativa.
  function escalaNyquist(puntos) {
    const xs = puntos.map((q) => q.x);
    const ys = puntos.map((q) => q.y);
    let xmin = Math.min(...xs);
    let xmax = Math.max(...xs);
    const ymin = Math.min(0, ...ys);
    const ymax = Math.max(...ys);
    const margen = (xmax - xmin) * 0.06 || 10;
    xmin = Math.max(0, xmin - margen);
    xmax += margen;
    const area = gNyq.chartArea;
    const rel = area ? area.height / area.width : 0.5;
    const alto = (ymax - ymin) * 1.12 || 10;
    if (alto > (xmax - xmin) * rel) xmax = xmin + alto / rel;
    const s = gNyq.options.scales;
    s.x.min = xmin;
    s.x.max = xmax;
    s.y.min = ymin < 0 ? ymin * 1.12 : 0;
    s.y.max = s.y.min + (xmax - xmin) * rel;
  }

  function actualizar() {
    const b = barrido();
    const p = P3.params[P3.actual];
    const valido = [p.R0, p.Rinf, p.fcHz, p.alpha].every(Number.isFinite) && p.Rinf > 0 && p.R0 > p.Rinf && p.fcHz > 0 && p.alpha > 0 && p.alpha <= 1;
    $("#error-p3").textContent = valido ? "" : "Revisá los valores: R0 > R∞ > 0, fc > 0 y α entre 0 y 1.";

    const medR = b.f.map((f, i) => ({ x: b.R[i], y: -b.X[i], f }));
    const sets = [{ ...curva("Medición", css("--tinta-2"), medR), showLine: false, pointRadius: 2.6, pointBackgroundColor: css("--tinta-2") }];
    const setsF = [
      { ...curva("R medida", "#0e6e6a", b.f.map((f, i) => ({ x: f, y: b.R[i] }))), showLine: false, pointRadius: 2.4, pointBackgroundColor: css("--acento") },
      { ...curva("−X medida", "#d9532a", b.f.map((f, i) => ({ x: f, y: -b.X[i] }))), showLine: false, pointRadius: 2.4, pointBackgroundColor: "#d9532a" },
    ];
    let puntos = [...medR];

    if (valido) {
      const fmin = Math.min(...b.f);
      const fmax = Math.max(...b.f);
      const mod = Cole.logspace(fmin, fmax, 300).map((f) => ({ f, ...Ajuste.modelo(f, p) }));
      const modN = mod.map((z) => ({ x: z.R, y: -z.X, f: z.f }));
      sets.push(curva("Modelo de Cole", css("--acento"), modN));
      if (p.fcHz >= fmin && p.fcHz <= fmax) {
        const zc = Ajuste.modelo(p.fcHz, p);
        sets.push(marcador("f = fc", "#d9532a", { x: zc.R, y: -zc.X, f: p.fcHz }));
      }
      setsF.push(curva("R modelo", css("--acento"), mod.map((z) => ({ x: z.f, y: z.R }))));
      setsF.push(curva("−X modelo", "#d9532a", mod.map((z) => ({ x: z.f, y: -z.X })), true));
      puntos = puntos.concat(modN);

      const e = Ajuste.errores(b, p);
      const [clase, texto] = calidad(e.nrmse);
      $("#p3-nrmse").textContent = `${fmtNum(e.nrmse, 1)} %`;
      $("#p3-calidad").className = `calidad ${clase}`;
      $("#p3-calidad").textContent = texto;
      $("#p3-rmse").textContent = `${fmtNum(e.rmse, 1)} Ω`;
      $("#p3-tau").textContent = `${(1e6 / (2 * Math.PI * p.fcHz)).toPrecision(4)} µs`;
      const v = P3.validacion[P3.actual];
      $("#p3-val").textContent = v ? `${fmtNum(v.nrmse, 1)} %` : "–";
      const enLimite = p.alpha > 0.999;
      $("#p3-limite").textContent = enLimite ? "α quedó en el límite de 1: el ajuste \"quería\" ir más allá de lo físicamente posible." : "";
    }

    gNyq.data.datasets = sets;
    escalaNyquist(puntos);
    gNyq.update("none");

    gFrec.data.datasets = setsF;
    gFrec.options.scales.x.min = Math.min(...b.f);
    gFrec.options.scales.x.max = Math.max(...b.f);
    gFrec.update("none");
  }

  // ---------- Ficha del barrido ----------
  function mostrarFicha() {
    const b = barrido();
    $("#p3-ficha").innerHTML = `
      <div><dt>Tipo de muestra</dt><dd>${b.tipo}</dd></div>
      <div><dt>Equipo</dt><dd>${b.equipo}</dd></div>
      <div><dt>Electrodos</dt><dd>${b.electrodos}</dd></div>
      <div><dt>Frecuencias</dt><dd>${b.f.length}, de ${fmtHz(Math.min(...b.f))} a ${fmtHz(Math.max(...b.f))}</dd></div>
      <div><dt>Origen</dt><dd>${b.fuente}</dd></div>
      ${b.conversion ? `<div class="nota-ficha"><dt>Nota</dt><dd>${b.conversion}</dd></div>` : ""}`;
    document.querySelectorAll(".selector-barrido button").forEach((btn, i) => btn.setAttribute("aria-pressed", i === P3.actual));
  }

  function seleccionar(i) {
    P3.actual = i;
    mostrarFicha();
    rangos();
    escribirControles();
    actualizar();
  }

  // ---------- Ajuste automático ----------
  function ajusteAutomatico() {
    const btn = $("#p3-ajustar");
    btn.textContent = "Ajustando…";
    btn.disabled = true;
    setTimeout(() => {
      const b = barrido();
      const r = Ajuste.ajustar(b);
      P3.params[P3.actual] = { R0: r.R0, Rinf: r.Rinf, fcHz: r.fcHz, alpha: r.alpha };
      P3.validacion[P3.actual] = Ajuste.validar(b);
      escribirControles();
      actualizar();
      btn.textContent = "Ajuste automático";
      btn.disabled = false;
    }, 30);
  }

  // ---------- Tabla con los tres ajustes ----------
  function tablaResultados() {
    const cuerpo = $("#p3-tabla tbody");
    cuerpo.innerHTML = BARRIDOS.map((b, i) => {
      const r = P3.resultados[i];
      if (!r) return `<tr><td>${b.tipo} (ID ${b.id})</td><td colspan="7">Calculando…</td></tr>`;
      const [clase] = calidad(r.ajuste.nrmse);
      return `<tr>
        <td>${b.tipo} (ID ${b.id})</td>
        <td>${fmtNum(r.ajuste.R0)}</td>
        <td>${fmtNum(r.ajuste.Rinf)}</td>
        <td>${fmtHz(r.ajuste.fcHz)}</td>
        <td>${fmtNum(r.ajuste.alpha, 2)}${r.ajuste.enLimite ? " (límite)" : ""}</td>
        <td><span class="calidad ${clase}">${fmtNum(r.ajuste.nrmse, 1)} %</span></td>
        <td>${fmtNum(r.val.nrmse, 1)} %</td>
      </tr>`;
    }).join("");
  }

  function calcularTodos(i = 0) {
    if (i >= BARRIDOS.length) return;
    setTimeout(() => {
      P3.resultados[i] = { ajuste: Ajuste.ajustar(BARRIDOS[i]), val: Ajuste.validar(BARRIDOS[i]) };
      tablaResultados();
      calcularTodos(i + 1);
    }, 20);
  }

  // ---------- Arranque ----------
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof Chart === "undefined" || typeof BARRIDOS === "undefined") return;
    gNyq = graficoNyquist("#g3-nyquist");
    gFrec = graficoFrecuencia("#g3-frec", "Ω");
    gFrec.options.scales.y.min = undefined;
    gNyq.options.scales.y.min = undefined;
    // Sin etiquetas en los bordes (los límites de los ejes no son números redondos)
    gNyq.options.scales.x.ticks = { includeBounds: false };
    gNyq.options.scales.y.ticks = { includeBounds: false };

    const sel = $(".selector-barrido");
    BARRIDOS.forEach((b, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerHTML = `${b.tipo}<small>ID ${b.id}</small>`;
      btn.addEventListener("click", () => seleccionar(i));
      sel.appendChild(btn);
    });

    vincularControles();
    $("#p3-ajustar").addEventListener("click", ajusteAutomatico);
    $("#p3-reiniciar").addEventListener("click", () => {
      P3.params[P3.actual] = { ...Ajuste.inicial(barrido()) };
      P3.validacion[P3.actual] = null;
      escribirControles();
      actualizar();
    });

    seleccionar(0);
    requestAnimationFrame(actualizar);
    tablaResultados();
    calcularTodos();

    let espera;
    window.addEventListener("resize", () => {
      clearTimeout(espera);
      espera = setTimeout(actualizar, 150);
    });
  });
})();
