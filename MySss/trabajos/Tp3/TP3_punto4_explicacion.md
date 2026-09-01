# TP3 — Punto 4: Ley de Kepler T = C * x^A

## Qué pedimos

Datos de planetas:

```
Planeta     Distancia x      Período T
Mercurio    57.59            87.99
Venus       108.11           224.7
Tierra      149.57           365.26
Marte       227.84           686.98
Júpiter     778.14           4332.4
Saturno     1427.0           10759
Urano       2870.3           30684
Neptuno     4499.9           60188
Plutón      5909.0           90710
```

Queremos la función:

```
T = C * x^A
```

O sea, encontrar los números **C** y **A**.

- x = distancia al Sol (millones de km)
- T = período orbital (días)

---

## Idea corta

Otra vez la función no es una recta.

Truco: aplicamos **ln** a los dos lados y se convierte en una recta.

Después usamos las mismas fórmulas del punto 1.

---

## Cómo se calcula (paso a paso)

### 1) Función original

```
T = C * x^A
```

### 2) Aplicamos ln a los dos lados

```
ln(T) = ln(C) + A * ln(x)
```

### 3) Esto ya es una recta

Si llamamos:

```
X = ln(x)
Y = ln(T)
a = A
b = ln(C)
```

queda:

```
Y = a * X + b
```

Importante: no usamos x y T crudos, usamos `ln(x)` y `ln(T)`.

### 4) Calculamos a y b (igual que el punto 1)

```
a = (n * suma(X*Y) - suma(X) * suma(Y)) / (n * suma(X^2) - suma(X)^2)

b = (suma(Y) - a * suma(X)) / n
```

### 5) Pasamos de a,b a A,C

```
A = a
C = e^b
```

---

## Diferencia con el punto 2

- Punto 2: `y = C * e^(A*x)`  -->  se usa `ln(y)` y la x queda igual
- Punto 4: `T = C * x^A`      -->  se usa `ln(T)` y también `ln(x)`

---

## Qué se espera

Por la tercera ley de Kepler, A debería salir cerca de **1.5**  
(porque en teoría T^2 es proporcional a x^3, o sea T proporcional a x^(3/2)).

---

## Frase para el informe

Como `T = C * x^A` no es lineal, tomamos logaritmo: `ln(T) = ln(C) + A*ln(x)`. Eso es una recta en las variables `ln(x)` y `ln(T)`. Ajustamos por mínimos cuadrados y recuperamos `A = a` y `C = e^b`.
