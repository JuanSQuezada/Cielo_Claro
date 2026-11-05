# Cielo Claro

Panel web para evaluar si las condiciones son seguras para volar sobre Latacunga (aeropuerto SELT), construido para el reto de práctica estilo Space Apps descrito en [RETO.md](./RETO.md).

Construido con Claude Code siguiendo la secuencia de prompts documentada en [BITACORA.md](./BITACORA.md).

## Qué hace

- Muestra el METAR actual (decodificado y texto crudo) y calcula la categoría de vuelo (VFR, MVFR, IFR, LIFR) con el semáforo de color correspondiente.
- Alerta si el METAR trae nubes de tormenta (CB) o tormenta eléctrica (TS).
- Ubica en un mapa los eventos naturales activos cerca de Ecuador (incendios, volcanes, etc.).
- Grafica viento y humedad de Latacunga durante octubre de 2026.
- Permite subir una foto del cielo y clasificarla con el modelo de IA de Steve (Azure Custom Vision); si el METAR reporta tormenta y la foto se clasifica como "Cielo Lluvioso", lo marca como coincidencia entre ambas fuentes.

Si una fuente de datos falla, solo esa sección muestra el error — el resto del panel sigue funcionando.

## Arquitectura

```
app/
  page.tsx            — compone los componentes, sin lógica propia
  api/
    metar/route.ts     — NOAA Aviation Weather (con caché y fallback SELT→SEQM)
    clima/route.ts      — NASA POWER
    eventos/route.ts    — NASA EONET
    clasificar/route.ts — reenvía la imagen al modelo de Steve (Azure Custom Vision)
components/           — un componente por archivo, cada uno con una responsabilidad
lib/
  config.ts           — constantes (aeropuertos, coordenadas, credenciales de Azure)
  categoriaVuelo.ts    — cálculo de categoría de vuelo y detección de tormenta
  tipos.ts             — tipos compartidos
```

Las 3 APIs externas de NOAA/NASA se consumen únicamente desde `app/api/*` porque `aviationweather.gov` no permite CORS desde el navegador.

## APIs usadas

- [NOAA Aviation Weather Data API](https://aviationweather.gov/data/api/) — METAR de SELT (Latacunga) y SEQM (Quito, respaldo).
- [NASA POWER](https://power.larc.nasa.gov/docs/services/api/) — clima histórico diario de Latacunga.
- [NASA EONET](https://eonet.gsfc.nasa.gov/docs/v3) — eventos naturales activos.
- Azure Custom Vision (modelo "Red Neuronal Cielo" de Steve) — clasificación de fotos del cielo.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

Para producción:

```bash
npm run build
npm start
```

## Repositorio privado

Este repositorio es privado porque `lib/config.ts` contiene la clave de predicción de Azure. Si quedara en un repo público, GitHub podría detectarla y Microsoft podría desactivarla.
