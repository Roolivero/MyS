"""Punto 3 del TP6: ajuste de mediciones reales con el signo + confirmado.

Los puntos 1 y 2 se conservan exclusivamente en ../Tp6Claude/.
Desde la raíz: .conda-env/bin/python trabajos/Tp6/ajuste_cole.py
"""
from pathlib import Path
import hashlib
import json
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy.io import loadmat
from scipy.optimize import least_squares

BASE = Path(__file__).resolve().parent
MUESTRAS = {"1": "Humana", "2": "Vegetal", "5": "Fantoma de agar"}
DISPOSITIVOS = {"1": "Solartron", "2": "HF2IS Zurich Instruments", "4": "SFB7 Impedimed"}

def impedancia_para_ajuste(f_hz, R0, Rinf, fc_hz, alpha):
    """Función de predicción necesaria para estimar los parámetros del punto 3.

    Usa el signo más confirmado por la cátedra y el exponente alpha del TP.
    Entradas: frecuencias en Hz, resistencias en ohmios, fc en Hz.
    """
    f = np.asarray(f_hz, dtype=float)
    if np.any(~np.isfinite(f)) or np.any(f < 0):
        raise ValueError("Las frecuencias deben ser finitas y no negativas.")
    if not all(np.isfinite([R0, Rinf, fc_hz, alpha])):
        raise ValueError("Los parámetros deben ser finitos.")
    if not (R0 > Rinf >= 0 and fc_hz > 0 and 0 < alpha <= 1):
        raise ValueError("Se requiere R0 > Rinf >= 0, fc > 0 y 0 < alpha <= 1.")
    # omega*tau = (2*pi*f)/(2*pi*fc) = f/fc.
    return Rinf + (R0 - Rinf) / (1 + (1j * f / fc_hz) ** alpha)


def guardar_figura(fig, nombre):
    (BASE / "imagenes_informe").mkdir(exist_ok=True)
    fig.tight_layout()
    fig.savefig(BASE / "imagenes_informe" / f"{nombre}.png", dpi=160)
    return fig


def cargar_datos():
    """Valida integridad y devuelve los 1457 registros originales."""
    metadata = json.loads((BASE / "datos/zenodo_metadata.json").read_text())
    for archivo in metadata["files"]:
        nombre = archivo["key"].replace(" ", "_")
        ruta = BASE / "datos" / nombre
        esperado = archivo["checksum"].split(":")[-1]
        if hashlib.md5(ruta.read_bytes()).hexdigest() != esperado:
            raise ValueError(f"Checksum incorrecto: {ruta.name}")
    return loadmat(BASE / "datos/registros_EIS.mat", simplify_cells=True)["registros"]


def preparar_registro(registro):
    """Conversión explícita de unidades según origen y rango documentado.

    Los registros de Ayllón (origin=4) tienen eje ~19377..6283200,
    compatible con rad/s y el rango declarado 3 kHz..1 MHz.
    Vegetales (sample=2, origin=5) contienen 400..1e6 Hz, compatibles
    con freq_range=2. Solartron (origin=1) ya contiene 1..65000 Hz.
    No se generaliza esta
    conversión a otros grupos que no se usan en este TP.
    """
    a = np.asarray(registro["eis"], dtype=float)
    f = a[:, 0].copy()
    if str(registro["origin"]) == "4":
        f /= 2 * np.pi
        conversion = "rad/s → Hz: eje original / (2π)"
    elif str(registro["origin"]) == "1":
        conversion = "Hz: sin conversión"
    elif str(registro["origin"]) == "5" and str(registro["sample"]) == "2":
        if str(registro["freq_range"]) != "2" or not np.allclose(
                [f.min(), f.max()], [400, 1e6], rtol=0.02):
            raise ValueError("El vegetal no concuerda con la banda declarada.")
        conversion = "Hz: eje compatible con 400 Hz–1 MHz"
    else:
        raise ValueError("Es necesario verificar unidades y signo para este origen.")
    z = a[:, 1] + 1j * a[:, 2]
    mascara = np.isfinite(f) & (f > 0) & np.isfinite(z)
    orden = np.argsort(f[mascara])
    # No se recortan bandas ni se quitan puntos por su error de ajuste.
    return f[mascara][orden], z[mascara][orden], conversion, int((~mascara).sum())


def seleccionar_registros(registros):
    """Selección antes de ajustar: primer ID elegible por clase de muestra.

    Se revisan metadatos, puntos finitos, eje interpretable y un mínimo de
    reactancia interior con al menos cinco frecuencias a cada lado. No se
    calculan errores de ajuste para elegir. El 80% de X negativa admite
    desviaciones de una sola dispersión y no elimina puntos de las curvas.
    """
    auditoria, candidatos = [], []
    for r in sorted(registros, key=lambda x: int(x["id"])):
        muestra, origen = str(r["sample"]), str(r["origin"])
        fila = dict(id=r["id"], muestra_codigo=muestra, origen=origen,
                    seleccionada=False, elegible=False)
        if muestra == "1":
            grupo = origen == "4" and 1 <= int(r["id"]) <= 50
            motivo = "Fuera del grupo humano 001–050 sin errores introducidos documentados"
        elif muestra == "2":
            grupo = origen == "5"
            motivo = "Fuente vegetal no contemplada"
        elif muestra == "5":
            grupo = origen == "1"
            motivo = "Fuente de fantoma no contemplada"
        else:
            grupo = False
            motivo = "Clase fuera del alcance: humana, vegetal y fantoma"
        if not grupo:
            fila["motivo"] = motivo
        else:
            try:
                f, z, conversion, descartados = preparar_registro(r)
                k = int(np.argmin(z.imag))
                fraccion = float(np.mean(z.imag < 0))
                fila.update(n=len(f), descartados=descartados, conversion=conversion,
                            fmin_Hz=f.min(), fmax_Hz=f.max(),
                            fraccion_X_negativa=fraccion, f_pico_observado_Hz=f[k],
                            puntos_antes_pico=k, puntos_despues_pico=len(f)-k-1)
                # Los rangos de estas fuentes permiten interpretar el eje.
                if origen == "4":
                    banda = str(r["freq_range"]) == "5" and np.allclose(
                        [f.min(), f.max()], [3000, 1e6], rtol=0.05)
                elif origen == "1":
                    banda = str(r["freq_range"]) == "1" and np.allclose(
                        [f.min(), f.max()], [1, 65000], rtol=0.02)
                else:
                    banda = True  # El vegetal ya se verificó al preparar.
                cumple = (banda and len(f) >= 30 and descartados == 0
                          and np.all(np.diff(f) > 0) and np.all(z.real > 0)
                          and fraccion >= 0.8 and k >= 5 and len(f)-k-1 >= 5)
                fila["elegible"] = bool(cumple)
                fila["motivo"] = "Cumple controles previos" if cumple else "No cumple controles previos; consultar diagnósticos"
                if cumple:
                    candidatos.append(r)
            except ValueError as error:
                fila["motivo"] = str(error)
        auditoria.append(fila)
    elegidos = {}
    for r in candidatos:
        elegidos.setdefault(str(r["sample"]), r)
    if set(elegidos) != set(MUESTRAS):
        raise ValueError("No hay una curva elegible para cada clase de muestra.")
    ids = {r["id"] for r in elegidos.values()}
    for fila in auditoria:
        if fila["id"] in ids:
            fila.update(seleccionada=True, motivo="Primer ID elegible de su clase; elegido sin ajustar")
    (BASE / "resultados").mkdir(exist_ok=True)
    pd.DataFrame(auditoria).to_csv(BASE / "resultados/auditoria_seleccion.csv", index=False)
    return [elegidos[codigo] for codigo in MUESTRAS], pd.DataFrame(auditoria)


def ajustar_cole(f, z):
    """Ajuste conjunto de Re e Im con el signo más confirmado por la cátedra.

    Parámetros internos: log(Rinf), log(R0-Rinf), log(fc), alpha.
    Todos los puntos y ambas componentes tienen igual peso en ohmios.
    La normalización global sólo mejora la escala numérica.
    """
    f, z = np.asarray(f), np.asarray(z)
    escala = np.median(np.abs(z))
    limites = ([np.log(1e-6), np.log(1e-6), np.log(f.min()/100), 0.01],
               [np.log(1e8), np.log(1e8), np.log(f.max()*100), 1.0])

    def parametros(p):
        ri, dr, fc = np.exp(p[:3])
        return ri + dr, ri, fc, p[3]

    def residuo(p):
        dz = (impedancia_para_ajuste(f, *parametros(p)) - z) / escala
        return np.r_[dz.real, dz.imag]

    ri0 = max(z.real.min()*0.8, 1e-3)
    dr0 = max(z.real.max()-ri0, 1e-3)
    candidatos = []
    for fc0 in np.geomspace(f.min(), f.max(), 5):
        for a0 in (0.35, 0.7, 0.95):
            p0 = [np.log(ri0), np.log(dr0), np.log(fc0), a0]
            ajuste = least_squares(residuo, p0, bounds=limites,
                                   max_nfev=3000, ftol=1e-11, xtol=1e-11, gtol=1e-11)
            if ajuste.success:
                candidatos.append(ajuste)
    if not candidatos:
        raise RuntimeError("Ningún inicio convergió.")
    mejor = min(candidatos, key=lambda x: x.cost)
    p = parametros(mejor.x)
    dz = impedancia_para_ajuste(f, *p) - z
    # RMSE complejo: sqrt(mean(Re(error)^2 + Im(error)^2)).
    rmse = np.sqrt(np.mean(np.abs(dz)**2))
    return p, dict(RMSE_complejo_ohm=rmse,
                   NRMSE_porcentaje=100*rmse/np.sqrt(np.mean(np.abs(z)**2)),
                   error_relativo_medio_porcentaje=100*np.mean(np.abs(dz)/np.abs(z)),
                   inicios_convergentes=len(candidatos),
                   condicion_jacobiano=np.linalg.cond(mejor.jac),
                   parametro_en_limite=bool(np.any(mejor.active_mask)))


def resolver_ajustes(registros):
    seleccion, _ = seleccionar_registros(registros)
    resultados, datos = [], {}
    (BASE / "resultados").mkdir(exist_ok=True)
    for r in seleccion:
        identificador = r["id"]
        f, z, conversion, descartados = preparar_registro(r)
        p, metricas = ajustar_cole(f, z)
        # Control predictivo: ajustar frecuencias alternas y evaluar las restantes.
        p_validacion, _ = ajustar_cole(f[::2], z[::2])
        error_validacion = impedancia_para_ajuste(f[1::2], *p_validacion) - z[1::2]
        pred = impedancia_para_ajuste(f, *p)
        k = int(np.argmin(z.imag))
        resultados.append(dict(id=identificador, muestra=MUESTRAS[str(r["sample"])],
            dispositivo=DISPOSITIVOS[str(r["device"])],
            electrodos={"2": "Bipolar", "4": "Tetrapolar"}.get(str(r["electrode"]), "No informado"),
            origen=r["origin"], conversion=conversion, signo_modelo=1, n=len(f), descartados=descartados,
            f_pico_observado_Hz=f[k], puntos_antes_pico=k, puntos_despues_pico=len(f)-k-1,
            fraccion_X_negativa=float(np.mean(z.imag < 0)),
            decadas_bajo_fc=np.log10(p[2]/f.min()), decadas_sobre_fc=np.log10(f.max()/p[2]),
            fmin_Hz=f.min(), fmax_Hz=f.max(), R0_ohm=p[0], Rinf_ohm=p[1],
            fc_Hz=p[2], tau_s=1/(2*np.pi*p[2]), alpha=p[3],
            RMSE_validacion_ohm=np.sqrt(np.mean(np.abs(error_validacion)**2)), **metricas))
        tabla = pd.DataFrame(dict(f_Hz=f, Re_medido_ohm=z.real, Im_medido_ohm=z.imag,
                                  Re_ajustado_ohm=pred.real, Im_ajustado_ohm=pred.imag,
                                  residuo_Re_ohm=(pred-z).real, residuo_Im_ohm=(pred-z).imag))
        tabla.to_csv(BASE / "resultados" / f"ajuste_ID{identificador}.csv", index=False)
        datos[identificador] = (f, z, p)
    resumen = pd.DataFrame(resultados)
    resumen.to_csv(BASE / "resultados/parametros_ajustados.csv", index=False)
    return resumen, datos


def graficar_ajuste(identificador, f, z, p):
    ff = np.geomspace(f.min(), f.max(), 1000)
    zz = impedancia_para_ajuste(ff, *p)
    error = impedancia_para_ajuste(f, *p)-z
    fig, ax = plt.subplots(2, 2, figsize=(11, 7))
    ax[0, 0].plot(z.real, -z.imag, ".", label="Medición")
    ax[0, 0].plot(zz.real, -zz.imag, label="Ajuste")
    ax[0, 0].set(xlabel="Re(Z) [Ω]", ylabel="−Im(Z) [Ω]", title="Plano complejo")
    ax[0, 0].set_aspect("equal", adjustable="datalim")
    for a, medido, modelo, titulo, ylabel in [
        (ax[0, 1], z.real, zz.real, "Resistencia", "Re(Z) [Ω]"),
        (ax[1, 0], z.imag, zz.imag, "Reactancia", "Im(Z) [Ω]")]:
        a.semilogx(f, medido, ".", label="Medición")
        a.semilogx(ff, modelo, label="Ajuste: Cole (+)")
        a.axvline(p[2], color="gray", ls=":", label="fc ajustada")
        a.set(xlabel="Frecuencia [Hz]", ylabel=ylabel, title=titulo)
    ax[1, 1].semilogx(f, error.real, label="Error Re")
    ax[1, 1].semilogx(f, error.imag, label="Error Im")
    ax[1, 1].axhline(0, color="gray", lw=0.7)
    ax[1, 1].set(xlabel="Frecuencia [Hz]", ylabel="Ajuste − medición [Ω]", title="Residuos")
    for a in ax.flat:
        a.legend(fontsize=8)
        a.grid(alpha=0.3)
    fig.suptitle(f"Conjunto ID{identificador} — Cole con signo +")
    return guardar_figura(fig, f"ajuste_ID{identificador}")


def graficar_datos_seleccionados(seleccion):
    """Inspección antes de ajustar: datos completos, sin curvas predichas."""
    fig, ax = plt.subplots(2, len(seleccion), figsize=(13, 7), squeeze=False)
    for columna, r in enumerate(seleccion):
        f, z, _, _ = preparar_registro(r)
        k = int(np.argmin(z.imag))
        ax[0, columna].semilogx(f, z.real, ".-")
        ax[1, columna].semilogx(f, z.imag, ".-")
        ax[0, columna].set_title(f"{MUESTRAS[str(r['sample'])]} — ID{r['id']}")
        ax[0, columna].set_ylabel("Re(Z) [Ω]")
        ax[1, columna].set_ylabel("Im(Z) [Ω]")
        ax[1, columna].axhline(0, color="gray", lw=0.8)
        for a in ax[:, columna]:
            a.axvline(f[k], color="tab:orange", ls=":", label="Mínimo observado de Im(Z)")
            a.set_xlabel("Frecuencia [Hz]")
            a.grid(alpha=0.3)
        ax[1, columna].legend(fontsize=7)
    fig.suptitle("Conjuntos seleccionados antes del ajuste — escalas verticales independientes")
    return guardar_figura(fig, "datos_seleccionados")


def main():
    registros = cargar_datos()
    seleccion, _ = seleccionar_registros(registros)
    plt.close(graficar_datos_seleccionados(seleccion))
    resumen, datos = resolver_ajustes(registros)
    for identificador, (f, z, p) in datos.items():
        plt.close(graficar_ajuste(identificador, f, z, p))
    print(resumen.to_string(index=False))


if __name__ == "__main__":
    main()
