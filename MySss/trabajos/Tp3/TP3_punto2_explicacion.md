# TP3 — Punto 2: Ajuste exponencial

## Qué pedimos

Datos: (0, 1.5), (1, 2.5), (2, 3.5), (3, 5.0), (4, 7.5)

Queremos la función:

```
y = C * e^(A * x)
```

O sea, encontrar los números **C** y **A**.

---

## Idea corta

En el punto 1 ajustábamos una recta `y = a*x + b`.

Acá la función es exponencial, no recta.  
Truco: le aplicamos **ln** (logaritmo natural) a la y, y se convierte en una recta.  
Ajustamos esa recta igual que en el punto 1, y después sacamos C y A.

---

## Cómo se calcula (paso a paso)

### 1) Función original

```
y = C * e^(A * x)
```

### 2) Aplicamos ln a los dos lados

```
ln(y) = ln(C) + A * x
```

### 3) Esto ya es una recta

Si llamamos:

```
Y = ln(y)
a = A
b = ln(C)
```

queda:

```
Y = a * x + b
```

Importante: no usamos la y original, usamos `Y = ln(y)` de cada punto.

Ejemplo con el primer punto (0, 1.5):

```
Y = ln(1.5) ≈ 0.405
```

### 4) Calculamos a y b (igual que el punto 1)

Con n = cantidad de puntos:

```
a = (n * suma(x*Y) - suma(x) * suma(Y)) / (n * suma(x^2) - suma(x)^2)

b = (suma(Y) - a * suma(x)) / n
```

### 5) Pasamos de a,b a A,C

```
A = a
C = e^b
```

Porque `b` era `ln(C)`, entonces C se recupera con `e^b`.

---

## Resultado del código

```
A ≈ 0.3912
C ≈ 1.5799

y ≈ 1.5799 * e^(0.3912 * x)
```

---

## Frase para el informe

Como `y = C * e^(A*x)` no es lineal, tomamos `ln(y)` y obtenemos la recta `ln(y) = ln(C) + A*x`. Ajustamos esa recta por mínimos cuadrados (igual que el punto 1) y recuperamos `A = a` y `C = e^b`.
