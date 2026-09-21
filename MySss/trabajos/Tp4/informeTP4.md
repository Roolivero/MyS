# Trabajo Práctico 4

## Modelo de Leontief

En este trabajo se utiliza el modelo insumo-producto de Leontief. Este modelo permite calcular cuánto debe producir cada sector de una economía para satisfacer una demanda final, teniendo en cuenta que los sectores también consumen productos de otros sectores como insumos.

Si `x` es el vector de producción total, `A` es la matriz de coeficientes técnicos y `y` es el vector de demanda final, el modelo se plantea como:

$$
x = Ax + y
$$

La matriz `A` se llama matriz de coeficientes técnicos porque cada uno de sus valores indica cuánto producto de un sector se necesita como insumo para producir una unidad de otro sector. Es decir, cada coeficiente responde a la pregunta:

```text
¿Cuánto producto del sector i se necesita para producir 1 unidad del sector j?
```

Por eso, la matriz `A` muestra las dependencias internas entre sectores. El término `Ax` representa la demanda intermedia, es decir, la parte de la producción que se usa dentro del propio sistema productivo. El vector `y` representa la demanda final externa.

Pasando `Ax` al primer miembro:

$$
x - Ax = y
$$

Sacando factor común:

$$
(I - A)x = y
$$

Se define la matriz de Leontief:

$$
L = I - A
$$

Entonces:

$$
Lx = y
$$

Si `L` es invertible, el sistema tiene una única solución:

$$
x = L^{-1}y
$$

o también:

$$
x = (I - A)^{-1}y
$$

La inversa de Leontief incorpora los requerimientos directos e indirectos. Esto significa que, si aumenta la demanda de un sector, no solo debe aumentar la producción de ese sector, sino también la producción de los sectores que le proveen insumos.

## Punto 1: Producción con dos sectores

**Consigna.** Calcular el vector de producción `x` usando:

$$
x = (I - A)^{-1}y
$$

Se tienen dos sectores: Agricultura e Industria.

$$
A =
\begin{pmatrix}
0.2 & 0.3\\
0.1 & 0.4
\end{pmatrix},
\qquad
y =
\begin{pmatrix}
200\\
150
\end{pmatrix}
$$

La matriz `A` describe las relaciones entre Agricultura e Industria. Usando el orden de sectores:

```text
1. Agricultura
2. Industria
```

los coeficientes se interpretan así:

| Coeficiente | Interpretación |
|---|---|
| 0.2 | Para producir 1 unidad de Agricultura, se necesitan 0.2 unidades de Agricultura. |
| 0.1 | Para producir 1 unidad de Agricultura, se necesitan 0.1 unidades de Industria. |
| 0.3 | Para producir 1 unidad de Industria, se necesitan 0.3 unidades de Agricultura. |
| 0.4 | Para producir 1 unidad de Industria, se necesitan 0.4 unidades de Industria. |

El vector `y` indica la demanda final de cada sector:

$$
y =
\begin{pmatrix}
\text{demanda final de Agricultura}\\
\text{demanda final de Industria}
\end{pmatrix}
=
\begin{pmatrix}
200\\
150
\end{pmatrix}
$$

Primero se calcula la matriz de Leontief:

$$
L = I - A
$$

Como:

$$
I =
\begin{pmatrix}
1 & 0\\
0 & 1
\end{pmatrix}
$$

queda:

$$
L =
\begin{pmatrix}
0.8 & -0.3\\
-0.1 & 0.6
\end{pmatrix}
$$

Luego se calcula la inversa de Leontief:

$$
L^{-1} =
\begin{pmatrix}
1.3333 & 0.6667\\
0.2222 & 1.7778
\end{pmatrix}
$$

Finalmente:

$$
x = L^{-1}y
$$

El resultado obtenido fue:

$$
x =
\begin{pmatrix}
366.6667\\
311.1111
\end{pmatrix}
$$

Esto significa que, para cumplir con una demanda final de `200` unidades de Agricultura y `150` unidades de Industria, la producción total debe ser mayor que esa demanda final. Esto ocurre porque una parte de lo producido se usa como insumo dentro del propio sistema productivo.

Por lo tanto, se necesitan producir aproximadamente `366.67` unidades de Agricultura y `311.11` unidades de Industria. De esa producción total, una parte cubre la demanda final y otra parte cubre los requerimientos intermedios entre Agricultura e Industria.

## Punto 2: Aumento de demanda en Transporte

**Consigna.** Considere 3 sectores: Energía, Transporte y Manufactura. Analizar el efecto de un aumento de demanda final de 50 unidades en Transporte sobre los tres sectores.

La inversa de Leontief ya está dada:

$$
(I - A)^{-1} =
\begin{pmatrix}
1.25 & 0.10 & 0.05\\
0.20 & 1.40 & 0.10\\
0.15 & 0.20 & 1.30
\end{pmatrix}
$$

En esta matriz, cada coeficiente indica cuánto debe aumentar la producción total de un sector cuando aumenta en 1 unidad la demanda final de otro sector, considerando los efectos directos e indirectos.

Usando el orden de sectores:

```text
1. Energía
2. Transporte
3. Manufactura
```

los coeficientes se interpretan por columnas. Cada columna indica qué ocurre si aumenta en 1 unidad la demanda final de ese sector:

| Demanda final que aumenta | Producción de Energía | Producción de Transporte | Producción de Manufactura |
|---|---:|---:|---:|
| Energía | 1.25 | 0.20 | 0.15 |
| Transporte | 0.10 | 1.40 | 0.20 |
| Manufactura | 0.05 | 0.10 | 1.30 |

Por ejemplo, la segunda columna corresponde a un aumento de demanda final en Transporte. Esto significa que, si la demanda final de Transporte aumenta en 1 unidad, la producción de Energía aumenta `0.10`, la producción de Transporte aumenta `1.40` y la producción de Manufactura aumenta `0.20`.

Como en este ejercicio el aumento de demanda se da en Transporte, se usa la segunda columna de la inversa de Leontief. Por eso, al multiplicar por 50, se obtienen los aumentos de producción en Energía, Transporte y Manufactura.

Como se analiza un aumento de demanda final, no se calcula una producción total inicial, sino una variación de producción. Se usa:

$$
\Delta x = (I - A)^{-1}\Delta y
$$

El aumento es de 50 unidades en Transporte, por lo tanto:

$$
\Delta y =
\begin{pmatrix}
0\\
50\\
0
\end{pmatrix}
$$

Multiplicando:

$$
\Delta x =
\begin{pmatrix}
1.25 & 0.10 & 0.05\\
0.20 & 1.40 & 0.10\\
0.15 & 0.20 & 1.30
\end{pmatrix}
\begin{pmatrix}
0\\
50\\
0
\end{pmatrix}
$$

El resultado obtenido fue:

$$
\Delta x =
\begin{pmatrix}
5\\
70\\
10
\end{pmatrix}
$$

Esto significa que, para cumplir con un aumento de `50` unidades en la demanda final de Transporte, no alcanza con producir solamente 50 unidades más de Transporte. Como Transporte necesita insumos de otros sectores, y esos sectores también participan en el proceso productivo, el aumento total de producción debe contemplar los efectos directos e indirectos.

Por lo tanto, ante ese aumento de demanda final, la producción debe aumentar en `5` unidades de Energía, `70` unidades de Transporte y `10` unidades de Manufactura. El sector Transporte aumenta más que las 50 unidades demandadas porque una parte de su producción adicional se utiliza dentro del propio sistema como requerimiento intermedio.

## Punto 3: Producción con cuatro sectores

**Consigna.** Se consideran los sectores Agricultura, Industria, Transporte y Servicios. Calcular el vector de producción total `x`.

Los datos son:

$$
A =
\begin{pmatrix}
0.1 & 0.2 & 0.1 & 0.0\\
0.1 & 0.3 & 0.2 & 0.1\\
0.0 & 0.2 & 0.2 & 0.1\\
0.1 & 0.1 & 0.1 & 0.2
\end{pmatrix},
\qquad
y =
\begin{pmatrix}
100\\
150\\
80\\
120
\end{pmatrix}
$$

La matriz `A` describe las relaciones internas entre los cuatro sectores. Usando el orden:

```text
1. Agricultura
2. Industria
3. Transporte
4. Servicios
```

cada columna indica los insumos necesarios para producir 1 unidad del sector correspondiente. Por ejemplo:

| Producción de 1 unidad de... | Requiere Agricultura | Requiere Industria | Requiere Transporte | Requiere Servicios |
|---|---:|---:|---:|---:|
| Agricultura | 0.1 | 0.1 | 0.0 | 0.1 |
| Industria | 0.2 | 0.3 | 0.2 | 0.1 |
| Transporte | 0.1 | 0.2 | 0.2 | 0.1 |
| Servicios | 0.0 | 0.1 | 0.1 | 0.2 |

Por ejemplo, para producir 1 unidad de Industria se necesitan `0.2` unidades de Agricultura, `0.3` unidades de Industria, `0.2` unidades de Transporte y `0.1` unidades de Servicios.

El vector `y` indica la demanda final de cada sector:

$$
y =
\begin{pmatrix}
\text{demanda final de Agricultura}\\
\text{demanda final de Industria}\\
\text{demanda final de Transporte}\\
\text{demanda final de Servicios}
\end{pmatrix}
=
\begin{pmatrix}
100\\
150\\
80\\
120
\end{pmatrix}
$$

Primero se calcula:

$$
L = I - A
$$

La matriz obtenida fue:

$$
L =
\begin{pmatrix}
0.9 & -0.2 & -0.1 & 0.0\\
-0.1 & 0.7 & -0.2 & -0.1\\
0.0 & -0.2 & 0.8 & -0.1\\
-0.1 & -0.1 & -0.1 & 0.8
\end{pmatrix}
$$

Luego se calcula la inversa de Leontief:

$$
L^{-1} =
\begin{pmatrix}
1.1673 & 0.4205 & 0.2617 & 0.0853\\
0.2146 & 1.6642 & 0.4763 & 0.2676\\
0.0764 & 0.4557 & 1.4025 & 0.2323\\
0.1823 & 0.3176 & 0.2676 & 1.3231
\end{pmatrix}
$$

Finalmente:

$$
x = L^{-1}y
$$

El resultado obtenido fue:

$$
x =
\begin{pmatrix}
210.9674\\
341.3114\\
216.0835\\
246.0453
\end{pmatrix}
$$

Por lo tanto, para satisfacer la demanda final dada, se deben producir aproximadamente:

| Sector | Producción total |
|---|---:|
| Agricultura | 210.9674 |
| Industria | 341.3114 |
| Transporte | 216.0835 |
| Servicios | 246.0453 |

Esto significa que, para cumplir con una demanda final de `100` unidades de Agricultura, `150` unidades de Industria, `80` unidades de Transporte y `120` unidades de Servicios, la producción total requerida es mayor que la demanda final de cada sector.

Esto ocurre porque parte de la producción se destina a satisfacer la demanda final y otra parte se utiliza como insumo intermedio dentro del sistema productivo. Por eso, por ejemplo, aunque la demanda final de Industria es `150`, se necesitan producir aproximadamente `341.31` unidades de Industria en total.

## Punto 4: Aumento de demanda en Energía

**Consigna.** Se consideran los sectores Agricultura, Industria, Energía, Transporte y Servicios. Analizar el efecto de un aumento de 100 unidades en la demanda final del sector Energía sobre los cinco sectores.

La inversa de Leontief ya está dada:

$$
(I - A)^{-1} =
\begin{pmatrix}
1.20 & 0.10 & 0.05 & 0.00 & 0.02\\
0.15 & 1.30 & 0.10 & 0.05 & 0.00\\
0.05 & 0.10 & 1.25 & 0.10 & 0.05\\
0.10 & 0.15 & 0.10 & 1.40 & 0.10\\
0.05 & 0.05 & 0.05 & 0.10 & 1.20
\end{pmatrix}
$$

En esta matriz, cada coeficiente indica cuánto debe aumentar la producción total de un sector cuando aumenta en 1 unidad la demanda final de otro sector, considerando los efectos directos e indirectos.

Usando el orden de sectores:

```text
1. Agricultura
2. Industria
3. Energía
4. Transporte
5. Servicios
```

los coeficientes se interpretan por columnas. Cada columna indica qué ocurre si aumenta en 1 unidad la demanda final de ese sector:

| Demanda final que aumenta | Producción de Agricultura | Producción de Industria | Producción de Energía | Producción de Transporte | Producción de Servicios |
|---|---:|---:|---:|---:|---:|
| Agricultura | 1.20 | 0.15 | 0.05 | 0.10 | 0.05 |
| Industria | 0.10 | 1.30 | 0.10 | 0.15 | 0.05 |
| Energía | 0.05 | 0.10 | 1.25 | 0.10 | 0.05 |
| Transporte | 0.00 | 0.05 | 0.10 | 1.40 | 0.10 |
| Servicios | 0.02 | 0.00 | 0.05 | 0.10 | 1.20 |

Como en este ejercicio el aumento de demanda se da en Energía, se usa la tercera columna de la inversa de Leontief. Esto significa que, si la demanda final de Energía aumenta en 1 unidad, la producción de Agricultura aumenta `0.05`, la producción de Industria aumenta `0.10`, la producción de Energía aumenta `1.25`, la producción de Transporte aumenta `0.10` y la producción de Servicios aumenta `0.05`.

Como se analiza un aumento de demanda final, se usa:

$$
\Delta x = (I - A)^{-1}\Delta y
$$

El aumento es de 100 unidades en Energía, entonces:

$$
\Delta y =
\begin{pmatrix}
0\\
0\\
100\\
0\\
0
\end{pmatrix}
$$

Multiplicando:

$$
\Delta x =
\begin{pmatrix}
1.20 & 0.10 & 0.05 & 0.00 & 0.02\\
0.15 & 1.30 & 0.10 & 0.05 & 0.00\\
0.05 & 0.10 & 1.25 & 0.10 & 0.05\\
0.10 & 0.15 & 0.10 & 1.40 & 0.10\\
0.05 & 0.05 & 0.05 & 0.10 & 1.20
\end{pmatrix}
\begin{pmatrix}
0\\
0\\
100\\
0\\
0
\end{pmatrix}
$$

El resultado obtenido fue:

$$
\Delta x =
\begin{pmatrix}
5\\
10\\
125\\
10\\
5
\end{pmatrix}
$$

El aumento de 100 unidades en la demanda final de Energía genera los siguientes aumentos de producción:

| Sector | Aumento de producción |
|---|---:|
| Agricultura | 5 |
| Industria | 10 |
| Energía | 125 |
| Transporte | 10 |
| Servicios | 5 |

Esto significa que, para cumplir con un aumento de `100` unidades en la demanda final de Energía, no alcanza con producir solamente 100 unidades más de Energía. Como Energía se relaciona con los demás sectores dentro del sistema productivo, el aumento total de producción debe contemplar los efectos directos e indirectos.

Por lo tanto, ante ese aumento de demanda final, la producción debe aumentar en `5` unidades de Agricultura, `10` unidades de Industria, `125` unidades de Energía, `10` unidades de Transporte y `5` unidades de Servicios. El sector Energía aumenta más que las 100 unidades demandadas porque una parte de su producción adicional se utiliza como requerimiento intermedio dentro del sistema.
