# Cielo Claro

Panel web para evaluar si las condiciones son seguras para volar sobre Latacunga (aeropuerto SELT), construido para el reto de práctica estilo Space Apps descrito en [RETO.md](./RETO.md).

**Demo en vivo:** [cielo-claro.vercel.app](https://cielo-claro.vercel.app/)

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

## Madurez tecnológica de IA en Ecuador

Este proyecto es, en pequeño, un retrato del momento actual de la IA aplicada en Ecuador: el modelo de clasificación de cielos no salió de un laboratorio de big tech, sino de Azure Custom Vision entrenado por un desarrollador local (Steve) en un flujo de etiquetar fotos y lanzar un entrenamiento administrado, sin escribir una sola línea de arquitectura de red neuronal. Esa es, hoy, la vía más realista por la que la IA entra a instituciones ecuatorianas: no investigación fundacional, sino adopción pragmática de servicios ya entrenables (visión por computador, modelos de lenguaje vía API) integrados a procesos existentes.

El ecosistema todavía es incipiente comparado con la región (Brasil, Chile o Colombia concentran más inversión y más programas públicos de IA), pero hay señales concretas de avance: universidades como la Escuela Politécnica Nacional, la USFQ o Yachay Tech ofrecen investigación y formación en IA/ciencia de datos, y cada vez hay más equipos técnicos locales — como el que entrenó el modelo usado aquí — capaces de llevar un modelo de visión o de lenguaje de cero a producción en días, no meses. Lo que todavía falta es infraestructura pública de datos abiertos (este mismo panel depende enteramente de APIs de NOAA y NASA, no de datos locales equivalentes) y más casos de uso en sectores críticos como aviación, agricultura o gestión de riesgos, donde la disponibilidad de estaciones meteorológicas y sensores locales sigue siendo escasa.

En ese sentido, "Cielo Claro" funciona también como prueba de concepto: con herramientas de IA accesibles (Azure Custom Vision, un asistente de código) y datos públicos internacionales, es posible construir en menos de una hora una herramienta de apoyo a decisiones operativas reales para un aeropuerto ecuatoriano.

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
