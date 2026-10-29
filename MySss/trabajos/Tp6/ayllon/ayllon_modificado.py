import numpy as np

def metodo_ayllon_modificado(matriz: np.ndarray, a: int, c: int) -> np.ndarray:
    """
    Método de Ayllon Modificado para Cole-Cole
    
    Parámetros:
    -----------
    matriz : numpy array (Nx3)
        Columna 1: frecuencia
        Columna 2: real o módulo
        Columna 3: imaginaria o fase
    a : int
        0 = datos en real/imaginaria
        1 = datos en módulo/fase
    c : int
        0 = frecuencia en rad/s
        1 = frecuencia en Hz
    
    Retorna:
    --------
    array : [Rinf, R0, tau, alpha, x0, y0, radio]
    """

    # 1. VALIDACIÓN DE TIPOS (Defensa contra tipos incorrectos)
    if not isinstance(matriz, np.ndarray):
        raise TypeError("El parámetro 'matriz' debe ser un arreglo de NumPy (np.ndarray).")
    
    if not isinstance(a, int) or not isinstance(c, int):
        raise TypeError("Los parámetros 'a' y 'c' deben ser números enteros.")

    # 2. VALIDACIÓN DE ESTRUCTURA (Defensa contra dimensiones incorrectas)
    #Si no es una matriz bidimensional (si es 1 es un arreglo si es 3 es un cubo) O si tiene menos de 3 columnas lanza error
    if matriz.ndim != 2 or matriz.shape[1] < 3:
        raise ValueError(
            f"La matriz de entrada debe tener 2 dimensiones y al menos 3 columnas. "
            f"Dimensiones provistas: {matriz.shape}"
        )

    # 3. VALIDACIÓN DE VALORES/BANDERAS (Defensa contra configuraciones inválidas)
    if a not in (0, 1):
        raise ValueError(f"El parámetro 'a' debe ser 0 o 1. Valor recibido: {a}")
        
    if c not in (0, 1):
        raise ValueError(f"El parámetro 'c' debe ser 0 o 1. Valor recibido: {c}")
    
    #Inicio programa

    
    # 1. Convertir a rectangular(cartesiana)
    if a == 0: 
        X = matriz[:, 1]
        Y = matriz[:, 2]
    else: 
        X = matriz[:, 1] * np.cos(np.radians(matriz[:, 2]))
        Y = matriz[:, 1] * np.sin(np.radians(matriz[:, 2]))
    
    Z = X + 1j * Y

    # 2. Encontrar parámetros de la circunferencia mediante el método de minimos cuadrados
    # mean devuelve la media
    X_mean = np.mean(X)
    Y_mean = np.mean(Y)
    
    # NumPy detecta automaticamente si en la resta los vectores tienen las mismas dimensiones o si la dimension es 1, si es 1
    # aplica el broadcasting que replica el uso explícito de ones(size(X))
    X1 = -2 * X + 2 * X_mean
    X2 = X - X_mean
    a11 = np.sum(X1 * X2)
    
    X3 = -2 * Y + 2 * Y_mean
    a12 = np.sum(X3 * X2)
    
    X4 = Y - Y_mean
    a21 = np.sum(X1 * X4)
    a22 = np.sum(X3 * X4)

    # 3. Construir matriz A (2x2)
    A = np.array([[a11, a12], 
                  [a21, a22]])

    # 4. Construir vector b (2x1)
    # media de la suma de los cuadrados
    mag2_mean = np.mean(X**2 + Y**2)
    X5 = (X**2 + Y**2) - mag2_mean
    b1 = np.sum(X5 * X2)
    b2 = np.sum(X5 * X4)
    b = -np.array([b1, b2])

    # 5. Devuelve las coordenadas del centro (mismo resultado que si invirtiera previamente la matriz)
    C = np.linalg.solve(A, b)

    # 6. Calcular radio
    R2 = C[0]**2 + C[1]**2 + np.mean((X**2) + (Y**2) - (2 * C[0] * X) - (2 * C[1] * Y))
    R = np.sqrt(R2)

    # 7. Extraer Rinf, R0, alpha
    term_geo = np.sqrt(R2 - C[1]**2)
    Rinf = C[0] - term_geo
    R0 = C[0] + term_geo
    
    alpha = 1.0 - (2.0 / np.pi) * np.arctan(C[1] / term_geo)
    if alpha > 1.0:
        alpha = 1.0 + np.arctan(C[1] / np.sqrt(R**2 - C[1]**2)) / (2.0 * np.pi)
    
    # 8. Calcular tau
    # Se busca el mínimo sobre la componente imaginaria real obtenida (Y)
    pos = np.argmin(Y)
    fc = matriz[pos, 0]  # Toma la frecuencia de la columna 0 en esa posición
    tau = 1.0 / (2.0 * np.pi * fc)
        
    # 9. Retornar [Rinf, R0, tau, alpha, x0, y0, radio]
    return np.array([Rinf, R0, tau, alpha, C[0], C[1], R])