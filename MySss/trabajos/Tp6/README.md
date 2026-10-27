# TP6 — Punto 3: tres clases de muestra

Esta carpeta contiene únicamente el punto 3. `../Tp6Claude/` conserva los puntos 1 y 2 sin modificaciones. Se usa el signo **más confirmado por el docente**.

La selección se rehízo por diversidad de muestra y controles previos al ajuste. Se elige el primer ID elegible de cada clase: **001 (humana), 1233 (vegetal) y 1311 (fantoma de agar)**. Son tres barridos completos, con 406 frecuencias medidas. La elegibilidad no depende del error de ajuste. El informe incluye una explicación de la elección y sus limitaciones.

- `Punto3.ipynb`: selección, inspección de datos, ajuste y gráficos.
- `informePunto3.md`: criterios de selección, unidades, método y discusión de los tres resultados.
- `ajuste_cole.py`: selección reproducible y ajuste conjunto de Re e Im.
- `datos/`: archivos originales de Zenodo, documentación y metadatos.
- `resultados/auditoria_seleccion.csv`: revisión de los 1457 registros, elegibilidad y motivos.
- `resultados/parametros_ajustados.csv`: parámetros y diagnósticos de los tres conjuntos.
- `resultados/ajuste_ID*.csv`: datos completos, predicciones y residuos.
- `imagenes_informe/`: datos antes del ajuste y tres figuras de ajuste.

El vegetal no se describe satisfactoriamente con una dispersión (NRMSE ≈32.83%, α=1 en el límite). Se conserva ese caso sin cambiar signos, recortar puntos o elegir otro por menor error. Sus parámetros no deben presentarse como caracterización física confiable.

Desde la raíz del repositorio:

```bash
./.conda-env/bin/python -m notebook trabajos/Tp6/Punto3.ipynb
```

Elegir el kernel **Python (MyS)** y ejecutar las celdas en orden. Los datos ya están descargados. Para regenerar selección, ajustes y figuras:

```bash
MPLCONFIGDIR=/tmp/mys-matplotlib MPLBACKEND=Agg ./.conda-env/bin/python trabajos/Tp6/ajuste_cole.py
```

Fuente: Dell’Osa, Bravo y Villanueva Jousset (2025), [Zenodo, DOI 10.5281/zenodo.15795175](https://doi.org/10.5281/zenodo.15795175), licencia CC BY 4.0 según los metadatos.
