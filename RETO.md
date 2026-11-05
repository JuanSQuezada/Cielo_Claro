# Reto extra: Cielo Claro

## Contexto
El 1 de noviembre de 2026, un jet privado cayó en Florida tras reportar hielo y turbulencia.
En aviación, las decisiones dependen de leer rápido las condiciones del cielo.

## Objetivo
Construir en una hora un panel web que ayude a evaluar si las condiciones
son seguras para volar sobre Latacunga (aeropuerto SELT).

## Requisitos mínimos
1. Mostrar el METAR actual decodificado y una categoría de vuelo (VFR, MVFR, IFR, LIFR).
2. Alertar si hay nubes de tormenta (CB) o tormenta eléctrica (TS).
3. Mostrar en un mapa los eventos naturales activos (NASA EONET).
4. Graficar el viento y la humedad del último mes (NASA POWER).
5. Permitir subir una foto del cielo y clasificarla con un modelo de IA.
6. Estar publicado en internet: el jurado lo abre con un link.

## Categorías de vuelo
| Categoría | Techo | Visibilidad | Color |
| --- | --- | --- | --- |
| VFR | más de 3000 ft | más de 5 millas | Verde |
| MVFR | 1000–3000 ft | 3–5 millas | Azul |
| IFR | 500 a menos de 1000 ft | 1 a menos de 3 millas | Rojo |
| LIFR | menos de 500 ft | menos de 1 milla | Magenta |
Techo = capa BKN u OVC más baja. Manda la peor condición.

## Datos
- NOAA Aviation Weather: https://aviationweather.gov/data/api/
- NASA POWER: https://power.larc.nasa.gov/
- NASA EONET: https://eonet.gsfc.nasa.gov/

## Entregable
Un link público y un repositorio en GitHub.
