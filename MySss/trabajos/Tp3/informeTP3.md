# Trabajo Práctico 3

## Punto 1: Ajuste de rectas

**Consigna.** Para cada conjunto de datos se debe encontrar la recta:

$$
f(x) = a x + b
$$

Conjunto 1:

| x | -2 | -1 | 0 | 1 | 2 |
|---|---:|---:|---:|---:|---:|
| y | 1 | 2 | 3 | 3 | 4 |

Conjunto 2:

| x | -6 | -2 | 0 | 2 | 6 |
|---|---:|---:|---:|---:|---:|
| y | 7 | 5 | 3 | 2 | 0 |

Conjunto 3:

| x | -4 | -1 | 0 | 2 | 3 |
|---|---:|---:|---:|---:|---:|
| y | -3 | -1 | 0 | 1 | 2 |

Los puntos no caen exactamente sobre una misma recta, por eso se busca la recta que pase lo más cerca posible de todos. Para eso se usa el método de mínimos cuadrados, que permite elegir los valores de `a` y `b` que hacen mínimo el error total al cuadrado entre los datos reales y la recta ajustada.

Para una recta:

$$
y = a x + b
$$

la pendiente `a` y la ordenada al origen `b` se calculan con:

$$
a =
\frac{
n\sum_{k=1}^{n} x_k y_k - \left(\sum_{k=1}^{n} x_k\right)\left(\sum_{k=1}^{n} y_k\right)
}{
n\sum_{k=1}^{n} x_k^2 - \left(\sum_{k=1}^{n} x_k\right)^2
}
$$

$$
b =
\frac{
\sum_{k=1}^{n} y_k - a\sum_{k=1}^{n} x_k
}{n}
$$

Después de calcular `a` y `b`, se evalúa la recta con:

$$
y_{\text{aprox}} = a x + b
$$

Los resultados obtenidos fueron:

Conjunto 1:

$$
y = 0.7x + 2.6
$$

Conjunto 2:

$$
y = -0.6x + 3.4
$$

Conjunto 3:

$$
y = 0.7x - 0.2
$$

## Punto 2: Ajuste exponencial

**Consigna.** Encontrar la aproximación de los siguientes datos a la función:

$$
y = C e^{A x}
$$

Datos:

```text
(0, 1.5), (1, 2.5), (2, 3.5), (3, 5.0), (4, 7.5)
```

En este caso la función no es lineal, porque es exponencial. Para poder aplicar mínimos cuadrados como en el punto anterior, se toma logaritmo natural en ambos lados:

$$
y = C e^{A x}
$$

$$
\ln(y) = \ln(C) + A x
$$

Si se llama:

$$
Y = \ln(y), \qquad a = A, \qquad b = \ln(C)
$$

queda una recta:

$$
Y = a x + b
$$

Entonces se ajusta esa recta usando los valores `x` y `ln(y)`. Primero se calculan `a` y `b` con las fórmulas de mínimos cuadrados:

$$
a =
\frac{
n\sum_{k=1}^{n} x_k Y_k - \left(\sum_{k=1}^{n} x_k\right)\left(\sum_{k=1}^{n} Y_k\right)
}{
n\sum_{k=1}^{n} x_k^2 - \left(\sum_{k=1}^{n} x_k\right)^2
}
$$

$$
b =
\frac{
\sum_{k=1}^{n} Y_k - a\sum_{k=1}^{n} x_k
}{n}
$$

Luego se recuperan los parámetros de la función original:

$$
A = a, \qquad C = e^b
$$

El resultado obtenido fue:

$$
\begin{aligned}
A &= 0.3912\\
C &= 1.5799\\
y &= 1.5799 e^{0.3912x}
\end{aligned}
$$

## Punto 3: Ajuste polinómico

**Consigna.** Encontrar los polinomios de grado 1, 2, 3 y 4 que aproximen los siguientes pares de valores:

```text
(0, 1.0), (0.15, 1.004), (0.31, 1.031),
(0.5, 1.117), (0.6, 1.223), (0.75, 1.422)
```

Se buscan polinomios de la forma:

$$
\text{grado 1: } p(x) = a_0 + a_1 x
$$

$$
\text{grado 2: } p(x) = a_0 + a_1 x + a_2 x^2
$$

$$
\text{grado 3: } p(x) = a_0 + a_1 x + a_2 x^2 + a_3 x^3
$$

$$
\text{grado 4: } p(x) = a_0 + a_1 x + a_2 x^2 + a_3 x^3 + a_4 x^4
$$

La idea es la misma que en el punto 1, pero usando más potencias de `x`. Se eligen los coeficientes para que el polinomio pase lo más cerca posible de los datos.

Para un polinomio de grado `m`:

$$
p(x) = a_0 + a_1 x + a_2 x^2 + \cdots + a_m x^m
$$

se arman las ecuaciones normales:

$$
\left(\sum_{k=1}^{n} x_k^i\right)a_0
+ \left(\sum_{k=1}^{n} x_k^{i+1}\right)a_1
+ \cdots
+ \left(\sum_{k=1}^{n} x_k^{i+m}\right)a_m
= \sum_{k=1}^{n} y_k x_k^i
$$

para `i = 0, 1, ..., m`. Ese sistema tiene la forma:

$$
\text{matriz} \cdot \text{coeficientes} = \text{resultados}
$$

Al resolver el sistema se obtienen los coeficientes del polinomio. Los resultados obtenidos fueron:

Grado 1:

$$
p(x) = 0.9295 + 0.5281x
$$

Grado 2:

$$
p(x) = 1.0113 - 0.3257x + 1.1473x^2
$$

Grado 3:

$$
p(x) = 1.0004 - 0.0015x - 0.0115x^2 + 1.0210x^3
$$

Grado 4:

$$
p(x) = 0.9995 + 0.1107x - 0.8254x^2 + 2.7829x^3 - 1.1679x^4
$$

A medida que aumenta el grado, el polinomio tiene más coeficientes y puede adaptarse mejor a la forma de los datos.

## Punto 4: Tercera ley de Kepler

**Consigna.** La tercera ley del movimiento de los planetas se expresa como:

$$
T = C x^A
$$

donde `x` es la distancia al Sol medida en millones de kilómetros, `T` es el período orbital medido en días y `C` es una constante. Se deben encontrar los parámetros de la ecuación a partir de los datos experimentales.

| Planeta | Distancia al Sol | Período sideral |
|---|---:|---:|
| Mercurio | 57.59 | 87.99 |
| Venus | 108.11 | 224.7 |
| Tierra | 149.57 | 365.26 |
| Marte | 227.84 | 686.98 |
| Júpiter | 778.14 | 4332.4 |
| Saturno | 1427.0 | 10759 |
| Urano | 2870.3 | 30684 |
| Neptuno | 4499.9 | 60188 |
| Plutón | 5909.0 | 90710 |

La función tampoco es lineal. Para transformarla en una recta se aplica logaritmo natural en ambos lados:

$$
T = C x^A
$$

$$
\ln(T) = \ln(C) + A\ln(x)
$$

Si se llama:

$$
X = \ln(x), \qquad Y = \ln(T), \qquad a = A, \qquad b = \ln(C)
$$

queda:

$$
Y = aX + b
$$

Entonces se aplica mínimos cuadrados sobre los valores `ln(x)` y `ln(T)`:

$$
a =
\frac{
n\sum_{k=1}^{n} X_k Y_k - \left(\sum_{k=1}^{n} X_k\right)\left(\sum_{k=1}^{n} Y_k\right)
}{
n\sum_{k=1}^{n} X_k^2 - \left(\sum_{k=1}^{n} X_k\right)^2
}
$$

$$
b =
\frac{
\sum_{k=1}^{n} Y_k - a\sum_{k=1}^{n} X_k
}{n}
$$

Después se recuperan los parámetros:

$$
A = a, \qquad C = e^b
$$

El resultado obtenido fue:

$$
\begin{aligned}
A &= 1.4989\\
C &= 0.2013\\
T &= 0.2013x^{1.4989}
\end{aligned}
$$

El valor de `A` queda muy cerca de `1.5`, que coincide con lo esperado por la tercera ley de Kepler, ya que teóricamente $T^2$ es proporcional a $x^3$, o sea que $T$ es proporcional a $x^{3/2}$.

