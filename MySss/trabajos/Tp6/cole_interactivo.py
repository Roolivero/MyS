"""Explorador para Jupyter. Los controles reutilizan el modelo de cole.py."""

import numpy as np
import matplotlib.pyplot as plt
from cole import TEJIDOS, cole


def figura_interactiva(R0, Rinf, fc_hz, alpha, modo="literal", referencia=None):
    """Grafica sin exportar ni modificar las simulaciones del informe."""
    modos = {"habitual": (1,), "literal": (-1,), "ambas": (1, -1)}
    if modo not in modos:
        raise ValueError("Modo desconocido.")
    f = np.geomspace(1, 1e9, 1200)
    fig, ax = plt.subplots(2, 3, figsize=(14, 8))
    ejes = list(ax.flat)

    def dibujar(p, signo, etiqueta, color, estilo="-", referencia=False):
        z = cole(f, *p, signo=signo)
        zc = cole(p[2], *p, signo=signo)
        series = (z.real, z.imag, np.abs(z), np.angle(z, deg=True))
        valores_fc = (zc.real, zc.imag, np.abs(zc), np.angle(zc, deg=True))
        for a, valores, valor_fc in zip(ejes[:4], series, valores_fc):
            a.semilogx(f, valores, estilo, color=color, label=etiqueta,
                       alpha=0.55 if referencia else 1)
            if not referencia:
                a.plot(p[2], valor_fc, "o", color=color, ms=5)
                a.axvline(p[2], color=color, ls=":", alpha=0.4)
        ejes[4].plot(z.real, -z.imag, estilo, color=color, label=etiqueta,
                     alpha=0.55 if referencia else 1)
        if not referencia:
            ejes[4].plot(zc.real, -zc.imag, "o", color=color, ms=5)

    if referencia is not None:
        dibujar(referencia, -1, "Tejido de referencia: PDF (−)", "gray", "--", True)
    for signo in modos[modo]:
        dibujar((R0, Rinf, fc_hz, alpha), signo,
                 "Cole habitual (+)" if signo == 1 else "Consigna literal (−)",
                 "tab:blue" if signo == 1 else "tab:orange")
    for a, titulo, unidad in zip(ejes[:4],
            ("Resistencia", "Reactancia", "Módulo", "Fase"),
            ("Re(Z) [Ω]", "Im(Z) [Ω]", "|Z| [Ω]", "Fase [°]")):
        a.set(title=titulo, xlabel="Frecuencia [Hz]", ylabel=unidad)
    ejes[4].set(title="Plano de Cole", xlabel="Re(Z) [Ω]", ylabel="−Im(Z) [Ω]")
    ejes[4].set_aspect("equal", adjustable="datalim")
    ejes[5].axis("off")
    ejes[5].text(0, 0.95,
        f"R₀ = {R0:.1f} Ω\nR∞ = {Rinf:.1f} Ω\n"
        f"fc = {fc_hz/1000:.4g} kHz\nτ = {1e6/(2*np.pi*fc_hz):.4g} µs\nα = {alpha:.2f}\n\n"
        "Puntos: frecuencia fc de cada curva.\n"
        "Gris: parámetros del tejido seleccionado.\n\n"
        "R₀ y R∞: extremos resistivos.\n"
        "fc: mueve la transición en frecuencia.\n"
        "α: modifica su ancho y el arco.\n\n"
        "El rango 1 Hz–1 GHz explora la ecuación;\n"
        "no garantiza validez física en toda la banda.",
        transform=ejes[5].transAxes, va="top", fontsize=10, linespacing=1.6)
    for a in ejes[:5]:
        a.grid(True, alpha=0.25)
        a.legend(fontsize=8)
    fig.tight_layout()
    return fig


def crear_explorador():
    """Devuelve el panel y sus controles; requiere un kernel activo."""
    import ipywidgets as w
    from IPython.display import display

    estilo = {"description_width": "140px"}
    ancho = w.Layout(width="540px")
    controles = {
        "tejido": w.Dropdown(options=TEJIDOS.tejido.tolist(), description="Cargar tejido:",
                             style=estilo, layout=ancho),
        "R0": w.FloatSlider(value=385, min=1, max=2000, step=1,
                             description="R₀ [Ω]", continuous_update=False,
                             style=estilo, layout=ancho),
        "Rinf": w.FloatSlider(value=70, min=0, max=384, step=1,
                               description="R∞ [Ω]", continuous_update=False,
                               style=estilo, layout=ancho),
        "fc_hz": w.FloatLogSlider(value=37000, base=10, min=0, max=7, step=0.02,
                                   description="fc [Hz]", readout_format=".4g",
                                   continuous_update=False, style=estilo, layout=ancho),
        "alpha": w.FloatSlider(value=0.27, min=0.05, max=1, step=0.01,
                                description="α", continuous_update=False,
                                style=estilo, layout=ancho),
        "modo": w.Dropdown(options=[("Consigna literal: signo −", "literal"),
                                     ("Cole habitual: signo +", "habitual"),
                                     ("Comparar ambas fórmulas", "ambas")],
                            description="Fórmula:", style=estilo, layout=ancho),
        "restablecer": w.Button(description="Restablecer tejido", icon="undo"),
    }
    formula = w.HTML()
    salida = w.Output()
    estado = {"cargando": False}

    def referencia():
        t = TEJIDOS.loc[TEJIDOS.tejido == controles["tejido"].value].iloc[0]
        return (float(t.R0_ohm), float(t.Rinf_ohm), float(t.fc_kHz)*1000, float(t.alpha))

    def actualizar(change=None):
        if estado["cargando"]:
            return
        estado["cargando"] = True
        try:
            # Impide R∞ >= R₀; el slider se adapta si baja R₀.
            controles["Rinf"].max = controles["R0"].value - 1
        finally:
            estado["cargando"] = False
        modo = controles["modo"].value
        signo = "+" if modo == "habitual" else "−" if modo == "literal" else "±"
        formula.value = (
            "<b>Fórmula activa:</b> Z(f) = R∞ + (R₀ − R∞) / "
            f"[1 {signo} (j f/fc)<sup>α</sup>]. "
            "Se utiliza el signo − del PDF en el trabajo. El + queda para comparar. "
            "<br>En el plano de Cole se dibuja −Im(Z): ese menos sólo cambia "
            "el eje vertical del gráfico, no la ecuación."
        )
        with salida:
            salida.clear_output(wait=True)
            fig = figura_interactiva(
                **{k: controles[k].value for k in ("R0", "Rinf", "fc_hz", "alpha", "modo")},
                referencia=referencia())
            display(fig)
            plt.close(fig)

    def cargar(change=None):
        estado["cargando"] = True
        try:
            r0, ri, fc, a = referencia()
            controles["R0"].value = r0
            controles["Rinf"].max = r0 - 1
            controles["Rinf"].value = ri
            controles["fc_hz"].value = fc
            controles["alpha"].value = a
        finally:
            estado["cargando"] = False
        actualizar()

    for nombre in ("R0", "Rinf", "fc_hz", "alpha", "modo"):
        controles[nombre].observe(actualizar, names="value")
    controles["tejido"].observe(cargar, names="value")
    controles["restablecer"].on_click(cargar)
    panel = w.VBox([controles["tejido"], controles["R0"], controles["Rinf"],
                    controles["fc_hz"], controles["alpha"], controles["modo"],
                    controles["restablecer"], formula, salida])
    actualizar()
    return panel, controles
