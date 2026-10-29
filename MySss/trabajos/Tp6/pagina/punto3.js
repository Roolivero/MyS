/*
 * Interfaz del punto 3: ¿qué modelo describe mejor la base de datos?
 * Usa RESUMEN_BASE (resumen-punto3.js), BARRIDOS (datos-punto3.js),
 * Modelos (modelos.js) y las utilidades de app.js.
 */
(() => {
  const COLOR = { debye: "#8c9997", cole: "#0e6e6a", cole_td: "#d9932a", hn: "#7b4fa3", cole2: "#c0462f", ayllon: "#3a7ca5" };
  const ELEGIDO = "cole2";
  const CORTO = { hum_ok: ["Humana", "sin errores"], hum_err: ["Humana", "con errores"], hum_gc: ["Humana", "G. Correa"], hum_dl: ["Humana", "De Lorenzo"], veg: "Vegetal", fan: "Fantoma" };
  const fmtNum = (v, d = 1) => v.toLocaleString("es-AR", { minimumFractionDigits: d, maximumFractionDigits: d });
  const nombre = (id) => Modelos.POR_ID[id].nombre;
  const fmtTau = (t) => (t < 1e-3 ? `${fmtNum(t * 1e6, 2)} µs` : `${fmtNum(t * 1e3, 2)} ms`);

  const estado = {
    actual: 0,
    visibles: new Set(["ayllon", "cole", "cole_td", "cole2"]),
    cache: {}, // ajustes ya calculados por barrido
  };
  let gNyq, gR, gX;

  // ---------- Tarjetas de los modelos ----------
  function tarjetas() {
    $("#p3-modelos").innerHTML = Modelos.LISTA.map((m) => `
      <article class="tarjeta-modelo${m.id === ELEGIDO ? " elegido" : ""}" style="--color:${COLOR[m.id]}">
        <h4>${m.nombre}${m.id === ELEGIDO ? " <span class=\"etiqueta-elegido\">elegido</span>" : ""}</h4>
        <p class="parametros">${m.k} parámetros: ${m.params.map((p) => p[0]).join(", ")}</p>
        <p>${m.desc}</p>
      </article>`).join("");
  }

  // ---------- Resultado en la base (precalculado en Python) ----------
  function resultadoBase() {
    const R = RESUMEN_BASE;
    $("#p3-veredicto-texto").innerHTML = `En la submuestra (${R.totalAjustados} barridos ajustados), <b>Cole doble</b> es el mejor modelo en el ${fmtNum(R.ganaTotal.cole2, 0)} % de los barridos y es el único que ajusta bien en todos los grupos: su error típico nunca pasa del ${fmtNum(R.peorMediana.cole2, 1)} %. El segundo, <b>Cole con retardo</b>, gana en el ${fmtNum(R.ganaTotal.cole_td, 0)} % (sobre todo en mediciones humanas), pero en los vegetales su error llega al ${fmtNum(R.peorMediana.cole_td, 0)} %.`;

    const ids = Modelos.LISTA.map((m) => m.id);
    new Chart($("#g3-gana"), {
      type: "bar",
      data: {
        labels: ids.map(nombre),
        datasets: [{ data: ids.map((id) => R.ganaTotal[id]), backgroundColor: ids.map((id) => COLOR[id]), borderRadius: 4 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `Gana en el ${fmtNum(c.parsed.y, 1)} % de los barridos` } } },
        scales: { y: { min: 0, max: 100, title: { display: true, text: "% de barridos donde gana" } }, x: { grid: { display: false } } },
      },
    });

    const grupos = R.grupos.filter((g) => g.modelos);
    new Chart($("#g3-error"), {
      type: "bar",
      data: {
        labels: grupos.map((g) => CORTO[g.id] || g.nombre),
        datasets: ids.map((id) => ({ label: nombre(id), data: grupos.map((g) => g.modelos[id].nrmse), backgroundColor: COLOR[id], borderRadius: 2 })),
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: {
          legend: { labels: { boxWidth: 12, boxHeight: 12 } },
          tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${fmtNum(c.parsed.y, 2)} %` } },
        },
        scales: {
          y: {
            type: "logarithmic", min: 0.1, max: 100,
            title: { display: true, text: "Error típico (mediana, %), escala log" },
            ticks: { callback: (v) => ([0.1, 1, 10, 100].includes(v) ? `${v} %` : "") },
          },
          x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: false, font: { size: 11 } } },
        },
      },
    });

    $("#p3-tabla-base tbody").innerHTML = R.grupos.map((g) => {
      if (!g.modelos) {
        return `<tr><td>${g.nombre}</td><td>${g.enBase} / 0</td><td colspan="4" class="excluido">Excluido: ${g.excluido}</td></tr>`;
      }
      const gan = ids.reduce((a, b) => (g.modelos[b].gana > g.modelos[a].gana ? b : a));
      return `<tr>
        <td>${g.nombre}</td>
        <td>${g.enBase} / ${g.ajustados}</td>
        <td><span class="punto-modelo" style="background:${COLOR[gan]}"></span>${nombre(gan)} (${fmtNum(g.modelos[gan].gana, 0)} %)</td>
        <td>${fmtNum(g.modelos.cole.nrmse, 2)} %</td>
        <td>${fmtNum(g.modelos.cole2.nrmse, 2)} %</td>
        <td>${fmtNum(g.modelos.cole2.val, 2)} %</td>
      </tr>`;
    }).join("");
  }

  // ---------- Explorador de un barrido ----------
  function selector() {
    const sel = $(".selector-barrido");
    const grupos = [...new Set(BARRIDOS.map((b) => b.grupoNombre))];
    sel.innerHTML = "";
    for (const g of grupos) {
      const div = document.createElement("div");
      div.className = "grupo-barrido";
      div.innerHTML = `<span class="etq-grupo">${g}</span>`;
      BARRIDOS.forEach((b, i) => {
        if (b.grupoNombre !== g) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = `ID ${b.id}`;
        btn.dataset.i = i;
        btn.addEventListener("click", () => seleccionar(i));
        div.appendChild(btn);
      });
      sel.appendChild(div);
    }
    const opciones = [{ id: "ayllon", nombre: "Ayllon (sin iterar)" }, ...Modelos.LISTA];
    $("#p3-casillas").innerHTML = opciones.map((m) => `
      <label><input type="checkbox" value="${m.id}" ${estado.visibles.has(m.id) ? "checked" : ""}>
      <span class="punto-modelo" style="background:${COLOR[m.id]}"></span>${m.nombre}</label>`).join("");
    $("#p3-casillas").addEventListener("change", (e) => {
      if (e.target.checked) estado.visibles.add(e.target.value);
      else estado.visibles.delete(e.target.value);
      dibujar();
    });
  }

  function ficha() {
    const b = BARRIDOS[estado.actual];
    $("#p3-ficha").innerHTML = `
      <div><dt>Grupo</dt><dd>${b.grupoNombre}</dd></div>
      <div><dt>Equipo</dt><dd>${b.equipo}</dd></div>
      <div><dt>Electrodos</dt><dd>${b.electrodos}</dd></div>
      <div><dt>Frecuencias</dt><dd>${b.f.length}, de ${fmtHz(Math.min(...b.f))} a ${fmtHz(Math.max(...b.f))}</dd></div>
      <div><dt>Origen</dt><dd>${b.fuente}</dd></div>
      ${b.conversion ? `<div class="nota-ficha"><dt>Datos normalizados</dt><dd>${b.conversion}</dd></div>` : ""}`;
    document.querySelectorAll(".selector-barrido button").forEach((btn) => btn.setAttribute("aria-pressed", +btn.dataset.i === estado.actual));
  }

  function seleccionar(i) {
    estado.actual = i;
    ficha();
    const b = BARRIDOS[i];
    if (estado.cache[b.id]) { dibujar(); return; }
    $("#p3-estado").textContent = "Ajustando los cinco modelos…";
    $("#p3-tabla-barrido tbody").innerHTML = "";
    dibujar();
    setTimeout(() => {
      estado.cache[b.id] = Modelos.ajustarTodos(b);
      $("#p3-estado").textContent = "";
      if (estado.actual === i) dibujar();
    }, 30);
  }

  function escalaNyquist(chart, puntos) {
    const xs = puntos.map((q) => q.x);
    const ys = puntos.map((q) => q.y);
    let xmin = Math.min(...xs);
    let xmax = Math.max(...xs);
    const ymin = Math.min(0, ...ys);
    const ymax = Math.max(...ys);
    const margen = (xmax - xmin) * 0.06 || 10;
    xmin = Math.max(0, xmin - margen);
    xmax += margen;
    const area = chart.chartArea;
    const rel = area ? area.height / area.width : 0.5;
    const alto = (ymax - ymin) * 1.12 || 10;
    if (alto > (xmax - xmin) * rel) xmax = xmin + alto / rel;
    const s = chart.options.scales;
    s.x.min = xmin; s.x.max = xmax;
    s.y.min = ymin < 0 ? ymin * 1.12 : 0;
    s.y.max = s.y.min + (xmax - xmin) * rel;
  }

  function dibujar() {
    const b = BARRIDOS[estado.actual];
    const ajustes = estado.cache[b.id];
    const gris = css("--tinta-2");
    const medN = b.f.map((f, i) => ({ x: b.R[i], y: -b.X[i], f }));
    const punto = (label, data) => ({ ...curva(label, gris, data), showLine: false, pointRadius: 2.4, pointBackgroundColor: gris });

    const setsN = [punto("Medición", medN)];
    const setsR = [punto("Medición", b.f.map((f, i) => ({ x: f, y: b.R[i] })))];
    const setsX = [punto("Medición", b.f.map((f, i) => ({ x: f, y: -b.X[i] })))];
    let todos = [...medN];

    if (ajustes) {
      const fs = Cole.logspace(Math.min(...b.f), Math.max(...b.f), 300);
      const ay = Modelos.ayllon(b);
      if (ay && ay.valido && estado.visibles.has("ayllon")) {
        const z = fs.map((f) => ({ f, ...Modelos.evaluar("cole", f, ay.p) }));
        const n = z.map((q) => ({ x: q.re, y: -q.im, f: q.f }));
        const etq = "Ayllon (sin iterar)";
        setsN.push(curva(etq, COLOR.ayllon, n, true));
        setsR.push(curva(etq, COLOR.ayllon, z.map((q) => ({ x: q.f, y: q.re })), true));
        setsX.push(curva(etq, COLOR.ayllon, z.map((q) => ({ x: q.f, y: -q.im })), true));
        todos = todos.concat(n);
      }
      tablaAyllon(b, ay, ajustes);
      for (const a of ajustes) {
        if (!estado.visibles.has(a.id)) continue;
        const z = fs.map((f) => ({ f, ...Modelos.evaluar(a.id, f, a.p) }));
        const n = z.map((q) => ({ x: q.re, y: -q.im, f: q.f }));
        const ancho = a.id === ELEGIDO ? 2.8 : 1.8;
        setsN.push({ ...curva(nombre(a.id), COLOR[a.id], n), borderWidth: ancho });
        setsR.push({ ...curva(nombre(a.id), COLOR[a.id], z.map((q) => ({ x: q.f, y: q.re }))), borderWidth: ancho });
        setsX.push({ ...curva(nombre(a.id), COLOR[a.id], z.map((q) => ({ x: q.f, y: -q.im }))), borderWidth: ancho });
        todos = todos.concat(n);
      }
      tablaBarrido(ajustes);
    }

    gNyq.data.datasets = setsN;
    escalaNyquist(gNyq, todos);
    gNyq.update("none");
    for (const [g, sets] of [[gR, setsR], [gX, setsX]]) {
      g.data.datasets = sets;
      g.options.scales.x.min = Math.min(...b.f);
      g.options.scales.x.max = Math.max(...b.f);
      g.update("none");
    }
  }

  function tablaBarrido(ajustes) {
    const mejor = ajustes.reduce((a, b) => (b.bic < a.bic ? b : a));
    $("#p3-tabla-barrido tbody").innerHTML = ajustes.map((a) => {
      const m = Modelos.POR_ID[a.id];
      return `<tr class="${a.id === mejor.id ? "ganador" : ""}">
        <td><span class="punto-modelo" style="background:${COLOR[a.id]}"></span>${m.nombre}</td>
        <td>${m.k}</td>
        <td>${fmtNum(a.nrmse, 2)} %</td>
        <td>${fmtNum(a.bic, 0)}</td>
        <td>${a.id === mejor.id ? "Mejor para este barrido" : ""}</td>
      </tr>`;
    }).join("");
  }

  // ---------- Valores de Cole: Ayllon, Cole ajustado y Cole doble ----------
  function tablaAyllon(b, ay, ajustes) {
    const cole = ajustes.find((a) => a.id === "cole");
    const doble = ajustes.find((a) => a.id === "cole2");
    const ohm = (v) => `${fmtNum(v, 1)} Ω`;
    const celda = (id, txt) => `<td><span class="punto-modelo" style="background:${COLOR[id]}"></span>${txt}</td>`;
    const filas = [];

    if (ay && ay.valido) {
      const err = Modelos.metricas(Modelos.POR_ID.cole, b, ay.p).nrmse;
      filas.push(`<tr>${celda("ayllon", "Ayllon (circunferencia, sin iterar)")}
        <td>${ohm(ay.Rinf)}</td><td>${ohm(ay.R0)}</td><td>${fmtHz(ay.fc)}</td><td>${fmtTau(ay.tau)}</td>
        <td>${fmtNum(ay.alpha, 3)}</td><td>${fmtNum(err, 2)} %</td></tr>`);
    } else {
      filas.push(`<tr>${celda("ayllon", "Ayllon (circunferencia, sin iterar)")}
        <td colspan="6" class="excluido">La circunferencia no corta el eje real: el método no da valores para este barrido.</td></tr>`);
    }

    const [Ri, dR, lfc, a] = cole.p;
    filas.push(`<tr>${celda("cole", "Cole ajustado (arranca desde Ayllon)")}
      <td>${ohm(Ri)}</td><td>${ohm(Ri + dR)}</td><td>${fmtHz(10 ** lfc)}</td><td>${fmtTau(1 / (2 * Math.PI * 10 ** lfc))}</td>
      <td>${fmtNum(a, 3)}</td><td>${fmtNum(cole.nrmse, 2)} %</td></tr>`);

    const [Ri2, d1, l1, a1, d2, l2, a2] = doble.p;
    filas.push(`<tr>${celda("cole2", "Cole doble (arranca desde Cole)")}
      <td>${ohm(Ri2)}</td><td>ΔR₁ = ${ohm(d1)}, ΔR₂ = ${ohm(d2)}</td>
      <td>${fmtHz(10 ** l1)} y ${fmtHz(10 ** l2)}</td>
      <td>${fmtTau(1 / (2 * Math.PI * 10 ** l1))} y ${fmtTau(1 / (2 * Math.PI * 10 ** l2))}</td>
      <td>${fmtNum(a1, 3)} y ${fmtNum(a2, 3)}</td><td>${fmtNum(doble.nrmse, 2)} %</td></tr>`);

    $("#p3-tabla-ayllon tbody").innerHTML = filas.join("");
    $("#p3-nota-ayllon").textContent = "τ = 1 / (2π·fc). En Ayllon, fc es la frecuencia medida donde −X es máxima, así que solo puede tomar una de las frecuencias del barrido. En Cole doble hay dos lomas: se muestran los valores de cada una y, en lugar de R0, el tamaño de cada loma (ΔR₂ puede ser negativo). Cuando el barrido tiene dos lomas (vegetales), los valores de Ayllon y de Cole son un Cole equivalente que resume las dos en una sola.";
  }

  // ---------- Arranque ----------
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof Chart === "undefined" || typeof BARRIDOS === "undefined") return;
    tarjetas();
    resultadoBase();

    gNyq = graficoNyquist("#g3-nyquist");
    gNyq.options.scales.y.min = undefined;
    gNyq.options.scales.x.ticks = { includeBounds: false };
    gNyq.options.scales.y.ticks = { includeBounds: false };
    gR = graficoFrecuencia("#g3-r", "R [Ω]");
    gX = graficoFrecuencia("#g3-x", "−X [Ω]");
    gR.options.scales.y.min = undefined;
    gX.options.scales.y.min = undefined;

    selector();
    seleccionar(BARRIDOS.findIndex((b) => b.id === "1246"));

    let espera;
    window.addEventListener("resize", () => {
      clearTimeout(espera);
      espera = setTimeout(dibujar, 150);
    });
  });
})();