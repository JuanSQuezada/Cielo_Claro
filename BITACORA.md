# Bitácora — Cielo Claro

Registro de cada prompt ejecutado y resumen de lo que hizo la IA.

---

## Paso 1 — Explorar los datos

**Prompt:**
```
Lee RETO.md. Antes de escribir código: consulta con curl las 3 APIs que aparecen ahí
(METAR para SELT y SEQM, NASA POWER para Latacunga lat -0.93 lon -78.62 en octubre 2026,
y EONET con status=open). Guarda cada respuesta real en la carpeta datos/ y escribe
datos/ESQUEMA.md con los campos de cada una, sus tipos, unidades y qué campos pueden venir
vacíos o faltar.
```

**Resumen:** Se consultaron las 3 APIs reales con `curl`. METAR devolvió reportes vigentes de SELT (VFR, FEW100) y SEQM (LIFR, OVC004). NASA POWER devolvió T2M/WS10M/RH2M diarios de octubre 2026 sin valores -999 en esta muestra. EONET devolvió 3 eventos abiertos en Ecuador (1 incendio, 2 volcanes: Reventador y Sangay). Las respuestas crudas quedaron en `datos/metar.json`, `datos/clima.json`, `datos/eventos.json`, y el esquema de campos/tipos/unidades en `datos/ESQUEMA.md`.

---

## Paso 2 — Plan y reglas del proyecto

**Prompt (plan):**
```
Propón un plan para cumplir RETO.md en menos de una hora con una arquitectura por componentes
sencilla. Stack: Next.js con App Router, TypeScript y Tailwind; react-leaflet para el mapa
(cargado solo en el cliente) y Recharts para el gráfico. Estructura:
- app/page.tsx solo compone componentes.
- components/: Encabezado, TarjetaMetar, Semaforo, AlertaTormenta, MapaEventos, GraficoClima,
  FotoCielo, BarrasPrediccion. Un componente por archivo, cada uno con una sola responsabilidad.
- lib/: config.ts (constantes), categoriaVuelo.ts (lógica de categorías), tipos.ts.
- app/api/: metar, clima, eventos y clasificar. Las APIs externas se llaman solo desde ahí
  porque aviationweather.gov no permite CORS.
Sin base de datos, sin login, sin tests. Debe desplegarse en Vercel sin configuración extra
y verse bien en celular. Dame el plan en máximo 6 pasos.
```

**Prompt (aprobación):**
```
Aprobado. Crea CLAUDE.md con las reglas del proyecto (interfaz en español, un componente por
archivo, lógica en lib/, código simple, sin dependencias innecesarias) y BITACORA.md: después
de cada paso agrega el prompt que te di, literal, y un resumen de lo que hiciste.
Ejecuta el primer paso.
```

**Resumen:** Se creó `CLAUDE.md` con las reglas del proyecto y este `BITACORA.md`. Arquitectura confirmada: Next.js App Router + TypeScript + Tailwind, react-leaflet y Recharts como únicas librerías extra, sin base de datos/login/tests.

---

## Paso 3 — Base, METAR y semáforo

**Prompt:**
```
Crea el proyecto Next.js en esta carpeta (si create-next-app se queja de archivos existentes,
créalo en una carpeta temporal y mueve todo aquí). Crea lib/config.ts con: aeropuerto principal
SELT, respaldo SEQM, coordenadas de Latacunga (-0.93, -78.62) y User-Agent "CieloClaro/1.0".
Implementa app/api/metar/route.ts: consulta aviationweather.gov con ese User-Agent, guarda la
respuesta en caché 10 minutos y si recibe 204 (sin reporte) intenta con SEQM.
Implementa lib/categoriaVuelo.ts con la tabla de RETO.md (techo = capa BKN/OVC más baja,
manda la peor condición). Crea los componentes TarjetaMetar (viento, visibilidad, nubes,
temperatura y texto original), Semaforo (color según la categoría) y AlertaTormenta (alerta
roja si el METAR trae CB o TS). Compónlos en page.tsx, corre el proyecto y dame la URL local.
```

**Resumen:** `create-next-app` se quejó de archivos existentes (RETO.md, CLAUDE.md, BITACORA.md, datos/), así que se generó en una carpeta temporal y se movió el código fuente (sin `node_modules`, copiado aparte por rendimiento) a `cielo-claro/`. Se creó `lib/config.ts`, `lib/tipos.ts` y `lib/categoriaVuelo.ts` (cálculo VFR/MVFR/IFR/LIFR por techo BKN/OVC y visibilidad, manda la peor condición; detección de CB/TS por regex). Se crearon `TarjetaMetar`, `Semaforo`, `AlertaTormenta` y el componente cliente `SeccionMetar` que hace el fetch a `/api/metar` y maneja carga/error de forma aislada. Estilo oscuro de panel aeronáutico aplicado en `globals.css`.

---

## Paso 4 — Mapa y clima

**Prompt:**
```
Crea app/api/eventos/route.ts (EONET, eventos abiertos) y el componente MapaEventos: mapa
centrado en Latacunga con un ícono por categoría y el nombre del evento al hacer clic.
Crea app/api/clima/route.ts (NASA POWER, octubre 2026, Latacunga) y el componente GraficoClima
con viento y humedad por día; ignora los valores -999 y si la API responde 422 muestra el error.
Si una API falla, solo su componente muestra el error; el resto del panel sigue funcionando.
Estilo de panel aeronáutico oscuro, todo en español.
```

**Resumen:** `app/api/eventos/route.ts` consulta EONET filtrando por `bbox` de Ecuador. `MapaEventos` usa `react-leaflet` cargado solo en cliente (`next/dynamic` con `ssr:false` en `page.tsx`) y `CircleMarker` con color por categoría (evita el problema de íconos por defecto de Leaflet con bundlers). `app/api/clima/route.ts` consulta NASA POWER y filtra -999 a `null`, maneja 422 explícitamente. `GraficoClima` usa Recharts con `connectNulls` para no romper la línea en días sin dato. Cada componente hace su propio fetch y muestra su propio error sin afectar al resto.

---

## Paso 5 — Foto del cielo con el modelo de Steve

**Prompt:**
```
Agrega a lib/config.ts estas constantes:
AZURE_PREDICTION_URL = "[URL de predicción de Steve]"
AZURE_PREDICTION_KEY = "[Prediction-Key de Steve]"
Crea app/api/clasificar/route.ts: recibe la imagen como multipart en el campo "imagen"
(máximo 4 MB), la reenvía a AZURE_PREDICTION_URL con el header Prediction-Key y
Content-Type application/octet-stream, y devuelve las predicciones ordenadas
(etiqueta y probabilidad). Crea el componente FotoCielo (subir imagen y vista previa) y
BarrasPrediccion (una barra por clase con su porcentaje). Si el METAR trae CB y la etiqueta
principal es "cumulonimbus", muestra "Las dos fuentes coinciden".
```

**Resumen:** Se agregaron `AZURE_PREDICTION_URL` (variante `/image`, para archivo) y `AZURE_PREDICTION_KEY` a `lib/config.ts` con los valores reales del recurso de predicción `CieloClaroEducativo-Prediction` (eastus). Se creó `app/api/clasificar/route.ts` (límite 4 MB, reenvía bytes crudos, ordena predicciones por probabilidad descendente) y los componentes `FotoCielo` y `BarrasPrediccion`.

**Desviación respecto al prompt original:** se probó el endpoint real con `curl` enviando una foto de prueba y el modelo respondió `200 OK` con las etiquetas `Cielo Lluvioso`, `Cielo Soleado`, `Cielo Nublado`, `Cielo Ocaso` — **no existe una etiqueta `cumulonimbus`** en este modelo entrenado (a diferencia de lo que asumía RETO.md sección 8, punto 4). Se ajustó la comparación en `FotoCielo.tsx` para usar `"cielo lluvioso"` como la etiqueta más cercana a condición de tormenta/mal tiempo. Si el modelo de Steve se reentrena con una etiqueta de tormenta explícita, hay que actualizar esa comparación.

---

## Paso 6 — Revisión final

**Prompt:**
```
Revisa todo el proyecto: corre npm run build y corrige cualquier error, verifica que se vea
bien en pantalla de celular, que cada componente esté en su propio archivo y que BITACORA.md
tenga todos los prompts. Escribe un README.md breve: qué es, arquitectura, APIs usadas
y cómo correrlo.
```

**Resumen:** `npm run build` falló la primera vez porque Next.js 16 ya no permite `ssr: false` en `next/dynamic` dentro de un Server Component (`app/page.tsx`); se movió esa lógica a un wrapper cliente dedicado, `components/MapaEventosDinamico.tsx`. También se corrigió un warning de Turbopack sobre la raíz del workspace agregando `turbopack.root` en `next.config.ts`. Tras eso, `npm run build` y `npx tsc --noEmit` pasan sin errores. Se verificó en el navegador (servidor `next dev`): METAR, semáforo, mapa (Leaflet) y gráfico (Recharts) cargan datos reales; se probó `POST /api/clasificar` con una foto real vía `curl`, respondiendo `200 OK` con las 4 predicciones ordenadas. Layout responsivo confirmado (todo en una sola columna, se adapta a pantallas angostas). Se limpiaron los SVG de ejemplo que trae `create-next-app` por defecto (no se usaban). Se escribió este `README.md`.

---
