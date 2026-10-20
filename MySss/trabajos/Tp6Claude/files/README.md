# TP 6 - Modelo de Cole

Página web interactiva para los puntos 1 y 2 del TP 6 de Modelos y Simulación 2026.

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
