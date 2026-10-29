# TP 6 - Modelo de Cole

Página web interactiva para los puntos 1, 2 y 3 del TP 6 de Modelos y Simulación 2026.

## Cómo abrirla

Doble clic en `index.html`. No hace falta instalar nada; solo conexión a internet
para cargar Chart.js (gráficos) y las tipografías.

Si preferís servirla localmente:

```
npx serve .
```

## Archivos

- `cole.js`: el modelo (punto 1). Función `impedancia(f, p)` y `simular(p, frecuencias)`.
  No depende de la página.
- `app.js`: interfaz, tabla de tejidos (punto 2), gráficos y exportación CSV.
- `barridos/`: todos los barridos de la base (salvo los animales), un archivo por grupo, con los
  parámetros ya ajustados de los cinco modelos. La página carga cada grupo cuando se elige.
  `barridos/indice.js` lista los grupos y sus ID. Datos normalizados: f en Hz, R y X en ohmios,
  X negativa = capacitiva.
- `resumen-punto3.js`: resultado de la comparación de modelos en toda la base.

`barridos/` y `resumen-punto3.js` se generan con `../herramientas/calcular-base.js`, que lee
`../datos/registros_EIS.json` y usa este mismo `modelos.js`. Desde la carpeta `Tp6`:

    node herramientas/calcular-base.js
- `modelos.js`: los cinco modelos candidatos (Debye, Cole, Cole con retardo, Havriliak-Negami y
  Cole doble), el ajuste por mínimos cuadrados (Levenberg-Marquardt), el BIC y el método de
  Ayllon, que da los valores de Cole sin iterar y sirve de punto de partida del ajuste.
- `punto3.js`: interfaz del punto 3 (resultado en la base, explorador de barridos y tabla de
  valores de Cole por Ayllon).
- `index.html` / `styles.css`: estructura y estilos.

## Ecuación implementada

    Z(ω) = R∞ + (R0 − R∞) / (1 + (jωτ)^α),   ω = 2πf,   τ = 1 / (2π fc)

Se usa el signo **+** en el denominador (forma estándar del modelo de Cole). El enunciado
muestra un signo menos; con ese signo la reactancia sale positiva (inductiva) y, para α < 1,
la resistencia cae por debajo de R∞ a alta frecuencia, lo que no corresponde a un tejido.

## Opción de convención del exponente

Por defecto el exponente es α, tal como en el enunciado. La opción "1 − α" usa la convención
dieléctrica de Cole y Cole (1941), por si los α de la tabla estuvieran expresados así.

## Prueba rápida del modelo con Node

```
node -e 'const C=require("./cole.js"); console.log(C.impedancia(37e3,{R0:385,Rinf:70,fcHz:37e3,exponente:1}))'
```

Con exponente 1 (caso Debye), en f = fc debe dar R = (R0 + R∞)/2 = 227.5 Ω y X = −(R0 − R∞)/2 = −157.5 Ω.

## Datos del punto 3

Dell'Osa, A. H., Bravo, N. Y. y Villanueva Jousset, T. (2025). *Single dispersion EIS measurements:
a compilation*. Zenodo. https://doi.org/10.5281/zenodo.15795175 (CC BY 4.0).