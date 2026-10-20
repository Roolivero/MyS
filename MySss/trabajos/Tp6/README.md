# Trabajo Práctico 6 — Fórmula del PDF

Se usa el signo **menos del PDF** en el modelo, las simulaciones principales y los ajustes. La forma con más queda disponible como comparación explícita. No se cambia el signo de las mediciones.

- `Tp6.ipynb`: desarrollo y controles interactivos para R₀, R∞, fc y α, selección de tejidos y comparación de fórmulas.
- `informeTP6.md`: explicación y resultados, incluidas las limitaciones de los ajustes con el signo del PDF.
- `cole.py`: implementación del modelo (`signo=-1` por defecto), simulaciones y ajustes.
- `cole_interactivo.py`: panel de ipywidgets; empieza en «Consigna literal: signo −».
- `datos/`: archivos originales y metadatos de Zenodo.
- `resultados/`: parámetros, predicciones y residuos. `parametros_ajustados.csv` identifica `signo_modelo=-1`.
- `imagenes_informe/`: figuras recalculadas.

Desde la raíz del repo:

```bash
./.conda-env/bin/python -m notebook trabajos/Tp6/Tp6.ipynb
```

Elegir **Python (MyS)** y ejecutar las celdas en orden hasta el explorador. Los gráficos cambian al soltar los controles; el kernel debe seguir activo. `ipywidgets` ya está instalado y se agregó a `environment.yml`. Si Jupyter estaba abierto durante la instalación, reiniciar el servidor y recargar la pestaña.

Si el kernel no aparece, registrarlo:

```bash
./.conda-env/bin/python -m ipykernel install --user --name mys-notebook --display-name "Python (MyS)"
```

Se usa `python -m notebook` porque el lanzador `jupyter` conserva una ruta anterior del repositorio. Para regenerar los cálculos sin interfaz:

```bash
MPLCONFIGDIR=/tmp/mys-matplotlib MPLBACKEND=Agg ./.conda-env/bin/python trabajos/Tp6/cole.py
```

Los cuatro ajustes con la fórmula del PDF alcanzan α=1 y no describen satisfactoriamente la reactancia de los registros seleccionados. El informe explica esta incompatibilidad; converger no implica que el modelo sea adecuado.

Datos: Dell’Osa, Bravo y Villanueva Jousset (2025), [Zenodo, DOI 10.5281/zenodo.15795175](https://doi.org/10.5281/zenodo.15795175), licencia CC BY 4.0 según los metadatos. No hace falta descargar los archivos nuevamente.
