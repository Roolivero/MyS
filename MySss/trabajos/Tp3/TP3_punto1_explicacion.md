# TP3 — Punto 1: Ajuste de una recta y = a*x + b

## Qué pedimos

Para cada conjunto de datos, encontrar la recta:

```
y = a * x + b
```

O sea, encontrar los números **a** (pendiente) y **b** (ordenada al origen).

Hay 3 tablas:

```
Conjunto 1:  (-2,1), (-1,2), (0,3), (1,3), (2,4)
Conjunto 2:  (-6,7), (-2,5), (0,3), (2,2), (6,0)
Conjunto 3:  (-4,-3), (-1,-1), (0,0), (2,1), (3,2)
```

---

## Idea corta

Los puntos no caen exactos sobre una sola recta.

Entonces buscamos la recta que pase **lo más cerca posible** de todos.

Eso se llama **mínimos cuadrados**: elegimos a y b para que el error total (al cuadrado) sea lo más chico posible.

---

## Cómo se calcula (paso a paso)

### 1) Función que buscamos

```
y = a * x + b
```

- a = qué tan inclinada está la recta
- b = dónde corta el eje y

### 2) Fórmulas de a y b

Con n = cantidad de puntos:

```
a = (n * suma(x*y) - suma(x) * suma(y)) / (n * suma(x^2) - suma(x)^2)

b = (suma(y) - a * suma(x)) / n
```

### 3) Qué significa cada suma

Para los puntos (x0,y0), (x1,y1), ...:

```
suma(x)   = x0 + x1 + ... 
suma(y)   = y0 + y1 + ...
suma(x*y) = x0*y0 + x1*y1 + ...
suma(x^2) = x0^2 + x1^2 + ...
```

### 4) Evaluamos la recta

Con a y b ya calculados:

```
y_aprox = a * x + b
```

Para el gráfico usamos muchos valores de x (curva/recta suave), no solo los puntos de la tabla.

---

## Por qué lo pensamos así

- No inventamos a y b “a ojo”.
- Usamos una fórmula que minimiza el error entre la recta y los datos.
- Esa misma idea (mínimos cuadrados) se reutiliza en los puntos 2, 3 y 4.

---

## Frase para el informe

Ajustamos cada conjunto de datos a una recta `y = a*x + b` por el método de mínimos cuadrados. Calculamos a y b con las fórmulas de las sumatorias y graficamos la recta junto a los puntos reales.
