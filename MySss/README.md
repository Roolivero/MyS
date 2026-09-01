# MyS

Entorno local para trabajar con Jupyter Notebook en esta carpeta.

## Crear el entorno

Desde esta carpeta:

```bash
conda env create --prefix ./.conda-env -f environment.yml
conda activate ./.conda-env
python -m ipykernel install --user --name mys-notebook --display-name "Python (MyS)"
```

## Abrir el notebook

```bash
conda activate ./.conda-env
jupyter notebook MyS.ipynb
```

Si preferis no guardar el entorno dentro de la carpeta:

```bash
conda env create -f environment.yml
conda activate mys-notebook
jupyter notebook MyS.ipynb
```
