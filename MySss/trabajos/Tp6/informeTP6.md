# TP 6 - Modelo de Cole

## Qué es el modelo de Cole

El modelo de Cole es una fórmula que predice cuánto se opone un tejido biológico al paso de una corriente alterna, según la frecuencia de esa corriente. Esa oposición se llama **impedancia** y se escribe Z.

Lo propusieron los hermanos Kenneth y Robert Cole entre 1928 y 1941. Kenneth era fisiólogo y estudiaba membranas celulares; Robert era físico y trabajaba con materiales dieléctricos. Los dos encontraron que sus mediciones seguían la misma forma, y de ahí salió el modelo.

Hoy se usa en lo que se llama **análisis de bioimpedancia**. Algunos ejemplos concretos:

- **Composición corporal:** las balanzas que estiman agua, músculo y grasa mandan una corriente muy chica por el cuerpo y usan este tipo de modelo para interpretar la medición.
- **Estado de órganos y tejidos:** cuando las células se dañan, sus membranas dejan de funcionar como barrera y la curva de impedancia cambia. Eso se usa en investigación para evaluar tejidos.
- **Alimentos:** sirve para seguir cómo se degradan las paredes celulares de carnes o frutas con el tiempo.

En este TP lo usamos como un sistema a simular: le damos cuatro parámetros que describen un tejido y el modelo nos devuelve cómo responde en todo un rango de frecuencias.

## El tejido visto como un circuito

Para la electricidad, un tejido se parece a un circuito con tres partes: dos caminos con resistencia y una barrera que se comporta como un capacitor.

- **Líquido extracelular:** el fluido salado que rodea a las células. Conduce bien, como un cable con algo de resistencia.
- **Líquido intracelular:** el fluido de adentro de cada célula. También conduce.
- **Membrana celular:** la "piel" de la célula. Actúa como un **capacitor**: frena la corriente lenta y deja pasar la corriente que cambia de sentido muy rápido.

**Analogía del parque acuático.** Pensemos la corriente como agua que recorre un parque. El líquido extracelular son los canales de afuera, siempre abiertos. Las células son piletas cerradas por compuertas de goma (las membranas).

- Si empujamos el agua lento y siempre para el mismo lado (**baja frecuencia**), las compuertas no la dejan entrar. El agua solo va por los canales de afuera. Hay pocos caminos, así que la oposición es **alta**: eso es R0.
- Si el agua va y viene muy rápido (**alta frecuencia**), las compuertas vibran y transmiten el movimiento al agua de adentro. Ahora el agua "pasa" por afuera y por adentro a la vez. Hay más caminos, así que la oposición es **baja**: eso es R∞.

Entre esos dos extremos, la impedancia baja de a poco a medida que sube la frecuencia. El modelo de Cole describe justamente esa transición.

## La fórmula y qué significa cada variable

La fórmula que usamos es la siguiente

$$
Z(\omega) = R_\infty + \frac{R_0 - R_\infty}{1 + (j\omega\tau)^\alpha}
\qquad
\omega = 2\pi f
\qquad
\tau = \frac{1}{2\pi f_c}
$$

La idea general: Z arranca en R0 a baja frecuencia y baja hasta R∞ a alta frecuencia. La fracción es "lo que falta bajar", y se va achicando a medida que crece la frecuencia.

### Lo que entra y lo que sale

- **f (frecuencia, en Hz):** la variable que movemos en la simulación. Es como la perilla del generador de olas del parque: olas lentas o rápidas.
- **ω (frecuencia angular):** es la misma frecuencia expresada en radianes por segundo, ω = 2π·f. No aporta información nueva, es solo la unidad que usa la fórmula.
- **Z(ω) (impedancia):** lo que calcula el modelo. Es "cuánto le cuesta a la corriente atravesar el tejido". Ese costo tiene dos componentes distintos, por eso se escribe con dos números: Z = R + jX. La j solo sirve para separarlos y que no se mezclen en la cuenta.
  - **R (resistencia):** el freno de siempre. La corriente choca contra el líquido, pierde energía y esa energía se va como calor. Es como caminar por un pasillo lleno de gente: cuesta avanzar y ese esfuerzo no se recupera.
  - **X (reactancia):** otro tipo de freno. Las membranas se llenan de carga, se resisten un poco y después la devuelven: la energía no se pierde, se guarda y se devuelve. Es como empujar un resorte: hace fuerza en contra y, al soltarlo, devuelve el empujón. Por eso la corriente y la tensión quedan "desfasadas": una va un poco atrasada respecto de la otra.
  - **Por qué X sale negativa:** por convención, cuando el que guarda la energía es un capacitor (como las membranas), X tiene signo negativo; si fuera una bobina, sería positivo. El signo dice de qué tipo es el freno, no que sea menos freno.
  - **Por qué se grafica −X:** como en un tejido X siempre es negativa, el arco quedaría dibujado para abajo. Con el menos adelante, el arco queda arriba del eje y se lee más cómodo. Es solo una cuestión de presentación.

### Los dos extremos

Para entender R0 y R∞ sirve imaginar una ciudad que la gente tiene que cruzar de un lado al otro. Las **calles** son el líquido extracelular: siempre están abiertas. Los **edificios** son las células: adentro también se puede caminar (el líquido intracelular), pero las puertas son las membranas.

- **R0 (frecuencia cero): las puertas están cerradas.** La gente solo puede ir por las calles, rodeando los edificios. Hay un solo tipo de camino, así que cuesta más cruzar. R0 es la resistencia **solo del líquido de afuera de las células**.
- **R∞ (frecuencia infinita): las puertas están abiertas.** Ahora se puede ir por las calles y también cortar camino por adentro de los edificios. Con dos caminos a la vez es más fácil cruzar. R∞ es la resistencia de **los dos líquidos juntos**, el de afuera y el de adentro.
- **Por qué R∞ siempre es menor que R0:** cuantos más caminos hay, menos le cuesta a la corriente pasar. Es como un peaje: con una sola cabina abierta se forma más fila que con todas abiertas.
- **R0 − R∞:** cuánto aportan las membranas. Si las membranas desaparecieran, R0 y R∞ serían iguales y no habría curva. En el músculo longitudinal: 385 − 70 = 315 Ω.

**Una confusión común.** Parece lógico pensar que R0 son los edificios y R∞ las calles, pero no es así. R0 y R∞ no son lugares de la ciudad: son **dos situaciones distintas** de la misma ciudad, según si las puertas están cerradas o abiertas.

| Qué mide | Situación | Símbolo |
| --- | --- | --- |
| Solo las calles (afuera de las células) | Puertas cerradas, baja frecuencia | R0 = Re |
| Calles y edificios juntos | Puertas abiertas, alta frecuencia | R∞ |
| Solo los edificios (adentro de las células) | Nunca se mide sola, se calcula | Ri |

Una forma fácil de acordarse: la corriente nunca puede usar los edificios sin usar también las calles, porque para llegar a un edificio primero tiene que pasar por la calle. Por eso no hay ninguna situación en la que se mida "solo el edificio", y R∞ siempre incluye a los dos.

**Cómo se calcula la resistencia de adentro (Ri).** Sabemos dos cosas: el camino de afuera solo cuesta R0 = 385 Ω, y los dos caminos juntos cuestan R∞ = 70 Ω. Con eso se puede despejar cuánto tiene que costar el camino de adentro para que, junto con el de afuera, el total dé 70:

$$
R_i = \frac{R_0 \cdot R_\infty}{R_0 - R_\infty}
= \frac{385 \cdot 70}{315}
\approx 85{,}6\ \Omega
$$

Es como vaciar una pileta: si con una canilla se tarda mucho y abriendo una segunda se tarda mucho menos, se puede calcular qué tan rápida es la segunda canilla sola, aunque nunca se haya abierto sola.

El resultado dice que el líquido de adentro (85,6 Ω) conduce mucho mejor que el de afuera (385 Ω), pero a baja frecuencia la corriente no lo puede usar porque las membranas la bloquean. Los equipos de bioimpedancia aprovechan esto para estimar cuánta agua hay fuera de las células y cuánta en total.

La página muestra Re y Ri debajo de las lecturas del simulador del punto 1. No son puntos ni líneas de los gráficos: son números que se calculan a partir de R0 y R∞ y se actualizan al mover los controles.

**Dónde aparecen R0 y R∞ en los gráficos.** No aparecen como un punto marcado ni como una línea: no son algo que se lea directamente, sino lo que define cómo se comporta la curva.

- Marcan **hacia dónde va** la curva: en el gráfico de R vs frecuencia, la curva se va acercando a R0 a la izquierda y a R∞ a la derecha, pero con el rango normal no llega a tocarlos.
- Definen **el tamaño y la posición** del arco en el diagrama de Cole-Cole: cuanto más separados están, más ancho es el arco; si los dos suben, el arco se corre a la derecha.
- Solo se ven "tocados" si se amplía mucho el rango de frecuencias (ver el caso 1 de la lista de pruebas). Por eso, en la práctica, se miden algunos puntos y se estiman R0 y R∞ ajustando la curva.

### Cuándo ocurre el cambio

- **fc (frecuencia característica):** la frecuencia en la mitad de la transición. Ahí la reactancia es máxima, o sea, el punto más alto del arco en el diagrama de Cole-Cole. Para el músculo longitudinal es 37 kHz.
- **τ (constante de tiempo):** el tiempo típico que tardan las membranas en cargarse. Es otra forma de decir fc: τ = 1/(2π·fc). Para 37 kHz da unos 4,3 microsegundos. Un tejido con τ grande "reacciona lento" y su transición pasa a frecuencias más bajas.
- **j:** la unidad imaginaria (j² = −1). No hace falta pensarla como algo raro: indica que la corriente y la tensión **no van sincronizadas**. Es como empujar una puerta de goma: primero se hunde y después devuelve el empujón, con un pequeño retraso.

### α: el aporte de Cole

**α (entre 0 y 1)** mide qué tan parejas son las células del tejido. Es lo que diferencia a Cole del modelo anterior, el de Debye, que suponía células todas iguales.

**Analogía del coro.** Si le pedimos a un coro que deje de cantar a la señal del director:

- **α = 1 (modelo de Debye):** el coro son robots. Todos cortan en el mismo instante. En el diagrama de Cole-Cole, esto da un semicírculo perfecto.
- **α menor que 1 (tejido real):** el coro son personas. Algunos cortan un poco antes, otros un poco después, y el sonido se apaga de a poco. En el tejido pasa lo mismo: hay células grandes, chicas, alargadas, más o menos juntas, y cada grupo responde a su propio ritmo. La transición se "estira" en un rango más amplio de frecuencias y el arco se aplasta.

Cuanto más chico es α, más "desparejo" es el tejido y más achatado queda el arco. Importante: en este TP α es el exponente directo. En otros textos (incluida la guía de referencia) aparece como exponente 1 − α y entonces se lee al revés. Lo aclaramos al final.

### Por qué α no puede ser menor que 0

α es como una perilla que va de "coro perfectamente coordinado" (α = 1) a "coro sin ninguna coordinación" (α = 0). Con α = 0 el desorden es total: la transición se reparte tanto que la impedancia queda fija en el promedio (R0 + R∞)/2 y deja de cambiar con la frecuencia. No existe nada "más desordenado que el desorden total", así que la perilla no tiene adónde ir por debajo de 0.

Si igual metemos un α negativo en la fórmula, la cuenta da resultados que no tienen sentido para un tejido:

- **La resistencia sube con la frecuencia en vez de bajar.** En la ciudad, sería como si al abrir las puertas de los edificios fuera más difícil cruzar. Con más caminos disponibles, la corriente siempre pasa más fácil, nunca más difícil.
- **La reactancia cambia de signo.** El tejido dejaría de comportarse como un capacitor (que guarda carga en las membranas) y pasaría a comportarse como una bobina, que es un componente que las células no tienen.

Otra forma de verlo: α·90° es cuánto se "atrasa" la corriente por culpa de las membranas, como el resorte que tarda en devolver el empujón. Ese atraso va de 0° (sin membranas, solo resistencia) a 90° (membranas perfectas). Un α negativo sería un resorte que devuelve el empujón **antes** de recibirlo, algo que no ocurre.

En la página, si se carga un α negativo, no se grafica y aparece un aviso.

## Punto 1: implementación del modelo

Implementamos el modelo en JavaScript, dentro de una página web que se abre en el navegador. El cálculo está separado de la interfaz, en el archivo `cole.js`, así se puede revisar y probar solo.

### Cómo calcula

1. **Arma la lista de frecuencias.** Genera 400 frecuencias entre 100 Hz y 100 MHz, repartidas en escala logarítmica (la misma cantidad de puntos entre 100 Hz y 1 kHz que entre 1 MHz y 10 MHz). Si las repartiéramos parejo, casi todos los puntos caerían en las frecuencias altas y la zona interesante quedaría vacía.
2. **Calcula τ** a partir de fc: τ = 1/(2π·fc).
3. **Resuelve la potencia compleja.** El término (jωτ)^α no se puede calcular con una calculadora común. El truco es escribirlo como "tamaño" y "ángulo": su tamaño es (ωτ)^α y su ángulo es α·90°. Con eso se separa en parte real e imaginaria usando coseno y seno.
4. **Divide y obtiene Z.** Con el denominador separado en dos partes, se hace la división y salen R y X para esa frecuencia.
5. **Repite para cada frecuencia** y grafica los resultados.

El núcleo del código es este:

```javascript
const m = Math.pow(w * tau, a);      // tamaño de (jωτ)^a
const fi = (a * Math.PI) / 2;         // ángulo de (jωτ)^a
const reD = 1 + m * Math.cos(fi);     // denominador: parte real
const imD = m * Math.sin(fi);         // denominador: parte imaginaria
const modD2 = reD * reD + imD * imD;
const R = Rinf + ((R0 - Rinf) * reD) / modD2;
const X = (-(R0 - Rinf) * imD) / modD2;
```

### Qué muestra la página

En el simulador del punto 1 se pueden mover R0, R∞, fc y α con controles deslizantes, o cargar los valores de un tejido de la tabla. La página dibuja dos gráficos:

- **Diagrama de Cole-Cole:** −X en el eje vertical y R en el horizontal. Cada punto de la curva es una frecuencia. Va de derecha (R0, baja frecuencia) a izquierda (R∞, alta frecuencia).
- **R y −X en función de la frecuencia:** R baja como un escalón suave; −X forma una "loma" con el máximo en fc.

Además muestra:

- **Lecturas:** τ, el valor de Z en fc (resistencia, reactancia, módulo y fase), y Re y Ri, las resistencias de afuera y de adentro de las células calculadas a partir de R0 y R∞.
- **Curvas de referencia:** el botón "Fijar curva como referencia" guarda la curva actual (hasta cuatro). Queda dibujada con una línea más fina, y al mover un parámetro se ve la curva nueva encima de la anterior. Sirve para comparar el "antes y después" de cambiar un solo parámetro, que es la forma de estudiar qué hace cada uno (análisis de sensibilidad). "Borrar referencias" las quita.

Los cuatro parámetros se mueven de forma independiente: cambiar uno no cambia los otros. Así, cualquier cambio en los gráficos se debe al parámetro que se tocó. Lo único que la página controla es que R0 sea mayor que R∞; si no, muestra un aviso en lugar de graficar.

### Cómo comprobamos que el modelo está bien

- **Límites de la resistencia:** con frecuencias muy bajas la resistencia se acerca a R0, y con frecuencias muy altas se acerca a R∞. Con los valores del músculo longitudinal, a 0,001 Hz da 382,4 Ω (R0 = 385) y a 10^15 Hz da 70,4 Ω (R∞ = 70).
- **Límites de la reactancia:** la reactancia hace algo distinto: no va de un valor a otro, sino que arranca en cero, sube y vuelve a cero. Con el músculo longitudinal, −X vale 1,15 Ω a 0,001 Hz y 0,20 Ω a 10^15 Hz, prácticamente cero. El máximo está en el medio, en fc = 37 kHz, donde vale 33,9 Ω.
  - **Corriente muy lenta:** la puerta de goma se empuja tan despacio que se estira hasta el tope y se queda ahí, cerrando el paso. No hay ida y vuelta, así que no hay efecto resorte: la corriente rodea por las calles y solo queda resistencia común (R0).
  - **Corriente rapidísima:** la puerta vibra tan rápido y tan poquito que es como si estuviera abierta. Tampoco llega a hacer de resorte: solo queda resistencia común (R∞).
  - **En el medio (cerca de fc):** el ritmo es justo para que la puerta tenga tiempo de estirarse y devolver el empujón en cada ida y vuelta. Ahí el efecto resorte es máximo.
  - **La hamaca:** es como empujar a alguien en una hamaca. Si se empuja una vez y se espera un minuto, o si se dan empujones muy rápidos y cortos, la hamaca casi no responde; el efecto se nota cuando se empuja a un ritmo parecido al suyo. Hay una diferencia importante: la hamaca tiene resonancia (si se empuja justo a su ritmo, se mueve cada vez más) y las membranas no. Acá el efecto solo llega a un máximo y baja, así que la analogía sirve para la idea del "ritmo justo" y nada más.
  - **En los gráficos:** en el Cole-Cole son las dos puntas del arco, donde toca el eje horizontal (−X = 0), y el punto más alto es fc. En el gráfico de frecuencia es la loma punteada, que nace en cero, sube hasta fc y vuelve a cero.
- **Caso Debye (α = 1): una prueba con resultado conocido.** La idea es probar el código en un caso donde sabemos la respuesta sin usar el programa, solo con geometría. Si el código da lo mismo, está bien.
  - **Qué sabemos de antemano:** con α = 1 el arco es un semicírculo perfecto. Sus dos puntas están sobre el eje en R∞ = 70 Ω y R0 = 385 Ω. El centro está justo en el medio de las dos puntas: (385 + 70)/2 = 227,5 Ω. El radio es la mitad del ancho: (385 − 70)/2 = 157,5 Ω. Y el punto más alto de un semicírculo está justo arriba del centro, a una altura igual al radio.
  - **Qué dice el modelo:** en fc, el punto cae exactamente en ese punto más alto. Entonces, antes de correr nada, sabemos que en fc tiene que dar R = 227,5 Ω y −X = 157,5 Ω.
  - **Qué valores setear en la página:** convención "α (como el enunciado)", R0 = 385 Ω, R∞ = 70 Ω, fc = 37 kHz y α = 1. La forma más rápida es cargar "Músculo long." y cambiar solo α a 1.
  - **Qué hay que ver:** en las lecturas, Z(fc) = 227.5 − j157.5 Ω, |Z(fc)| = 276,7 Ω y fase = −34,70°. En el Cole-Cole, un semicírculo con el punto naranja justo en la cima. En el gráfico de frecuencia, la curva de R cruza los 227,5 Ω en 37 kHz y la loma de −X tiene su pico de 157,5 Ω en esa misma frecuencia.
  - **Un detalle para probar:** si se cambia fc a 10 kHz o a 300 kHz, las lecturas de Z(fc) no cambian, porque fc solo corre la curva en frecuencia: el punto de fc siempre queda en la cima.
- **Punto en fc para cualquier α:** haciendo la cuenta a mano sale que en fc la resistencia siempre es el promedio (R0 + R∞)/2, y la reactancia vale −X = (R0 − R∞)/2 · tan(α·45°). Para el músculo longitudinal (α = 0,27) da 33,9 Ω, igual que la simulación.

## Punto 2: los cinco tejidos de la Tabla 1

Simulamos los cinco tejidos sobre el mismo espectro, de 100 Hz a 100 MHz, y los graficamos juntos: diagrama de Cole-Cole, R en función de la frecuencia y −X en función de la frecuencia. El pulmón es el que tiene el arco más "redondo" y el músculo transversal el más aplastado.

| Tejido | R0 − R∞ \[Ω\] | fc \[kHz\] | α | −X máxima, en fc \[Ω\] | R a 100 Hz \[Ω\] | R a 100 MHz \[Ω\] |
| --- | --- | --- | --- | --- | --- | --- |
| Músculo long. | 315 | 37 | 0,27 | 33,9 | 335 | 101 |
| Músculo trans. | 655 | 27 | 0,24 | 62,5 | 599 | 151 |
| Hígado | 440 | 72 | 0,45 | 81,2 | 523 | 113 |
| Pulmón | 370 | 100 | 0,59 | 92,4 | 436 | 74 |
| Bazo | 490 | 373 | 0,36 | 71,2 | 529 | 111 |

Valores calculados con la página, usando α como exponente tal como dice el enunciado.

### Qué se ve al compararlos

- **α manda en la forma del arco.** El pulmón no es el que tiene más diferencia entre R0 y R∞, pero como tiene el α más alto (0,59) su arco es el más alto: llega a 92,4 Ω. El músculo transversal tiene casi el doble de "recorrido" (655 Ω), pero con α = 0,24 su arco queda chato y la reactancia no pasa de 62,5 Ω.
- **Con α chico, el arco no cierra en el rango.** Para el músculo transversal, a 100 Hz la resistencia todavía está en 599 Ω (lejos de 730) y a 100 MHz en 151 Ω (lejos de 75). La transición es tan gradual que necesitaría muchas más décadas de frecuencia. El pulmón, en cambio, casi llega a sus dos extremos (436 y 74 Ω).
- **El mismo músculo, dos resultados distintos.** Músculo longitudinal y transversal son el mismo tejido medido en dos direcciones. A lo largo de las fibras, la corriente recorre células alargadas y cruza pocas membranas; atravesándolas, tiene que cruzar muchas más. Por eso R0 casi se duplica (385 contra 730 Ω). Esto se llama **anisotropía**.
- **fc corre la curva en frecuencia.** El bazo tiene la fc más alta (373 kHz), así que en los gráficos de frecuencia su "loma" de −X aparece más a la derecha que las demás. En el diagrama de Cole-Cole eso no se nota, porque ese gráfico no muestra la frecuencia.
- **En fc, R siempre queda en el promedio.** Por ejemplo, el hígado en 72 kHz tiene R = (540 + 100)/2 = 320 Ω. Lo que cambia entre tejidos es cuánto sube −X en ese punto, y eso depende de α.

## Punto 3: encontrar los parámetros a partir de mediciones reales

### Qué pide este punto

En los puntos 1 y 2 hicimos el camino "de ida": teníamos los parámetros (R0, R∞, fc y α) y el modelo nos daba la curva. El punto 3 es el camino **de vuelta**: tenemos mediciones reales de impedancia y hay que encontrar qué parámetros hacen que la curva del modelo se parezca lo más posible a esas mediciones. Eso se llama **ajuste de curvas**.

Es como lo que hacíamos con los controles del simulador, pero al revés: en vez de mover los parámetros para ver qué curva sale, los movemos hasta que la curva del modelo quede "pegada" a los puntos medidos. Hacerlo a mano sería muy lento, así que lo hace la computadora.

### De dónde salen los datos

La consigna indica una base de datos pública armada por Dell'Osa, Bravo y Villanueva Jousset, publicada en Zenodo (el enunciado dice 2024, pero el registro publicado es de 2025). Tiene 1457 mediciones. Cada medición es un **barrido**: el equipo mide la misma muestra en muchas frecuencias distintas y guarda la resistencia (R) y la reactancia (X) en cada una. O sea, cada barrido es una curva completa, como las que dibuja nuestra página.

Elegimos tres barridos de tipos de muestra bien distintos, para ver si el mismo modelo sirve en todos:

| Barrido | Tipo de muestra | Frecuencias medidas | Rango |
| --- | --- | --- | --- |
| ID 001 | Humana | 256 | 3 kHz a 1 MHz |
| ID 1233 | Vegetal | 100 | 400 Hz a 1 MHz |
| ID 1311 | Fantoma de agar | 50 | 1 Hz a 65 kHz |

Un **fantoma** es una muestra artificial que imita a un tejido, en este caso un gel de agar. Se usa para probar equipos y métodos sin necesitar tejido real.

**Cómo elegimos los barridos (y por qué así).** Antes de ajustar nada, fijamos reglas para decidir qué barridos servían: que tuvieran suficientes frecuencias, que no tuvieran datos rotos, que la reactancia fuera mayormente negativa (comportamiento de capacitor, como un tejido) y que se viera la "loma" de −X con puntos de los dos lados. De los que cumplían, tomamos el primero de cada tipo. Las reglas se fijaron **antes** de ajustar para que la elección no dependiera del resultado: si se eligiera después de ajustar, se podrían conservar solo los que salen bien y el análisis no sería objetivo.

**Un detalle con las unidades.** En el barrido humano, las frecuencias guardadas iban de 19.377 a 6.283.200, pero la documentación decía que la medición era de 3 kHz a 1 MHz. Dividiendo por 2π (el paso de ω a f) los números coinciden, así que se interpretó que estaban guardadas como ω y no como f. Es una deducción, no algo que diga la base de datos.

### Cómo se hace el ajuste

Se hizo en Python, con la función `least_squares` de la librería SciPy. La idea, en simple:

1. **Medir cuánto se equivoca el modelo.** Para cada frecuencia, se compara el valor medido con el que da el modelo, tanto en R como en X. Esa diferencia es el error en ese punto.
2. **Juntar todos los errores en un solo número.** Cada error se eleva al cuadrado y se suman todos. Se elevan al cuadrado para que los errores para arriba y para abajo no se cancelen entre sí, y para que un error grande pese más que varios chiquitos. Por eso el método se llama **mínimos cuadrados**.
3. **Buscar los parámetros que hacen ese número lo más chico posible.** La computadora va probando combinaciones de R0, R∞, fc y α, y se mueve siempre hacia donde el error baja.

Algunas reglas que se le pusieron al programa:

- **Valores con sentido físico:** R0 mayor que R∞, las dos positivas, y α entre 0,01 y 1. Es lo mismo que explicamos en las aclaraciones: así el programa no puede devolver un tejido "imposible".
- **Varios puntos de partida:** se arrancó la búsqueda desde 15 combinaciones distintas y se quedó con la mejor. Es como buscar el punto más bajo de un terreno con niebla: si se parte desde un solo lugar, se puede quedar en un pozo chico sin ver que más allá hay uno más profundo.
- **Una prueba extra:** se repitió el ajuste usando solo la mitad de las frecuencias (una sí, una no) y se comprobó con la otra mitad. Es como estudiar con la mitad de los ejercicios y rendir con la otra mitad: si el resultado es igual de bueno, el modelo no se "aprendió de memoria" los puntos usados.

### El ajuste en la página web

El mismo ajuste también está programado en la página (en JavaScript, archivo `ajuste.js`), con el mismo método, las mismas reglas y los mismos 15 puntos de partida. Da exactamente los mismos resultados que el notebook en Python, lo que sirve como control: dos programas distintos llegan a los mismos números.

En la sección del punto 3 se puede:

1. **Elegir un barrido** (humano, vegetal o fantoma) y ver sus puntos medidos en el diagrama de Cole-Cole y en el gráfico de frecuencia.
2. **Ajustar a mano:** mover R0, R∞, fc y α para intentar que la línea del modelo pase por los puntos. El error se actualiza en vivo, así se ve que "ajustar" es justamente buscar los valores que lo hacen más chico.
3. **Apretar "Ajuste automático"** y comparar lo que encontró la computadora con lo que habíamos logrado a mano. También aparece el error de la prueba con la otra mitad de los puntos.

Al final de la sección hay una tabla con el ajuste automático de los tres barridos.

### Resultados

| Barrido | R0 \[Ω\] | R∞ \[Ω\] | fc | α | Error (NRMSE) |
| --- | --- | --- | --- | --- | --- |
| Humana | 211,9 | 125,0 | 45,0 kHz | 0,56 | 1,4 % |
| Vegetal | 3766,1 | 180,5 | 5,47 kHz | 1,00 (en el límite) | 32,8 % |
| Fantoma de agar | 148,6 | 67,3 | 16,6 Hz | 0,68 | 3,9 % |

El **NRMSE** dice, en porcentaje, cuánto se equivoca el modelo en promedio comparado con el tamaño de lo que se midió. Un 1,4 % quiere decir que la curva del modelo queda casi encima de los puntos medidos; un 33 % quiere decir que no se parecen.

**Humana: ajusta muy bien.** Con un error de 1,4 %, el modelo describe bien cómo baja la resistencia y la loma de la reactancia. Su fc (45 kHz) está en el mismo rango que los tejidos de la Tabla 1, lo cual tiene sentido. Lo único que no sigue es el final del rango: en las frecuencias más altas la reactancia medida vuelve a crecer, y el modelo de Cole no puede hacer eso (su reactancia siempre vuelve a cero). Es un efecto extra que el modelo no incluye.

**Fantoma de agar: ajusta bien.** Error de 3,9 %. Su transición ocurre a frecuencias muy bajas (16,6 Hz), muy por debajo de la de los tejidos. Una posible razón es que se midió con solo dos electrodos, y en ese tipo de medición se mezcla lo que aporta la muestra con lo que aporta el contacto de los electrodos. Con este ajuste no se pueden separar esas dos cosas.

**Vegetal: el modelo no sirve para esta medición.** El error es de casi 33 % y α quedó en el límite de 1: el programa "quería" ir más allá de lo permitido. Además, en las frecuencias más bajas la reactancia medida es positiva, y el modelo de Cole solo puede dar reactancia negativa. Los valores de la tabla son lo mejor que encontró el programa dentro de las reglas, pero **no describen realmente a esa muestra**. Se dejó igual en el informe en vez de cambiarlo por otro barrido que saliera mejor, porque mostrar cuándo el modelo falla también es un resultado.

### Qué aprendemos de este punto

- **Que el programa termine no quiere decir que el resultado sea bueno.** En los tres casos el ajuste "convergió" (encontró una respuesta), pero en el vegetal esa respuesta no sirve. Hay que mirar siempre el error y comparar los gráficos.
- **El modelo de Cole es una simplificación.** Supone una sola transición (una sola loma). Cuando la muestra tiene más de un efecto, o la medición tiene efectos de los electrodos, el modelo no alcanza.
- **Una muestra de cada tipo no alcanza para sacar conclusiones generales.** Las diferencias entre los tres resultados pueden deberse a la muestra, pero también a que se midieron con equipos y montajes distintos.

Datos: Dell'Osa, A. H., Bravo, N. Y. y Villanueva Jousset, T. (2025). [Single dispersion EIS measurements: a compilation](https://doi.org/10.5281/zenodo.15795175). Zenodo. Licencia CC BY 4.0.

## Casos que vale la pena probar en la simulación

Estos son los experimentos que más muestran cómo funciona el modelo. Para cada uno, qué tocar en la página y qué debería verse.

1. **Llegar a los extremos.** Poner el rango de frecuencias de 0,001 Hz a 10^15 Hz con el músculo longitudinal.
   - Se ve: el arco ahora sí arranca en R0 = 385 Ω y termina en R∞ = 70 Ω.
   - Muestra: que los extremos del modelo funcionan, y lo lenta que es la transición cuando α es chico.
2. **El caso ideal (Debye).** Poner α = 1.
   - Se ve: un semicírculo perfecto, con el punto de fc justo arriba del centro. La reactancia máxima es (R0 − R∞)/2 = 157,5 Ω.
   - Muestra: que el modelo de Cole incluye al de Debye como caso particular.
3. **Achatar el arco.** Bajar α de 1 a 0,1 de a poco. Para verlo mejor, fijar como referencia la curva con α = 1 y la de α = 0,27, y dejar α = 0,11 como curva actual: quedan las tres a la vista.
   - Se ve: el arco se aplasta; la loma de −X baja y se ensancha. Con α muy chico, Z casi no cambia con la frecuencia.
   - Muestra: que α representa qué tan parejas son las células. Menos α, transición más repartida.
4. **Mover fc.** Cambiar fc de 10 kHz a 500 kHz sin tocar lo demás.
   - Se ve: en los gráficos de frecuencia la curva se corre a izquierda o derecha. La forma del arco en el diagrama de Cole-Cole no cambia, solo qué parte entra en el rango.
   - Muestra: que fc dice **cuándo** ocurre el cambio, no **cómo** es.
5. **Agrandar o achicar las membranas.** Mover R0 y R∞, y después ponerlos casi iguales (por ejemplo, 300 y 290 Ω).
   - Se ve: el arco crece, se achica o se corre. Con valores casi iguales, el arco se reduce casi a un punto.
   - Muestra: que R0 − R∞ es el aporte de las membranas. Si las membranas se rompen (por ejemplo, en un tejido dañado), la curva desaparece.
6. **El mismo músculo en dos direcciones.** En el punto 2, dejar visibles solo los dos músculos.
   - Se ve: el transversal tiene un arco mucho más ancho (R0 casi el doble).
   - Muestra: que la dirección de la corriente importa (anisotropía).
7. **Rango de un equipo real.** Poner el rango de 1 kHz a 1 MHz, que es más o menos lo que mide un equipo comercial.
   - Se ve: solo un pedazo del arco para cada tejido.
   - Muestra: por qué en la práctica se usa el modelo: con un pedazo medido, se ajusta la curva y se estiman R0 y R∞ aunque no se hayan medido.
8. **Cambiar la convención de α.** Elegir la opción "1 − α" arriba de todo.
   - Se ve: los arcos de la tabla se vuelven mucho más redondos (el exponente pasa a ser 0,73 para el músculo longitudinal en vez de 0,27).
   - Muestra: que la misma tabla se lee muy distinto según la convención. Ver la sección de aclaraciones.
9. **Valores imposibles.** Probar α negativo, α mayor que 1, o R0 menor que R∞.
   - Se ve: la página no grafica y muestra un aviso.
   - Muestra: los límites físicos de los parámetros, explicados en la próxima sección.

**Casos para el punto 3** (sección "Ajuste a mediciones reales"):

1. **Ajustar a mano antes que la computadora.** Elegir el barrido humano y mover los controles tratando de que la línea pase por los puntos.
   - Se ve: el error baja a medida que la curva se acerca a los puntos. Después, "Ajuste automático" llega a 1,4 %.
   - Muestra: que ajustar es buscar los valores que hacen más chico el error; la computadora solo lo hace más rápido y mejor.
2. **Un caso donde el modelo falla.** Elegir el barrido vegetal y apretar "Ajuste automático".
   - Se ve: error de casi 33 %, α en el límite de 1 y puntos medidos con −X negativa (abajo del eje) que la línea del modelo no puede seguir.
   - Muestra: que el programa siempre devuelve un resultado, pero hay que mirar el error y los gráficos para saber si sirve.
3. **Una transición muy distinta.** Elegir el fantoma de agar.
   - Se ve: la loma de −X está alrededor de 16 Hz, muy por debajo de la de los tejidos (decenas de kHz).
   - Muestra: que el mismo modelo se puede ajustar a muestras muy distintas, pero los valores dependen también de cómo se midió (acá, con solo dos electrodos).


### Dos formas de escribir α

Hay dos convenciones y conviene no mezclarlas:

| Convención | Exponente | Caso ideal (semicírculo) | Tejido más desparejo |
| --- | --- | --- | --- |
| Este TP | α | α = 1 | α más chico |
| Cole y Cole (1941) y la guía de referencia | 1 − α | α = 0 | α más grande |

No cambia el modelo, solo cómo se nombra el número. En este trabajo usamos los valores de α de la Tabla 1 tal como indica el enunciado, es decir, como exponente de la fórmula. Observamos que, con la otra convención, el exponente de los tejidos de la tabla quedaría entre 0,41 y 0,76, un rango más parecido al obtenido con mediciones reales en el punto 3 (0,56 para la muestra humana y 0,68 para el fantoma). Por eso la página permite ver ambas lecturas con un selector.

### Por qué ningún parámetro puede ser negativo

- **R0 y R∞ positivas, y R0 mayor que R∞.** La resistencia mide energía que el tejido gasta como calor. Una resistencia negativa significaría que el tejido **genera** energía, como una pila, y un tejido es pasivo. Además R0 tiene que ser mayor porque a baja frecuencia hay menos caminos para la corriente.
- **τ y fc positivos.** τ es un tiempo: lo que tardan las membranas en cargarse. Un tiempo negativo querría decir que se cargan antes de aplicar la corriente.
- **α entre 0 y 1.** α·90° es el ángulo de desfase que produce la membrana, y tiene que estar entre 0° (resistencia pura) y 90° (capacitor ideal).
  - Con **α negativo**, la cuenta da el mismo modelo pero con R0 y R∞ intercambiados: la resistencia subiría con la frecuencia y la reactancia saldría positiva. Ninguna de las dos cosas pasa en un tejido.
  - Con **α = 0**, Z queda fija en el promedio (R0 + R∞)/2 y deja de depender de la frecuencia.
  - Con **α mayor que 1**, el arco se "infla" más allá del semicírculo, algo que no se puede armar con elementos pasivos.

Si al medir un tejido real un ajuste devolviera α fuera de ese rango, lo más probable es un error de medición (por ejemplo, efectos de los electrodos o de los cables a alta frecuencia), no una propiedad del tejido.

## Fuentes

- Cole, K. S. y Cole, R. H. (1941). "Dispersion and Absorption in Dielectrics I. Alternating Current Characteristics". *Journal of Chemical Physics*, 9(4), 341-351. Artículo original del modelo.
- Cole, K. S. (1980). [Comentario retrospectivo en Citation Classics](https://garfield.library.upenn.edu/classics1980/A1980JA35000001.pdf), archivo de la Universidad de Pensilvania. Cuenta cómo surgió el diagrama a partir de mediciones en tejidos.
- NPTEL, Indian Institute of Technology. [Module 4: Dielectric Ceramics, circuit representation and impedance analysis](https://archive.nptel.ac.in/content/storage2/courses/113104005/lecture24/24_2.htm).
- NASA Technical Reports Server. [Informe técnico sobre análisis de relajación dieléctrica (1966)](https://ntrs.nasa.gov/api/citations/19660007936/downloads/19660007936.pdf). Uso del diagrama de Cole-Cole para verificar datos.
- Artículo de 2023 sobre [estimación de parámetros del modelo de Cole en hardware embebido](https://dx.doi.org/10.1038/s41598-023-31860-w). *Scientific Reports*. Modelo de Cole aplicado a bioimpedancia.
- Guía de referencia del grupo: "El Modelo de Cole en Bioimpedancia" (analogías del parque acuático y del coro).
- Enunciado del Trabajo Práctico 6, Modelos y Simulación 2026.
- Dell'Osa, A. H., Bravo, N. Y. y Villanueva Jousset, T. (2025). [Single dispersion EIS measurements: a compilation](https://doi.org/10.5281/zenodo.15795175). Zenodo. Datos del punto 3, licencia CC BY 4.0.
- Ayllón, D., Gil-Pita, R. y Seoane, F. (2016). [Detection and classification of measurement errors in bioimpedance spectroscopy](https://doi.org/10.1371/journal.pone.0156522). *PLoS ONE*. Origen del barrido humano usado en el punto 3.
