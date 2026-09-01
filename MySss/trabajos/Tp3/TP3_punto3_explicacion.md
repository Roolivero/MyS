# TP3 — Punto 3: Polinomios de grado 1, 2, 3 y 4

## Qué pedimos

Datos:

```
(0, 1.0), (0.15, 1.004), (0.31, 1.031), (0.5, 1.117), (0.6, 1.223), (0.75, 1.422)
```

Queremos aproximar esos puntos con polinomios:

```
grado 1:  p(x) = a0 + a1*x
grado 2:  p(x) = a0 + a1*x + a2*x^2
grado 3:  p(x) = a0 + a1*x + a2*x^2 + a3*x^3
grado 4:  p(x) = a0 + a1*x + a2*x^2 + a3*x^3 + a4*x^4
```

O sea: encontrar los coeficientes a0, a1, ... de cada grado.

---

## Idea corta

En el punto 1 ajustábamos una recta (polinomio de grado 1).

Acá hacemos lo mismo, pero con más potencias de x.

Usamos otra vez **mínimos cuadrados**: elegimos los coeficientes para que la curva pase lo más cerca posible de los puntos.

---

## Cómo se calcula

### 1) Forma general (grado m)

```
p(x) = a0 + a1*x + a2*x^2 + ... + am*x^m
```

Hay que encontrar a0, a1, ..., am.

### 2) Armamos un sistema de ecuaciones (ecuaciones normales)

Para i = 0, 1, ..., m:

```
suma(x^i)*a0 + suma(x^(i+1))*a1 + ... + suma(x^(i+m))*am = suma(y * x^i)
```

Ejemplo grado 1 (m = 1):

```
suma(1)*a0     + suma(x)*a1     = suma(y)
suma(x)*a0     + suma(x^2)*a1   = suma(y*x)
```

Ejemplo grado 2 (m = 2):

```
suma(1)*a0   + suma(x)*a1   + suma(x^2)*a2   = suma(y)
suma(x)*a0   + suma(x^2)*a1 + suma(x^3)*a2   = suma(y*x)
suma(x^2)*a0 + suma(x^3)*a1 + suma(x^4)*a2   = suma(y*x^2)
```

Y así para grado 3 y 4 (más filas y columnas).

### 3) Resolvemos el sistema

Ese sistema es de la forma:

```
matriz * coeficientes = resultados
```

En el código lo resolvemos con **eliminación gaussiana** (método de la secundaria para sistemas lineales).

### 4) Evaluamos el polinomio

Con los coeficientes hallados:

```
p(x) = a0 + a1*x + a2*x^2 + ... + am*x^m
```

Para el gráfico usamos muchos valores de x (curva suave), no solo los 6 puntos.

---

## Por qué lo pensamos así

- Grado 1 = misma idea del punto 1 (recta).
- Grados más altos = más “flexibles”, pueden seguir mejor la forma de los datos.
- No forzamos que pase exacto por todos los puntos: buscamos la mejor aproximación por mínimos cuadrados.
- Al subir el grado, en general el error baja (se acerca más a los datos).

---

## Frase para el informe

Ajustamos polinomios de grado 1 a 4 por mínimos cuadrados. Armamos las ecuaciones normales (sumas de potencias de x y de y*x^i), resolvemos el sistema para obtener los coeficientes y graficamos cada polinomio junto a los datos.
