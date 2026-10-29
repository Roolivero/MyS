/*
 * Punto 3: ajusta los cinco modelos a TODOS los barridos de la base y genera los archivos
 * que usa la página:
 *   pagina/resumen-punto3.js   resumen por grupo (gana, error mediano, otra mitad, Ayllon)
 *   pagina/barridos/<grupo>.js datos y parámetros ajustados de cada barrido del grupo
 *
 * Usa el mismo modelos.js que la página, así que los números coinciden con el explorador.
 * Uso, desde la carpeta Tp6:   node herramientas/calcular-base.js
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");

const Modelos = require("../pagina/modelos.js");

// ---------- Trabajo de cada hilo: ajustar un lote de barridos ----------
function ajustarBarrido(b) {
  const ajustes = Modelos.ajustarTodos(b);

  // Prueba con la otra mitad: se ajusta con los puntos pares y se mide el error en los impares
  const mitad = (paridad) => {
    const idx = b.f.map((_, i) => i).filter((i) => i % 2 === paridad);
    return { f: idx.map((i) => b.f[i]), R: idx.map((i) => b.R[i]), X: idx.map((i) => b.X[i]) };
  };
  const pares = mitad(0);
  const impares = mitad(1);
  const ajustesPares = Modelos.ajustarTodos(pares);

  const ay = Modelos.ayllon(b);
  const resultado = { id: b.id, grupo: b.grupo, modelos: {} };
  for (const a of ajustes) {
    const pPares = ajustesPares.find((x) => x.id === a.id).p;
    resultado.modelos[a.id] = {
      p: a.p,
      nrmse: a.nrmse,
      bic: a.bic,
      val: Modelos.metricas(Modelos.POR_ID[a.id], impares, pPares).nrmse,
    };
  }
  resultado.ayllon = ay && ay.valido
    ? { valido: true, nrmse: Modelos.metricas(Modelos.POR_ID.cole, b, ay.p).nrmse }
    : { valido: false };
  return resultado;
}

if (!isMainThread) {
  for (const b of workerData) parentPort.postMessage(ajustarBarrido(b));
  return;
}

// ---------- Hilo principal ----------
const Base = require("./base.js");
const SALIDA = path.join(__dirname, "..", "pagina");

const mediana = (v) => {
  if (!v.length) return null;
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const redondear = (v, cifras) => Number(v.toPrecision(cifras));
const r3 = (v) => (v === null ? null : Math.round(v * 1000) / 1000);

async function main() {
  const todos = Base.cargar();
  const aAjustar = todos.filter((b) => !Base.POR_ID[b.grupo].excluido);
  const hilos = Math.max(1, os.cpus().length - 1);
  console.log(`Ajustando ${aAjustar.length} barridos con ${hilos} hilos…`);

  // Reparto intercalado para que todos los hilos reciban barridos de todos los grupos
  const lotes = Array.from({ length: hilos }, () => []);
  aAjustar.forEach((b, i) => lotes[i % hilos].push(b));

  const resultados = [];
  const inicio = Date.now();
  await Promise.all(lotes.map((lote) => new Promise((ok, mal) => {
    const w = new Worker(__filename, { workerData: lote });
    w.on("message", (r) => {
      resultados.push(r);
      if (resultados.length % 50 === 0) {
        const seg = (Date.now() - inicio) / 1000;
        console.log(`  ${resultados.length} / ${aAjustar.length}  (${seg.toFixed(0)} s)`);
      }
    });
    w.on("error", mal);
    w.on("exit", ok);
  })));
  console.log(`Listo en ${((Date.now() - inicio) / 1000).toFixed(0)} s`);

  const porId = Object.fromEntries(resultados.map((r) => [r.id, r]));
  const ids = Modelos.LISTA.map((m) => m.id);

  // ---------- Resumen por grupo ----------
  const ganaTotal = Object.fromEntries(ids.map((id) => [id, 0]));
  const grupos = Base.GRUPOS.map((g) => {
    const delGrupo = todos.filter((b) => b.grupo === g.id);
    const base = { id: g.id, nombre: g.nombre, enBase: delGrupo.length };
    if (g.excluido) return { ...base, ajustados: 0, excluido: g.excluido };

    const res = delGrupo.map((b) => porId[b.id]);
    const gana = Object.fromEntries(ids.map((id) => [id, 0]));
    for (const r of res) {
      const mejor = ids.reduce((a, b) => (r.modelos[b].bic < r.modelos[a].bic ? b : a));
      gana[mejor]++;
      ganaTotal[mejor]++;
    }
    const modelos = Object.fromEntries(ids.map((id) => [id, {
      nrmse: r3(mediana(res.map((r) => r.modelos[id].nrmse))),
      val: r3(mediana(res.map((r) => r.modelos[id].val))),
      gana: Math.round((1000 * gana[id]) / res.length) / 10,
    }]));
    const validos = res.filter((r) => r.ayllon.valido);
    const ayllon = {
      valido: Math.round((1000 * validos.length) / res.length) / 10,
      nrmse: r3(mediana(validos.map((r) => r.ayllon.nrmse))),
    };
    return { ...base, ajustados: res.length, modelos, ayllon };
  });

  const ajustados = grupos.filter((g) => g.modelos);
  const resumen = {
    completa: true,
    totalAjustados: resultados.length,
    ganaTotal: Object.fromEntries(ids.map((id) => [id, Math.round((1000 * ganaTotal[id]) / resultados.length) / 10])),
    peorMediana: Object.fromEntries(ids.map((id) => [id, Math.max(...ajustados.map((g) => g.modelos[id].nrmse))])),
    grupos,
  };
  fs.writeFileSync(path.join(SALIDA, "resumen-punto3.js"), `/*
 * Punto 3: comparación de los cinco modelos en TODOS los barridos de la base (salvo los
 * animales, excluidos por datos dañados). Generado con herramientas/calcular-base.js, que usa
 * el mismo modelos.js que la página. nrmse y val son medianas en %; gana = % de barridos del
 * grupo donde el modelo tiene el menor BIC; ayllon = % de barridos donde el método da valores
 * y error mediano de esos casos.
 */
const RESUMEN_BASE = ${JSON.stringify(resumen)};
`);

  // ---------- Datos y parámetros de cada barrido, un archivo por grupo ----------
  const carpeta = path.join(SALIDA, "barridos");
  fs.mkdirSync(carpeta, { recursive: true });
  const indice = [];
  for (const g of Base.GRUPOS) {
    if (g.excluido) continue;
    const barridos = todos.filter((b) => b.grupo === g.id).map((b) => ({
      id: b.id,
      equipo: b.equipo,
      electrodos: b.electrodos,
      f: b.f.map((v) => redondear(v, 6)),
      R: b.R.map((v) => redondear(v, 6)),
      X: b.X.map((v) => redondear(v, 6)),
      p: Object.fromEntries(ids.map((id) => [id, porId[b.id].modelos[id].p.map((v) => redondear(v, 8))])),
    }));
    fs.writeFileSync(path.join(carpeta, `${g.id}.js`),
      `// ${g.nombre}: ${barridos.length} barridos normalizados y sus ajustes. Generado con herramientas/calcular-base.js.\n` +
      `registrarGrupo(${JSON.stringify(g.id)}, ${JSON.stringify(barridos)});\n`);
    indice.push({ id: g.id, nombre: g.nombre, fuente: g.fuente, conversion: g.conversion, ids: barridos.map((b) => b.id) });
  }
  fs.writeFileSync(path.join(SALIDA, "barridos", "indice.js"),
    `// Grupos de la base y sus barridos (los datos de cada grupo están en barridos/<grupo>.js).\n` +
    `const GRUPOS_BASE = ${JSON.stringify(indice)};\n`);

  console.log(JSON.stringify(grupos.map((g) => [g.id, g.ajustados, g.modelos && ids.map((id) => `${id}:${g.modelos[id].gana}%/${g.modelos[id].nrmse}`).join(" "), g.ayllon]), null, 1));
}

main();
