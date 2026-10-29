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

## Punto 3: qué modelo describe mejor las mediciones reales

### Qué pide este punto

En los puntos 1 y 2 hicimos el camino "de ida": teníamos los parámetros (R0, R∞, fc y α) y el modelo nos daba la curva. El punto 3 es el camino **de vuelta**: tenemos mediciones reales de impedancia y hay que encontrar qué curva se parece lo más posible a esas mediciones. Eso se llama **ajuste de curvas**.

Al principio lo encaramos dando por sentado que el modelo correcto era el de Cole, y solo buscábamos sus parámetros. La idea era otra: **no suponer el modelo de entrada**, sino probar varias fórmulas sobre el conjunto de datos y quedarse con la que mejor lo describe. Cole es una de las candidatas, pero tiene que ganarse el lugar. Además, la consigna pide los valores característicos de Cole para los datos, así que esos también los calculamos.

Hay una idea que conviene tener clara desde el principio. "Un modelo para toda la base" quiere decir **una misma fórmula para todos los barridos**, pero cada barrido tiene sus propios valores de parámetros. Es como un molde de ropa: el molde es el mismo, pero cada prenda se corta a la medida de cada persona. Por eso dos barridos ajustados con el mismo modelo pueden verse muy distintos en los gráficos.

### De dónde salen los datos

La consigna indica una base de datos pública armada por Dell'Osa, Bravo y Villanueva Jousset, publicada en Zenodo (el enunciado dice 2024, pero el registro publicado es de 2025). Tiene 1457 mediciones. Cada medición es un **barrido**: el equipo mide la misma muestra en muchas frecuencias distintas y guarda la resistencia (R) y la reactancia (X) en cada una. O sea, cada barrido es una curva completa, como las que dibuja nuestra página.

Los barridos vienen de distintos trabajos y tipos de muestra. Los agrupamos así:

| Grupo | Barridos | De dónde salen |
| --- | --- | --- |
| Humana (Ayllón, sin errores) | 50 | Mediciones de Ayllón et al. (2016) |
| Humana (Ayllón, con errores) | 1180 | Las mismas mediciones con errores agregados a propósito, para estudiar cómo detectarlos |
| Humana (González Correa) | 36 | González Correa (2018) |
| Humana (De Lorenzo) | 2 | De Lorenzo et al. (1997) |
| Vegetal | 28 | Mediciones de Bertemes Filho (no publicadas) |
| Fantoma de agar | 147 | Dell'Osa et al. (2019) |
| Animal | 14 | Mediciones de Bertemes Filho (no publicadas) |

Un **fantoma** es una muestra artificial que imita a un tejido, en este caso un gel de agar. Se usa para probar equipos y métodos sin necesitar tejido real.

Usamos **todos los barridos de la base salvo los animales**: 1443 en total. Los 14 animales quedaron afuera porque tienen resistencias negativas o en cero, algo imposible para una muestra real (ver la sección "Por qué ningún parámetro puede ser negativo"). Son datos dañados.

**Un detalle con las unidades.** No todos los grupos guardan los datos igual, así que antes de ajustar los pasamos todos a la misma forma: frecuencia en Hz, R y X en ohmios, y X negativa cuando la muestra se comporta como capacitor.

- En las mediciones de Ayllón, las frecuencias guardadas iban de 19.377 a 6.283.200, pero la documentación decía que la medición era de 3 kHz a 1 MHz. Dividiendo por 2π (el paso de ω a f) los números coinciden, así que se interpretó que estaban guardadas como ω y no como f. Es una deducción, no algo que diga la base de datos.
- En González Correa las frecuencias estaban en kHz y la reactancia con el signo cambiado; en De Lorenzo, solo la reactancia con el signo cambiado.

### Los cinco modelos que probamos

Probamos cinco fórmulas. Todas parten de la misma idea del punto 1 (la impedancia baja de R0 a R∞ con una "loma" de reactancia en el medio) y se diferencian en cuántas cosas pueden acomodar:

| Modelo | Parámetros | Qué agrega |
| --- | --- | --- |
| Debye | 3 | Es Cole con α = 1: un semicírculo perfecto, como el coro de robots. |
| Cole | 4 | El modelo del TP: una sola loma, más o menos achatada según α. |
| Cole con retardo | 5 | Cole más un pequeño retraso de tiempo, que representa lo que aportan los cables y el equipo en las frecuencias más altas. |
| Havriliak-Negami | 5 | Cole con un exponente más, que permite lomas "torcidas" (más empinadas de un lado que del otro). |
| Cole doble | 7 | Dos términos de Cole sumados: dos lomas, cada una con su tamaño, su fc y su α. |

**Cole doble**, en la analogía de la ciudad, sería como tener dos tipos de edificios con puertas distintas: unas se abren con corriente más lenta y otras con corriente más rápida. Cada tipo arma su propia loma. Si una de las dos lomas vale cero, Cole doble se convierte en Cole común, así que Cole es un caso particular de Cole doble.

### Cómo se hace el ajuste

La idea es la misma para los cinco modelos:

1. **Medir cuánto se equivoca el modelo.** Para cada frecuencia, se compara el valor medido con el que da el modelo, tanto en R como en X. Esa diferencia es el error en ese punto.
2. **Juntar todos los errores en un solo número.** Cada error se eleva al cuadrado y se suman todos. Se elevan al cuadrado para que los errores para arriba y para abajo no se cancelen entre sí, y para que un error grande pese más que varios chiquitos. Por eso el método se llama **mínimos cuadrados**.
3. **Buscar los parámetros que hacen ese número lo más chico posible.** La computadora va probando valores y se mueve siempre hacia donde el error baja. El método que usamos se llama Levenberg-Marquardt.

Algunas reglas que se le pusieron al programa:

- **Valores con sentido físico:** resistencias positivas y α entre 0,01 y 1. Es lo mismo que explicamos en las aclaraciones: así el programa no puede devolver un tejido "imposible". La única excepción es la segunda loma de Cole doble, que puede tener tamaño negativo para poder seguir mediciones raras (lo vemos en el vegetal).
- **Buenos puntos de partida:** la búsqueda tiene que arrancar desde algún lado. Es como buscar el punto más bajo de un terreno con niebla: si se parte desde un mal lugar, se puede quedar en un pozo chico sin ver que más allá hay uno más profundo. Por eso los modelos se encadenan: Cole arranca desde los valores que da el **método de Ayllon** (lo explicamos abajo), y los modelos más complicados arrancan desde la solución de Cole. Además, Cole prueba otros 6 puntos de partida repartidos por si Ayllon falla.

El ajuste está programado en JavaScript, en el archivo `modelos.js` de la página. Para la base completa usamos ese mismo archivo desde un script (`herramientas/calcular-base.js`), así los números del informe, el resumen de la página y el explorador de barridos salen exactamente del mismo código. Ajustar los 1443 barridos tarda unos 12 minutos.

### El método de Ayllon: los valores de Cole sin probar y corregir

El docente nos compartió una implementación del **método de Ayllon** (Ayllón, Seoane y Gil-Pita, 2009), una forma de sacar los parámetros de Cole sin el "probar y corregir" del ajuste. Se apoya en la geometría del diagrama de Cole-Cole.

En el punto 1 vimos que el arco de Cole es un pedazo de circunferencia. Entonces:

1. **Se busca la circunferencia que mejor pasa por los puntos medidos.** Esto es una cuenta directa, de una sola vez: no hay que adivinar valores ni repetir nada.
2. **Los dos lugares donde la circunferencia corta el eje horizontal son R∞ y R0**, como las dos puntas del arco.
3. **α sale de qué tan abajo del eje quedó el centro.** En el caso Debye (α = 1) el centro está justo sobre el eje; cuanto más se hunde, más achatado es el arco y más chico es α.
4. **fc es la frecuencia del punto medido más alto del arco** (donde −X es máxima), y τ = 1/(2π·fc).

Tiene dos ventajas: es rápido y no necesita valores iniciales. Por eso lo usamos como punto de partida del ajuste. Pero tiene límites que vimos con los datos:

- **Supone una sola loma.** Si la medición tiene dos, la circunferencia queda en el medio de las dos y no describe ninguna.
- **Necesita ver el arco.** Si la medición corta el arco antes de su punto más alto, se tiene solo un pedazo casi recto y la circunferencia que mejor pasa por ahí puede quedar "flotando" sin tocar el eje. Entonces no hay R0 ni R∞, y el método no da valores.
- **fc solo puede ser una de las frecuencias medidas.** Si el equipo midió pocas frecuencias, fc queda aproximada.

**Ayllon, Cole y Cole doble no son tres respuestas distintas.** Es un solo camino:

1. **Ayllon** da los valores de Cole de forma directa.
2. **El ajuste de Cole** arranca desde ahí y los corrige.
3. **El ajuste de Cole doble** arranca desde la solución de Cole.

Es como resolver un problema difícil empezando por una versión más simple: la versión simple no es la respuesta, pero ayuda a llegar.

### Cómo comparamos los modelos

Elegir "el que tiene menos error" parece lo obvio, pero tiene una trampa: **un modelo con más parámetros casi siempre ajusta un poco mejor**, aunque no describa mejor la muestra. Para no caer en eso usamos dos controles:

- **BIC (criterio de información bayesiano).** Es un puntaje que premia el buen ajuste pero **resta puntos por cada parámetro extra**. Un modelo más complicado solo gana si la mejora en el ajuste vale los parámetros que agrega. En cada barrido "gana" el modelo con el mejor BIC.
- **La prueba con la otra mitad.** Se ajusta el modelo usando solo la mitad de las frecuencias (una sí, una no) y se mide el error en la otra mitad, que el modelo no vio. Es como estudiar con la mitad de los ejercicios y rendir con la otra mitad: si el resultado es igual de bueno, el modelo no se "aprendió de memoria" los puntos usados.

Para medir el error usamos el **NRMSE**, que dice, en porcentaje, cuánto se equivoca el modelo en promedio comparado con el tamaño de lo que se midió. Un 1 % quiere decir que la curva del modelo queda casi encima de los puntos medidos; un 35 % quiere decir que no se parecen.

### Resultados en toda la base

En los 1443 barridos, cada modelo ganó en este porcentaje:

| Modelo | Gana en |
| --- | --- |
| Cole doble | 60,6 % |
| Cole con retardo | 37,6 % |
| Cole | 1,7 % |
| Debye | 0,1 % |
| Havriliak-Negami | 0 % |

Separado por grupo (los errores son medianas, o sea, el valor del barrido "del medio" de cada grupo):

| Grupo | Modelo que más gana | Error de Cole | Error de Cole doble | Cole doble con la otra mitad | Ayllon da valores en |
| --- | --- | --- | --- | --- | --- |
| Humana (Ayllón, sin errores) | Cole con retardo (100 %) | 1,45 % | 0,24 % | 0,25 % | 100 % |
| Humana (Ayllón, con errores) | Cole doble (61 %) | 0,93 % | 0,20 % | 0,20 % | 100 % |
| Humana (González Correa) | Cole con retardo (69 %) | 7,01 % | 3,40 % | 3,86 % | 31 % |
| Humana (De Lorenzo) | Cole doble (100 %) | 0,95 % | 0,45 % | 0,45 % | 100 % |
| Vegetal | Cole doble (100 %) | 35,26 % | 0,91 % | 0,91 % | 100 % |
| Fantoma de agar | Cole doble (77 %) | 3,60 % | 2,35 % | 2,31 % | 100 % |

Qué se ve grupo por grupo:

- **Humanas de Ayllón y De Lorenzo:** todos los modelos con forma de Cole ajustan bien (alrededor de 1 % o menos). Cole doble y Cole con retardo bajan el error a 0,2-0,5 %, porque siguen un efecto extra en las frecuencias más altas (la reactancia medida vuelve a crecer al final del rango) que el Cole común no puede seguir. En las mediciones sin errores gana Cole con retardo; en las que tienen errores agregados, gana más seguido Cole doble.
- **Humanas de González Correa:** es el grupo que peor ajusta. Se midió de 5 kHz a 1 MHz, y en ese rango **el arco nunca llega a su punto más alto**: la reactancia sigue subiendo hasta la última frecuencia. Los modelos tienen que "imaginar" el resto del arco. Por la misma razón, Ayllon da valores solo en el 31 % de estos barridos.
- **Vegetal:** es el caso que define la elección. Cole, Cole con retardo y Havriliak-Negami quedan en 35 % de error: con una sola loma no pueden seguir la medición. Cole doble baja a 0,9 %.
- **Fantoma de agar:** Cole ya ajusta razonablemente (3,6 %) y Cole doble algo mejor (2,3 %).

En todos los grupos, el error de Cole doble con la otra mitad es casi igual al error normal. O sea, **Cole doble no está memorizando los puntos**: describe de verdad la forma de las curvas.

**Con la submuestra los resultados eran los mismos.** Antes de correr la base completa habíamos probado con una muestra al azar de hasta 15 barridos por grupo (77 en total). Ahí Cole doble ganaba en el 49 % y su peor error mediano era 3,7 %; con la base completa gana en el 61 % y su peor error mediano es 3,4 %. La conclusión no cambió.

### Valores de Cole en tres barridos de ejemplo

La consigna pide los valores característicos de Cole. Estos son los de tres barridos de tipos de muestra distintos, obtenidos con Ayllon (directo) y con el ajuste de Cole (que arranca desde Ayllon):

| Barrido | Método | R0 \[Ω\] | R∞ \[Ω\] | fc | α | Error |
| --- | --- | --- | --- | --- | --- | --- |
| ID 001, humana | Ayllon | 207,1 | 127,1 | 39,0 kHz | 0,64 | 2,4 % |
| | Cole ajustado | 211,9 | 125,0 | 45,0 kHz | 0,56 | 1,4 % |
| ID 1233, vegetal | Ayllon | 4369,2 | 151,7 | 3,66 kHz | 0,92 | 38,0 % |
| | Cole ajustado | 3766,1 | 180,5 | 5,47 kHz | 1,00 (en el límite) | 32,8 % |
| ID 1311, fantoma de agar | Ayllon | 144,1 | 68,7 | 20 Hz | 0,82 | 5,0 % |
| | Cole ajustado | 148,6 | 67,3 | 16,6 Hz | 0,68 | 3,9 % |

- **Ayllon queda cerca del ajuste**, pero siempre un poco peor. Es lógico: la circunferencia solo mira la forma del arco, no en qué frecuencia cae cada punto. El ajuste corrige eso.
- **Humana:** Cole ajusta muy bien. Su fc (45 kHz) está en el mismo rango que los tejidos de la Tabla 1, lo cual tiene sentido.
- **Fantoma:** su transición ocurre a frecuencias muy bajas (16,6 Hz), muy por debajo de la de los tejidos. Una posible razón es que se midió con solo dos electrodos, y en ese tipo de medición se mezcla lo que aporta la muestra con lo que aporta el contacto de los electrodos.
- **Vegetal: estos valores no describen a la muestra.** Tanto Ayllon como Cole dan errores de más de 30 %, y α quedó en el límite de 1: el programa "quería" ir más allá de lo permitido. Además, en las frecuencias más bajas la reactancia medida es positiva, y el modelo de Cole solo puede dar reactancia negativa. Son lo mejor que se puede hacer con una sola loma, una especie de "Cole equivalente" que resume dos efectos en uno, pero no una descripción confiable.

Con Cole doble, el mismo barrido vegetal baja a 1,0 % de error. Lo hace con una segunda loma de tamaño negativo cerca de los 450 Hz, que es justamente lo que le permite seguir la reactancia positiva de las frecuencias bajas.

### Qué modelo elegimos y por qué

**Elegimos Cole doble.** No gana en todos los grupos (en dos grupos humanos gana Cole con retardo), pero es **el único que nunca ajusta mal**: su peor error mediano es 3,4 %, mientras que Cole llega a 35 % y Cole con retardo también. Si hay que elegir una sola fórmula para toda la base, conviene la que sirve en todos lados.

Hay que leerlo con cuidado: que Cole doble ajuste mejor **no quiere decir que todas las muestras tengan dos tipos de células**. Muchas veces la segunda loma está "absorbiendo" algo que no es de la muestra: el efecto de los cables en las frecuencias más altas o el de los electrodos en las más bajas. Se nota en dónde cae la segunda loma: en unos 7 de cada 10 barridos humanos queda por encima de la frecuencia más alta que se midió, y en unos 7 de cada 10 fantomas, por debajo de la más baja. O sea, fuera de lo medido, siguiendo un efecto que solo asoma en un borde del rango. Cole doble es la fórmula que mejor describe **las mediciones**, con todo lo que traen.

### El punto 3 en la página web

La sección del punto 3 tiene tres partes:

1. **Los cinco modelos candidatos**, con una tarjeta para cada uno.
2. **Resultado en la base:** el modelo elegido, un gráfico de en qué porcentaje de barridos gana cada modelo, otro con el error de cada modelo en cada grupo, y la tabla por grupo de arriba.
3. **Ver un barrido de cerca:** se elige un grupo y cualquiera de sus barridos (o uno al azar). La página muestra los puntos medidos y las curvas de los modelos en el diagrama de Cole-Cole y en los gráficos de R y −X contra la frecuencia. Con las casillas se elige qué modelos ver; Ayllon aparece como una línea punteada. Abajo hay dos tablas: una con el error y el BIC de cada modelo en ese barrido, y otra con los valores de Cole según Ayllon, el ajuste de Cole y el de Cole doble.

Los datos de cada grupo se cargan recién cuando se lo elige, porque toda la base junta pesa varios megas.

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

**Casos para el punto 3** (sección "Ver un barrido de cerca"):

1. **Un caso donde Cole falla.** Elegir el grupo Vegetal y dejar visibles Cole y Cole doble.
   - Se ve: la línea de Cole no puede seguir los puntos (error de más de 30 %), y hay puntos medidos con −X negativa (abajo del eje). Cole doble pasa por encima de los puntos.
   - Muestra: por qué hace falta comparar modelos en vez de suponer uno, y por qué se eligió Cole doble.
2. **Ayllon contra el ajuste.** Elegir el barrido humano ID 001 con la casilla de Ayllon activada.
   - Se ve: la línea punteada de Ayllon queda muy cerca de la de Cole. En la tabla de abajo, los valores son parecidos y el error de Ayllon es algo mayor (2,4 % contra 1,4 %).
   - Muestra: que Ayllon es un buen punto de partida, y que el ajuste lo termina de corregir.
3. **Cuando Ayllon no puede.** Elegir el grupo Humana (González Correa) y el barrido ID 1275.
   - Se ve: no hay línea de Ayllon, y la tabla dice que la circunferencia no corta el eje real. La loma de −X sigue subiendo hasta la última frecuencia medida.
   - Muestra: que Ayllon necesita ver el arco completo; acá la medición se corta antes del punto más alto.
4. **El mismo modelo, curvas distintas.** Elegir varios barridos al azar con Cole doble visible.
   - Se ve: curvas muy distintas entre sí, todas bien ajustadas por la misma fórmula.
   - Muestra: que el modelo es uno solo, pero cada barrido tiene sus propios valores de parámetros.


### Dos formas de escribir α

Hay dos convenciones y conviene no mezclarlas:

| Convención | Exponente | Caso ideal (semicírculo) | Tejido más desparejo |
| --- | --- | --- | --- |
| Este TP | α | α = 1 | α más chico |
| Cole y Cole (1941) y la guía de referencia | 1 − α | α = 0 | α más grande |

No cambia el modelo, solo cómo se nombra el número. En este trabajo usamos los valores de α de la Tabla 1 tal como indica el enunciado, es decir, como exponente de la fórmula. Observamos que, con la otra convención, el exponente de los tejidos de la tabla quedaría entre 0,41 y 0,76, un rango más parecido al obtenido con mediciones reales en el punto 3 (en los grupos donde el arco se mide completo, el α típico del ajuste de Cole va de 0,56 en las humanas sin errores a 0,76 en los fantomas). Por eso la página permite ver ambas lecturas con un selector.

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
- Ayllón, D., Gil-Pita, R. y Seoane, F. (2016). [Detection and classification of measurement errors in bioimpedance spectroscopy](https://doi.org/10.1371/journal.pone.0156522). *PLoS ONE*. Origen de los barridos humanos de Ayllón usados en el punto 3.
- Ayllón, D., Seoane, F. y Gil-Pita, R. (2009). [Cole equation and parameter estimation from electrical bioimpedance spectroscopy measurements: a comparative study](https://doi.org/10.1109/IEMBS.2009.5334494). *Conferencia IEEE EMBC*. Origen del método de Ayllon usado en el punto 3; la implementación en Python fue compartida por el docente.
