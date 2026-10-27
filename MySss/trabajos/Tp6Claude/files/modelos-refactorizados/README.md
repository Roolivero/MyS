# Versión imperativa y modular de modelos.js

El archivo original `../modelos.js` se conserva. Esta versión expresa el mismo cálculo
con funciones declaradas con nombre, bucles `for` y variables descriptivas. No usa
funciones flecha, `map`, `reduce`, `flatMap` ni funciones anónimas autoejecutadas.

Para probarla en la página, abrir **`../index-refactorizado.html`** con doble clic.
Esta copia usa los mismos datos, gráficos y controles que `index.html`, pero carga
los módulos de esta carpeta. No necesita instalar dependencias ni un empaquetador.
Chart.js y las tipografías mantienen los requisitos de conexión de la página original.

## Cómo recorrer el código

| Archivo | Responsabilidad |
| --- | --- |
| `catalogo-modelos.js` | Define los cinco modelos, las fórmulas y los parámetros con nombre. |
| `numeros-complejos.js` | Suma, producto, división y potencias de números complejos. |
| `ajuste-modelos.js` | Prepara puntos iniciales, prueba varios inicios y coordina los ajustes. |
| `levenberg-marquardt.js` | Ajusta un modelo desde un punto inicial. Separa derivadas, sistema normal y amortiguación. |
| `parametros-ajuste.js` | Calcula límites y convierte parámetros en variables de búsqueda y viceversa. |
| `errores-ajuste.js` | Calcula residuos, suma de cuadrados, RMSE, NRMSE y BIC. |
| `sistemas-lineales.js` | Resuelve el sistema del optimizador por eliminación gaussiana. |
| `modelos.js` | Adapta los nombres y formatos de la página existente a los módulos nuevos. |

Una lectura práctica empieza por `catalogo-modelos.js` para entender las fórmulas,
sigue por `ajuste-modelos.js` para ver el proceso completo y termina en
`levenberg-marquardt.js` para estudiar el algoritmo numérico.

El recorrido durante un ajuste es:

```text
punto3.js
  → modelos.js: ajustarTodosCompatible
  → ajuste-modelos.js: ajustarTodosLosModelos
  → buscarMejoresParametros: prueba cada punto inicial
  → levenberg-marquardt.js: ajustarConLevenbergMarquardt
      → parametros-ajuste.js: aplica las transformaciones y los límites
      → errores-ajuste.js: calcula las diferencias contra las mediciones
          → catalogo-modelos.js: evalúa la fórmula
              → numeros-complejos.js: realiza las operaciones complejas
      → sistemas-lineales.js: calcula el cambio propuesto de parámetros
```

## Datos y nomenclatura

Los módulos internos reciben un barrido con unidades explícitas:

```js
const barrido = {
  frecuenciasHz: [1000, 2000, 3000],
  resistenciasOhm: [300, 250, 220],
  reactanciasOhm: [-100, -90, -80],
};
```

Los parámetros de Cole se expresan como un objeto:

```js
const parametros = {
  resistenciaInfinita: 100,
  diferenciaResistencias: 400,
  logFrecuenciaCaracteristica: 3, // log10(fc) = 3 significa fc = 1000 Hz.
  exponenteAlpha: 0.7,
};
```

`diferenciaResistencias` es ΔR = R0 − R∞. Por lo tanto, R0 se obtiene sumando
`resistenciaInfinita + diferenciaResistencias`. Los resultados complejos usan
`{ real, imaginaria }`. El optimizador conserva vectores y matrices numéricas donde
son necesarios para las derivadas y los sistemas lineales.

| Nombre anterior | Nombre o concepto nuevo |
| --- | --- |
| `C`, `sum`, `mul`, `div`, `pow` | Operaciones explícitas de `NumerosComplejos`. |
| `p` | `parametros`, con propiedades que indican su significado. |
| `q` | `variablesBusqueda` o `variablesActuales`. |
| `lfc` | `logFrecuenciaCaracteristica`, siempre en base 10. |
| `r`, `ss` | `residuos`, `calcularSumaCuadrados`. |
| `J`, `A`, `g` | `derivadasPorParametro`, `matrizNormal`, `proyeccionResiduos`. |
| `lambda` | `amortiguacion`. |
| `lm`, `mejorDe` | `ajustarConLevenbergMarquardt`, `buscarMejoresParametros`. |

La API antigua (`LISTA`, `POR_ID`, `ajustarTodos`, `evaluar`, `metricas`, y los campos
`p`, `re`, `im`) sólo se mantiene en `modelos.js` para que `punto3.js` siga funcionando.

## Uso desde Node

Para reutilizar la API de la página:

```js
const Modelos = require("./modelos-refactorizados/modelos.js");
const impedancia = Modelos.evaluar("cole", 1000, [100, 400, 3, 1]);
console.log(impedancia); // { re: 300, im: -200 }
```

Para trabajar directamente con los nombres nuevos:

```js
const Catalogo = require("./modelos-refactorizados/catalogo-modelos.js");
const Ajuste = require("./modelos-refactorizados/ajuste-modelos.js");
const impedancia = Catalogo.modelosPorIdentificador.cole.calcularImpedancia(1000, parametros);
const resultados = Ajuste.ajustarTodosLosModelos(barrido);
```

El segundo ejemplo supone los objetos `parametros` y `barrido` definidos arriba.
En el navegador los módulos se cargan como scripts clásicos, en el orden indicado
por `index-refactorizado.html`; en Node cada módulo resuelve sus dependencias con `require`.

## Comprobación de equivalencia

Desde la carpeta `files`:

```bash
node modelos-refactorizados/verificar-equivalencia.cjs
```

La comprobación compara las fórmulas, los metadatos, las métricas y los cinco ajustes
completos de cada barrido de `datos-punto3.js` con el archivo original. También
verifica la carga sin CommonJS y la recuperación de parámetros conocidos en un caso sintético.

Se conservaron las ecuaciones con signo **+**, los límites, los puntos iniciales, el
orden de cálculo y los criterios de parada. El ajuste sigue devolviendo el mejor
estado alcanzado sin un indicador de convergencia. Para un ajuste exactamente
perfecto, la fórmula de BIC conserva el resultado `-Infinity` del original.
