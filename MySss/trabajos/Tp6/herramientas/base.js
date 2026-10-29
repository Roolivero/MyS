/*
 * Lectura y normalización de la base de Dell'Osa et al. (registros_EIS.json).
 * Deja todos los barridos con f en Hz, R y X en ohmios y X negativa = capacitiva,
 * igual que los datos de la página.
 */
const fs = require("fs");
const path = require("path");

const ARCHIVO = path.join(__dirname, "..", "datos", "registros_EIS.json");

const EQUIPO = { 0: "No informado", 1: "Solartron", 2: "HF2IS Zurich Instruments", 3: "Xitron 4001B", 4: "SFB7 Impedimed" };
const ELECTRODOS = { 0: "No informado", 2: "Bipolar (2 electrodos)", 3: "Tripolar (3 electrodos)", 4: "Tetrapolar (4 electrodos)" };

const GRUPOS = [
  { id: "hum_ok", nombre: "Humana (Ayllón, sin errores)", fuente: "Ayllón et al. (2016)",
    conversion: "Frecuencias guardadas como ω (rad/s): se dividieron por 2π." },
  { id: "hum_err", nombre: "Humana (Ayllón, con errores)", fuente: "Ayllón et al. (2016)",
    conversion: "Frecuencias guardadas como ω (rad/s): se dividieron por 2π. Este grupo tiene errores de medición introducidos a propósito." },
  { id: "hum_gc", nombre: "Humana (González Correa)", fuente: "González Correa (2018)",
    conversion: "Frecuencias guardadas en kHz y reactancia con el signo cambiado: se pasaron a Hz y se invirtió el signo." },
  { id: "hum_dl", nombre: "Humana (De Lorenzo)", fuente: "De Lorenzo et al. (1997)",
    conversion: "Reactancia guardada con el signo cambiado: se invirtió el signo." },
  { id: "veg", nombre: "Vegetal", fuente: "Mediciones de Bertemes Filho (no publicadas)", conversion: "" },
  { id: "fan", nombre: "Fantoma de agar", fuente: "Dell'Osa et al. (2019)", conversion: "" },
  { id: "ani", nombre: "Animal", fuente: "Mediciones de Bertemes Filho (no publicadas)", conversion: "",
    excluido: "resistencias negativas o nulas" },
];
const POR_ID = Object.fromEntries(GRUPOS.map((g) => [g.id, g]));

function grupoDe(r) {
  if (r.sample === "1" && r.origin === "4") return +r.id <= 50 ? "hum_ok" : "hum_err";
  if (r.sample === "1" && r.origin === "2") return "hum_gc";
  if (r.sample === "1" && r.origin === "3") return "hum_dl";
  if (r.sample === "2") return "veg";
  if (r.sample === "5") return "fan";
  if (r.sample === "4") return "ani";
  return null;
}

// Pasa un registro crudo a { f, R, X } en Hz y ohmios, con X negativa = capacitiva
function normalizar(r, grupo) {
  let f = r.eis.map((fila) => fila[0]);
  const R = r.eis.map((fila) => fila[1]);
  let X = r.eis.map((fila) => fila[2]);
  if (grupo === "hum_ok" || grupo === "hum_err") f = f.map((w) => w / (2 * Math.PI));
  if (grupo === "hum_gc") { f = f.map((v) => v * 1000); X = X.map((v) => -v); }
  if (grupo === "hum_dl") X = X.map((v) => -v);
  return { f, R, X };
}

function cargar() {
  const { registros } = JSON.parse(fs.readFileSync(ARCHIVO, "utf8"));
  return registros.map((r) => {
    const grupo = grupoDe(r);
    return {
      id: r.id,
      grupo,
      equipo: EQUIPO[r.device] || EQUIPO[0],
      electrodos: ELECTRODOS[r.electrode] || ELECTRODOS[0],
      ...normalizar(r, grupo),
    };
  });
}

module.exports = { GRUPOS, POR_ID, cargar };
