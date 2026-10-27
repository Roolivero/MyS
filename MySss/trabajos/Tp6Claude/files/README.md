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
- `datos-punto3.js`: nueve barridos medidos del punto 3, tres por tipo de muestra
  (humanas: ID 001, 025 y 050; vegetales: ID 1233, 1246 y 1260; fantomas de agar: ID 1311,
  1371 y 1457), extraídos de `registros_EIS.mat` con Python. Criterio: entre los barridos que
  cumplen las reglas (≥ 20 frecuencias, sin datos faltantes, ≥ 80 % de reactancia negativa y
  pico de −X con al menos 3 puntos de cada lado), el primero, el del medio y el último de cada
  tipo; las humanas, solo del grupo sin errores (ID 001 a 050). En las humanas las frecuencias
  se dividieron por 2π porque venían guardadas como ω (rad/s).
- `ajuste.js`: ajuste por mínimos cuadrados (Levenberg-Marquardt) con 15 puntos de partida y
  límites físicos (R0 > R∞ > 0, 0,01 ≤ α ≤ 1). Da los mismos resultados que el notebook en Python.
- `punto3.js`: interfaz del punto 3 (ajuste manual, ajuste automático y tabla de resultados).
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