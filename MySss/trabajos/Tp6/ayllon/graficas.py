import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

def graficar_resultados(metodo,datos, resultado, parametro_c):
    """
    Genera automáticamente los 4 gráficos de Cole-Cole a partir de cualquier
    matriz de entrada y sus parámetros calculados.
    """
    # Desempaquetar resultados del método
    Rinf  = resultado[0]
    Rcero = resultado[1]
    tau   = resultado[2]
    alpha = resultado[3]
    
    # Extraer vectores de la matriz de entrada
    frecuencias = datos[:, 0]
    X = datos[:, 1]
    Y = datos[:, 2]

    # Calcular frecuencias angulares (w)
    w = frecuencias * (2 * np.pi) if parametro_c == 1 else frecuencias

    # Calcular la curva teórica estimada
    j = 1j
    Z_est = Rinf + (Rcero - Rinf) / (1 + (j * w * tau) ** alpha)
    EstX = Z_est.real
    EstY = Z_est.imag

    # Construcción de la figura
    fig, axs = plt.subplots(2, 2, figsize=(12, 10))
    fig.suptitle("Análisis de Bioimpedancia - Ajuste de Curvas "+metodo, fontsize=14, fontweight='bold')

    # Subplot 1: Nyquist
    axs[0, 0].plot(X, -Y, '*r', label='Datos Experimentales')
    axs[0, 0].plot(EstX, -EstY, 'g-', label='Estimación Ayllon')
    axs[0, 0].set_xlabel('R ($\Omega$)')
    axs[0, 0].set_ylabel('-X ($\Omega$)')
    axs[0, 0].set_title('Modelo Cole-Cole (Plano Complejo)')
    axs[0, 0].grid(True)
    axs[0, 0].legend()

    # Subplot 2: Módulo de Z
    axs[0, 1].semilogx(w, np.sqrt(X**2 + Y**2), '*r')
    axs[0, 1].semilogx(w, np.abs(Z_est), 'g-')
    axs[0, 1].set_xlabel('$\omega$ (rad/s)')
    axs[0, 1].set_ylabel('|Z| ($\Omega$)')
    axs[0, 1].set_title('|Z| vs Frecuencia Angular ($\omega$)')
    axs[0, 1].grid(True)

    # Subplot 3: Parte Real
    axs[1, 0].semilogx(w, X, '*r')
    axs[1, 0].semilogx(w, EstX, 'g-')
    axs[1, 0].set_xlabel('$\omega$ (rad/s)')
    axs[1, 0].set_ylabel('Real(Z) ($\Omega$)')
    axs[1, 0].set_title('Parte Real vs $\omega$')
    axs[1, 0].grid(True)

    # Subplot 4: Parte Imaginaria
    axs[1, 1].semilogx(w, -Y, '*r')
    axs[1, 1].semilogx(w, -EstY, 'g-')
    axs[1, 1].set_xlabel('$\omega$ (rad/s)')
    axs[1, 1].set_ylabel('-Imag(Z) ($\Omega$)')
    axs[1, 1].set_title('Parte Imaginaria vs $\omega$')
    axs[1, 1].grid(True)

    plt.tight_layout()
    plt.show()