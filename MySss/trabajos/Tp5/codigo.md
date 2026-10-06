# PUNTO 1 - LEY DEL ENFRIAMIENTO DE NEWTON
import numpy as np
import matplotlib.pyplot as plt

def enfriamiento_newton(t, T0, Tamb, k):
  T = Tamb + (T0 - Tamb) * np.exp(-k * t)
  return T

T0 = 90
Tamb = 60
k = 0.09
t = np.linspace(0, 60, 1000)

T = enfriamiento_newton(t, T0, Tamb, k)

print(f"T(t) = {Tamb} + ({T0} - {Tamb}) * e^(-{k} t)")
print(f"T(0) = {enfriamiento_newton(0, T0, Tamb, k):.4f}")
print(f"T(10) = {enfriamiento_newton(10, T0, Tamb, k):.4f}")
print(f"T(30) = {enfriamiento_newton(30, T0, Tamb, k):.4f}")
print(f"T(60) = {enfriamiento_newton(60, T0, Tamb, k):.4f}")

plt.figure(figsize=(8, 4))
plt.plot(t, T, label=f'$T(t) = {Tamb} + ({T0} - {Tamb}) e^{{-{k}t}}$', color='b', linewidth=2)
plt.axhline(Tamb, color='red', linestyle='--', linewidth=1.5, label=f'$T_{{amb}} = {Tamb}$')

plt.title('Ley del Enfriamiento de Newton')
plt.xlabel('Tiempo (t)')
plt.ylabel('Temperatura T(t)')
plt.axhline(0, color='black', linewidth=1.2)
plt.axvline(0, color='black', linewidth=1.2)
plt.grid(True, linestyle='--', alpha=0.6)
plt.legend()
plt.ylim(-5, T0 + 10)

plt.show()

k_valores = [0.04, 0.08, 0.16]
colores = ['g', 'b', 'm']

plt.figure(figsize=(8, 4))
for ki, color in zip(k_valores, colores):
  Ti = enfriamiento_newton(t, T0, Tamb, ki)
  plt.plot(t, Ti, label=f'$k = {ki}$', color=color, linewidth=2)

plt.axhline(Tamb, color='red', linestyle='--', linewidth=1.5, label=f'$T_{{amb}} = {Tamb}$')
plt.title('Enfriamiento de Newton para distintos k')
plt.xlabel('Tiempo (t)')
plt.ylabel('Temperatura T(t)')
plt.axhline(0, color='black', linewidth=1.2)
plt.axvline(0, color='black', linewidth=1.2)
plt.grid(True, linestyle='--', alpha=0.6)
plt.legend()
plt.ylim(-5, T0 + 10)

plt.show()



# PUNTO 2 - CRECIMIENTO POBLACIONAL (MALTHUS)
import numpy as np
import matplotlib.pyplot as plt

def crecimiento_malthus(t, P0, r):
  P = P0 * np.exp(r * t)
  return P

P0 = 100
r = 0.15
t = np.linspace(0, 20, 1000)

P = crecimiento_malthus(t, P0, r)

print(f"P(t) = {P0} * e^({r} t)")
print(f"P(0) = {crecimiento_malthus(0, P0, r):.4f}")
print(f"P(5) = {crecimiento_malthus(5, P0, r):.4f}")
print(f"P(10) = {crecimiento_malthus(10, P0, r):.4f}")
print(f"P(20) = {crecimiento_malthus(20, P0, r):.4f}")

plt.figure(figsize=(8, 4))
plt.plot(t, P, label=f'$P(t) = {P0} \\cdot e^{{{r}t}}$', color='b', linewidth=2)

plt.title('Crecimiento Poblacional (Modelo de Malthus)')
plt.xlabel('Tiempo (t)')
plt.ylabel('Poblacion P(t)')
plt.axhline(0, color='black', linewidth=1.2)
plt.axvline(0, color='black', linewidth=1.2)
plt.grid(True, linestyle='--', alpha=0.6)
plt.legend()
plt.ylim(-10, max(P) + 50)

plt.show()

r_valores = [0.08, 0.15, 0.22]
colores = ['g', 'b', 'm']

plt.figure(figsize=(8, 4))
for ri, color in zip(r_valores, colores):
  Pi = crecimiento_malthus(t, P0, ri)
  plt.plot(t, Pi, label=f'$r = {ri}$', color=color, linewidth=2)

plt.title('Modelo de Malthus para distintos r')
plt.xlabel('Tiempo (t)')
plt.ylabel('Poblacion P(t)')
plt.axhline(0, color='black', linewidth=1.2)
plt.axvline(0, color='black', linewidth=1.2)
plt.grid(True, linestyle='--', alpha=0.6)
plt.legend()

plt.show()# PUNTO 2 - CRECIMIENTO POBLACIONAL (MALTHUS)
import numpy as np
import matplotlib.pyplot as plt

def crecimiento_malthus(t, P0, r):
  P = P0 * np.exp(r * t)
  return P

P0 = 100
r = 0.15
t = np.linspace(0, 20, 1000)

P = crecimiento_malthus(t, P0, r)

print(f"P(t) = {P0} * e^({r} t)")
print(f"P(0) = {crecimiento_malthus(0, P0, r):.4f}")
print(f"P(5) = {crecimiento_malthus(5, P0, r):.4f}")
print(f"P(10) = {crecimiento_malthus(10, P0, r):.4f}")
print(f"P(20) = {crecimiento_malthus(20, P0, r):.4f}")

plt.figure(figsize=(8, 4))
plt.plot(t, P, label=f'$P(t) = {P0} \\cdot e^{{{r}t}}$', color='b', linewidth=2)

plt.title('Crecimiento Poblacional (Modelo de Malthus)')
plt.xlabel('Tiempo (t)')
plt.ylabel('Poblacion P(t)')
plt.axhline(0, color='black', linewidth=1.2)
plt.axvline(0, color='black', linewidth=1.2)
plt.grid(True, linestyle='--', alpha=0.6)
plt.legend()
plt.ylim(-10, max(P) + 50)

plt.show()

r_valores = [0.08, 0.15, 0.22]
colores = ['g', 'b', 'm']

plt.figure(figsize=(8, 4))
for ri, color in zip(r_valores, colores):
  Pi = crecimiento_malthus(t, P0, ri)
  plt.plot(t, Pi, label=f'$r = {ri}$', color=color, linewidth=2)

plt.title('Modelo de Malthus para distintos r')
plt.xlabel('Tiempo (t)')
plt.ylabel('Poblacion P(t)')
plt.axhline(0, color='black', linewidth=1.2)
plt.axvline(0, color='black', linewidth=1.2)
plt.grid(True, linestyle='--', alpha=0.6)
plt.legend()

plt.show()  


# PUNTO 3 - DECAIMIENTO RADIOACTIVO
import numpy as np
import matplotlib.pyplot as plt

def decaimiento_radioactivo(t, N0, lamda):
  N = N0 * np.exp(-lamda * t)
  return N

N0 = 800
lamda = 0.12
t = np.linspace(0, 40, 1000)

N = decaimiento_radioactivo(t, N0, lamda)
t_medio = np.log(2) / lamda

print(f"N(t) = {N0} * e^(-{lamda} t)")
print(f"N(0) = {decaimiento_radioactivo(0, N0, lamda):.4f}")
print(f"N(5) = {decaimiento_radioactivo(5, N0, lamda):.4f}")
print(f"N(10) = {decaimiento_radioactivo(10, N0, lamda):.4f}")
print(f"N(20) = {decaimiento_radioactivo(20, N0, lamda):.4f}")
print(f"vida media t1/2 = {t_medio:.4f}")
print(f"N(t1/2) = {decaimiento_radioactivo(t_medio, N0, lamda):.4f}")

plt.figure(figsize=(8, 4))
plt.plot(t, N, label=f'$N(t) = {N0} \\cdot e^{{-{lamda}t}}$', color='b', linewidth=2)
plt.axvline(t_medio, color='red', linestyle='--', linewidth=1.5, label=f'$t_{{1/2}} = {t_medio:.2f}$')

plt.title('Decaimiento Radioactivo')
plt.xlabel('Tiempo (t)')
plt.ylabel('Cantidad N(t)')
plt.axhline(0, color='black', linewidth=1.2)
plt.axvline(0, color='black', linewidth=1.2)
plt.grid(True, linestyle='--', alpha=0.6)
plt.legend()
plt.ylim(-20, N0 + 80)

plt.show()

lamda_valores = [0.06, 0.12, 0.24]
colores = ['g', 'b', 'm']

plt.figure(figsize=(8, 4))
for li, color in zip(lamda_valores, colores):
  Ni = decaimiento_radioactivo(t, N0, li)
  plt.plot(t, Ni, label=f'$\\lambda = {li}$', color=color, linewidth=2)

plt.title('Decaimiento radioactivo para distintos $\\lambda$')
plt.xlabel('Tiempo (t)')
plt.ylabel('Cantidad N(t)')
plt.axhline(0, color='black', linewidth=1.2)
plt.axvline(0, color='black', linewidth=1.2)
plt.grid(True, linestyle='--', alpha=0.6)
plt.legend()
plt.ylim(-20, N0 + 80)

plt.show()
