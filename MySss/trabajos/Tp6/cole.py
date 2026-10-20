"""TP6: simulación y ajuste complejo del modelo de Cole.

Desde la raíz: .conda-env/bin/python trabajos/Tp6/cole.py
No requiere conexión: utiliza los datos originales incluidos en datos/.
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
TEJIDOS = pd.DataFrame([
    ["Músculo longitudinal", 385, 70, 37, 0.27],
    ["Músculo transversal", 730, 75, 27, 0.24],
    ["Hígado", 540, 100, 72, 0.45],
    ["Pulmón", 440, 70, 100, 0.59],
    ["Bazo", 550, 60, 373, 0.36],
], columns=["tejido", "R0_ohm", "Rinf_ohm", "fc_kHz", "alpha"])
IDS = ("001", "025", "050", "1311")


def cole(f_hz, R0, Rinf, fc_hz, alpha, signo=-1):
    """Impedancia en Ω. Por defecto usa el signo menos del PDF.

    signo=+1 se conserva sólo para comparar con la forma habitual.

    Se usa el exponente alpha de la consigna, sin reemplazarlo por 1-alpha.
    NumPy evalúa la potencia compleja en su rama principal.
    """
    f = np.asarray(f_hz, dtype=float)
    if np.any(~np.isfinite(f)) or np.any(f < 0):
        raise ValueError("Las frecuencias deben ser finitas y no negativas.")
    if not all(np.isfinite([R0, Rinf, fc_hz, alpha])):
        raise ValueError("Los parámetros deben ser finitos.")
    if not (R0 > Rinf >= 0 and fc_hz > 0 and 0 < alpha <= 1):
        raise ValueError("Se requiere R0 > Rinf >= 0, fc > 0 y 0 < alpha <= 1.")
    if signo not in (-1, 1):
        raise ValueError("signo debe ser +1 o -1.")
    # omega*tau = (2*pi*f)/(2*pi*fc) = f/fc.
    return Rinf + (R0 - Rinf) / (1 + signo * (1j * f / fc_hz) ** alpha)


def guardar_figura(fig, nombre):
    (BASE / "imagenes_informe").mkdir(exist_ok=True)
    fig.tight_layout()
    fig.savefig(BASE / "imagenes_informe" / f"{nombre}.png", dpi=160)
    return fig


def simular_tejidos(signo=-1):
    """Mismo espectro de 1 Hz a 1 GHz para los cinco tejidos."""
    f = np.logspace(0, 9, 1600)
    fig, ax = plt.subplots(2, 2, figsize=(12, 8))
    tablas = []
    for t in TEJIDOS.itertuples(index=False):
        z = cole(f, t.R0_ohm, t.Rinf_ohm, t.fc_kHz * 1000, t.alpha, signo)
        ax[0, 0].semilogx(f, z.real, label=t.tejido)
        ax[0, 1].semilogx(f, z.imag, label=t.tejido)
        ax[1, 0].semilogx(f, np.abs(z), label=t.tejido)
        ax[1, 1].semilogx(f, np.angle(z, deg=True), label=t.tejido)
        tablas.append(pd.DataFrame(dict(tejido=t.tejido, f_Hz=f,
                                        Re_Z_ohm=z.real, Im_Z_ohm=z.imag)))
    for a, titulo, unidad in zip(ax.flat, ["Resistencia", "Reactancia", "Módulo", "Fase"],
                                 ["Re(Z) [Ω]", "Im(Z) [Ω]", "|Z| [Ω]", "Fase [°]"]):
        a.set(title=titulo, xlabel="Frecuencia [Hz]", ylabel=unidad)
        a.grid(True, which="both", alpha=0.25)
    ax[0, 0].legend(fontsize=8)
    fig.suptitle("Cinco tejidos — " + ("Cole con signo +" if signo == 1 else "fórmula literal con signo −"))
    guardar_figura(fig, "tejidos_cole" if signo == 1 else "tejidos_formula_literal")
    return fig, pd.concat(tablas, ignore_index=True)


def graficar_nyquist():
    f = np.logspace(-4, 13, 2000)
    fig, ax = plt.subplots(figsize=(10, 5))
    for t in TEJIDOS.itertuples(index=False):
        z = cole(f, t.R0_ohm, t.Rinf_ohm, t.fc_kHz * 1000, t.alpha)
        linea, = ax.plot(z.real, -z.imag, label=t.tejido)
        zc = cole(t.fc_kHz * 1000, t.R0_ohm, t.Rinf_ohm, t.fc_kHz * 1000, t.alpha)
        ax.plot(zc.real, -zc.imag, "o", color=linea.get_color())
    ax.set(xlabel="Re(Z) [Ω]", ylabel="−Im(Z) [Ω]", title="Fórmula del PDF (−): puntos en f = fc")
    ax.set_aspect("equal", adjustable="datalim")
    ax.legend(fontsize=8)
    ax.grid(alpha=0.3)
    return guardar_figura(fig, "tejidos_nyquist")


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
    Solartron (origin=1) ya contiene 1..65000 Hz. No se generaliza esta
    conversión a otros grupos que no se usan en este TP.
    """
    a = np.asarray(registro["eis"], dtype=float)
    f = a[:, 0].copy()
    if str(registro["origin"]) == "4":
        f /= 2 * np.pi
        conversion = "rad/s → Hz: eje original / (2π)"
    elif str(registro["origin"]) == "1":
        conversion = "Hz: sin conversión"
    else:
        raise ValueError("Es necesario verificar unidades y signo para este origen.")
    z = a[:, 1] + 1j * a[:, 2]
    mascara = np.isfinite(f) & (f > 0) & np.isfinite(z)
    orden = np.argsort(f[mascara])
    # No se recortan bandas ni se quitan puntos por su error de ajuste.
    return f[mascara][orden], z[mascara][orden], conversion, int((~mascara).sum())


def ajustar_cole(f, z):
    """Ajuste de la fórmula literal del PDF a Re e Im, sin cambiar los datos.

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
        dz = (cole(f, *parametros(p)) - z) / escala
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
    dz = cole(f, *p) - z
    # RMSE complejo: sqrt(mean(Re(error)^2 + Im(error)^2)).
    rmse = np.sqrt(np.mean(np.abs(dz)**2))
    return p, dict(RMSE_complejo_ohm=rmse,
                   NRMSE_porcentaje=100*rmse/np.sqrt(np.mean(np.abs(z)**2)),
                   error_relativo_medio_porcentaje=100*np.mean(np.abs(dz)/np.abs(z)),
                   inicios_convergentes=len(candidatos),
                   condicion_jacobiano=np.linalg.cond(mejor.jac),
                   parametro_en_limite=bool(np.any(mejor.active_mask)))


def resolver_ajustes(registros):
    seleccion = {r["id"]: r for r in registros}
    resultados, datos = [], {}
    (BASE / "resultados").mkdir(exist_ok=True)
    for identificador in IDS:
        r = seleccion[identificador]
        f, z, conversion, descartados = preparar_registro(r)
        p, metricas = ajustar_cole(f, z)
        # Control predictivo: ajustar frecuencias alternas y evaluar las restantes.
        p_validacion, _ = ajustar_cole(f[::2], z[::2])
        error_validacion = cole(f[1::2], *p_validacion) - z[1::2]
        pred = cole(f, *p)
        resultados.append(dict(id=identificador, muestra="Humano" if r["sample"] == "1" else "Fantoma de agar",
            dispositivo="SFB7 Impedimed" if r["device"] == "4" else "Solartron",
            origen=r["origin"], conversion=conversion, signo_modelo=-1, n=len(f), descartados=descartados,
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
    zz = cole(ff, *p)
    error = cole(f, *p)-z
    fig, ax = plt.subplots(2, 2, figsize=(11, 7))
    ax[0, 0].plot(z.real, -z.imag, ".", label="Medición")
    ax[0, 0].plot(zz.real, -zz.imag, label="Ajuste")
    ax[0, 0].set(xlabel="Re(Z) [Ω]", ylabel="−Im(Z) [Ω]", title="Plano complejo")
    ax[0, 0].set_aspect("equal", adjustable="datalim")
    for a, medido, modelo, titulo, ylabel in [
        (ax[0, 1], z.real, zz.real, "Resistencia", "Re(Z) [Ω]"),
        (ax[1, 0], z.imag, zz.imag, "Reactancia", "Im(Z) [Ω]")]:
        a.semilogx(f, medido, ".", label="Medición")
        a.semilogx(ff, modelo, label="Ajuste: PDF (−)")
        a.axvline(p[2], color="gray", ls=":", label="fc ajustada")
        a.set(xlabel="Frecuencia [Hz]", ylabel=ylabel, title=titulo)
    ax[1, 1].semilogx(f, error.real, label="Error Re")
    ax[1, 1].semilogx(f, error.imag, label="Error Im")
    ax[1, 1].axhline(0, color="gray", lw=0.7)
    ax[1, 1].set(xlabel="Frecuencia [Hz]", ylabel="Ajuste − medición [Ω]", title="Residuos")
    for a in ax.flat:
        a.legend(fontsize=8)
        a.grid(alpha=0.3)
    fig.suptitle(f"Registro ID{identificador} — fórmula del PDF (−)")
    return guardar_figura(fig, f"ajuste_ID{identificador}")


def verificar_modelo():
    """Controles físicos y recuperación de parámetros sintéticos conocidos."""
    p = (500., 80., 40000., 0.65)
    assert np.isclose(cole(0, *p), p[0])
    assert np.isclose(cole(1e24, *p), p[1])
    zc = cole(p[2], *p)
    assert np.isclose(zc.real, (p[0]+p[1])/2)
    assert np.isclose(zc.imag, (p[0]-p[1])/2 / np.tan(np.pi*p[3]/4))
    assert cole(p[2], *p, signo=1).imag < 0
    f = np.geomspace(10, 1e8, 150)
    z = cole(f, *p)
    assert np.all(z.imag > 0)
    recuperados, _ = ajustar_cole(f, z)
    np.testing.assert_allclose(recuperados, p, rtol=1e-5)
    return "Verificados: límites, signo, valor en fc y recuperación sintética de los cuatro parámetros."


def main():
    plt.rcParams.update({"font.size": 10})
    print(verificar_modelo())
    (BASE / "resultados").mkdir(exist_ok=True)
    for signo in (-1, 1):
        fig, tabla = simular_tejidos(signo)
        tabla.to_csv(BASE / "resultados" / ("simulaciones_cole.csv" if signo == 1 else "simulaciones_literal.csv"), index=False)
        plt.close(fig)
    plt.close(graficar_nyquist())
    resumen, datos = resolver_ajustes(cargar_datos())
    for identificador, (f, z, p) in datos.items():
        plt.close(graficar_ajuste(identificador, f, z, p))
    print(resumen.to_string(index=False))


if __name__ == "__main__":
    main()
