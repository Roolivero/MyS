/* Ejecutar con Node. Compara fórmulas, API y ajustes completos con el archivo original. */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ModelosOriginales = require("../modelos.js");
const ModelosRefactorizados = require("./modelos.js");
const SistemasLineales = require("./sistemas-lineales.js");
const barridos = require("../datos-punto3.js");

const parametrosPorModelo = {
  debye: [[100, 400, 3], [0.01, 1000, 5]],
  cole: [[100, 400, 3, 1], [70, 315, Math.log10(37000), 0.27], [10, 800, 6, 0.01]],
  cole_td: [[100, 400, 3, 0.7, 5], [70, 315, 5, 0.9, -20]],
  hn: [[100, 400, 3, 0.7, 1], [70, 315, 5, 0.45, 0.6]],
  cole2: [[100, 300, 3, 0.7, 100, 5, 0.9], [100, 500, 3, 0.85, -200, 2, 0.95]],
};
const frecuenciasEvaluacion = [1, 1000, 37000, 1e6];

for (let indiceModelo = 0; indiceModelo < ModelosOriginales.LISTA.length; indiceModelo++) {
  const original = ModelosOriginales.LISTA[indiceModelo];
  const refactorizado = ModelosRefactorizados.LISTA[indiceModelo];
  assert.equal(refactorizado.id, original.id);
  assert.equal(refactorizado.nombre, original.nombre);
  assert.equal(refactorizado.desc, original.desc);
  assert.equal(refactorizado.k, original.k);
  assert.deepEqual(refactorizado.params, original.params);
  assert.equal(ModelosRefactorizados.POR_ID[original.id], refactorizado);

  const juegosParametros = parametrosPorModelo[original.id];
  for (let indiceJuego = 0; indiceJuego < juegosParametros.length; indiceJuego++) {
    const parametros = juegosParametros[indiceJuego];
    for (let indiceFrecuencia = 0; indiceFrecuencia < frecuenciasEvaluacion.length; indiceFrecuencia++) {
      const frecuenciaHz = frecuenciasEvaluacion[indiceFrecuencia];
      const esperado = ModelosOriginales.evaluar(original.id, frecuenciaHz, parametros);
      assert.deepEqual(ModelosRefactorizados.evaluar(original.id, frecuenciaHz, parametros), esperado);
      // También se conserva la posibilidad de llamar z sin depender de `this`.
      const evaluarSinObjeto = refactorizado.z;
      assert.deepEqual(evaluarSinObjeto(frecuenciaHz, parametros), esperado);
    }
    const metricasEsperadas = ModelosOriginales.metricas(original, barridos[0], parametros);
    assert.deepEqual(ModelosRefactorizados.metricas(refactorizado, barridos[0], parametros), metricasEsperadas);
  }
}

assert.deepEqual(ModelosRefactorizados.evaluar("debye", 1000, [100, 400, 3]), { re: 300, im: -200 });
assert.deepEqual(SistemasLineales.resolver([[0, 2], [1, 1]], [4, 3]), [1, 2]);
assert.equal(SistemasLineales.resolver([[1, 2], [2, 4]], [3, 6]), null);
console.log("Fórmulas, metadatos, métricas y sistemas lineales: correctos.");

// Se verifica la carga como scripts clásicos: sin require, module ni empaquetador.
const nombresScripts = [
  "numeros-complejos.js", "catalogo-modelos.js", "parametros-ajuste.js", "errores-ajuste.js",
  "sistemas-lineales.js", "levenberg-marquardt.js", "ajuste-modelos.js", "modelos.js",
];
const contextoNavegador = vm.createContext({});
for (let indice = 0; indice < nombresScripts.length; indice++) {
  const rutaScript = path.join(__dirname, nombresScripts[indice]);
  const codigo = fs.readFileSync(rutaScript, "utf8");
  assert.doesNotMatch(codigo, /=>|\.(?:map|reduce|flatMap|filter|forEach|some|every)\s*\(|Object\.fromEntries/);
  vm.runInContext(codigo, contextoNavegador, { filename: nombresScripts[indice] });
}
const ModelosNavegador = vm.runInContext("Modelos", contextoNavegador);
for (let indice = 0; indice < ModelosOriginales.LISTA.length; indice++) {
  const identificador = ModelosOriginales.LISTA[indice].id;
  const parametros = parametrosPorModelo[identificador][0];
  const prediccion = ModelosNavegador.evaluar(identificador, 37000, parametros);
  assert.deepEqual(JSON.parse(JSON.stringify(prediccion)), ModelosOriginales.evaluar(identificador, 37000, parametros));
}
console.log("Carga de scripts clásicos y estilo imperativo: correctos.");

// Caso sintético: además de comparar versiones, se recuperan parámetros conocidos de Cole.
const parametrosConocidos = [100, 400, 4.5, 0.7];
const barridoSintetico = { f: [], R: [], X: [] };
for (let indice = 0; indice < 25; indice++) {
  const frecuenciaHz = 10 ** (1 + (6 * indice) / 24);
  const impedancia = ModelosOriginales.evaluar("cole", frecuenciaHz, parametrosConocidos);
  barridoSintetico.f.push(frecuenciaHz);
  barridoSintetico.R.push(impedancia.re);
  barridoSintetico.X.push(impedancia.im);
}
const ajusteSinteticoOriginal = ModelosOriginales.ajustarTodos(barridoSintetico);
const ajusteSinteticoRefactorizado = ModelosRefactorizados.ajustarTodos(barridoSintetico);
assert.deepEqual(ajusteSinteticoRefactorizado, ajusteSinteticoOriginal);
const ajusteColeSintetico = ajusteSinteticoRefactorizado[1];
assert.ok(ajusteColeSintetico.rmse < 1e-7);
for (let indice = 0; indice < parametrosConocidos.length; indice++) {
  assert.ok(Math.abs(ajusteColeSintetico.p[indice] - parametrosConocidos[indice])
    < 1e-6 * Math.max(1, Math.abs(parametrosConocidos[indice])));
}
const ajusteSinteticoNavegador = ModelosNavegador.ajustarTodos(barridoSintetico);
assert.deepEqual(JSON.parse(JSON.stringify(ajusteSinteticoNavegador)), ajusteSinteticoOriginal);
console.log("Caso sintético: parámetros recuperados y cinco ajustes idénticos en Node y scripts clásicos.");

for (let indiceBarrido = 0; indiceBarrido < barridos.length; indiceBarrido++) {
  const barrido = barridos[indiceBarrido];
  const datosAntesDelAjuste = JSON.stringify(barrido);
  const resultadosOriginales = ModelosOriginales.ajustarTodos(barrido);
  const resultadosRefactorizados = ModelosRefactorizados.ajustarTodos(barrido);
  assert.deepEqual(resultadosRefactorizados, resultadosOriginales, "Diferencia en el barrido " + barrido.id);
  assert.equal(JSON.stringify(barrido), datosAntesDelAjuste, "Se modificó el barrido " + barrido.id);
  console.log("Barrido " + barrido.id + ": cinco ajustes idénticos, incluidos parámetros, errores y BIC.");
}

console.log("Verificación terminada: " + barridos.length + " barridos reales y un caso sintético.");
