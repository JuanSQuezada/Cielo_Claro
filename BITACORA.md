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

## Paso 7 — Rediseño UI/UX estilo "panel de operaciones ATC"

**Prompt:**
```
ya lo revisé me parece muy buen producto para tan poco tiempo, especifícame que tiempo te tardaste
en cada tarea en una tabla comparativa, y cuál fue la tarea que más te demoró, ya tengo en enlace
del proyecto de github pero antes de eso lo que necesito es que me mejores la interfaz de usuario,
que se vea algo bien diseñado que esté al nivel de la institución, elementos de UX/UI mejores, que
se vea más interactivo y que tenga más datos de información en el panel en la parte de eventos
naturales no sé que tienes puesto por que la verdad solo veo lo de la captura de la imagen que te
compartí y no me da nada de información que me sirva, recuerda que quienes van a ver esto son
Aerocontroladores por tanto básate en algun producto de calidad osea algo que se vean radares,
mejores mapas más info y diagramas etc
```

**Resumen:** Se rediseñó el panel con un enfoque "operaciones aeronáuticas / radar ATC", priorizando la sección de eventos naturales que el usuario señaló como poco informativa (antes solo mostraba puntos de color sin datos). Cambios:
- `lib/eonetCategorias.ts`: catálogo de 14 categorías EONET con etiqueta en español, color e ícono.
- `lib/geo.ts`: distancia (haversine) y rumbo (punto cardinal de 16 direcciones) desde SELT hacia cada evento.
- `lib/tiempo.ts`: reloj Zulu (UTC) en vivo, fecha corta en español y tiempo relativo ("hace X min/h/d/meses/años").
- `lib/estadisticas.ts`: promedio/mínimo/máximo para las tarjetas de resumen del gráfico de clima.
- `lib/tipos.ts`: `EventoEonet` extendido con `description`, `closed`, `sources` y `magnitudeValue`/`magnitudeUnit` (el endpoint ya los traía, solo faltaba tiparlos).
- Sección de eventos reconstruida en 4 piezas: `components/Leyenda.tsx` (chips por categoría presente), `components/ListaEventos.tsx` (tarjetas con distancia/rumbo a SELT, tiempo relativo, enlace a la fuente original, ordenadas por cercanía), `components/MapaEventos.tsx` (reescrito: anillos de rango a 50/150/300 km alrededor de SELT, marcadores `divIcon` coloreados/con ícono por categoría que brillan al seleccionarse, mapa y lista sincronizados por estado) y `components/SeccionEventos.tsx` (orquestador cliente que hace el fetch una sola vez y coordina selección mapa↔lista).
- `components/Encabezado.tsx`: ahora es un componente cliente con reloj Zulu en vivo (actualiza cada segundo), indicador de estado pulsante y badge "ATC OPS".
- `components/TarjetaMetar.tsx`: de lista `<dl>` a grilla de tarjetas de datos con ícono por campo (viento, visibilidad, nubes, temperatura, altímetro).
- `components/GraficoClima.tsx`: de `LineChart` a `AreaChart` con relleno degradado, más 4 tarjetas de estadísticas (viento prom./máx., humedad prom./mín.) calculadas con `lib/estadisticas.ts`.
- `components/FotoCielo.tsx`: zona de carga con drag-and-drop real (antes solo `<input type="file">`); `components/BarrasPrediccion.tsx`: barras coloreadas por ranking con medalla 🏆 en la predicción principal.
- `app/globals.css`: variable `--acento`, fondo de grilla tipo radar (`.radar-grid`), animación de pulso (`.pulso`) y un filtro CSS de inversión de color para oscurecer el mapa base.

**Desviación respecto al plan original:** se probó primero con tiles oscuros de CARTO (`basemaps.cartocdn.com/dark_all`), pero al verificar en el navegador el mapa mostraba un watermark "REQUIRES api key" en vez de renderizar — CARTO empezó a exigir API key en su capa gratuita. Se cambió a tiles estándar de OpenStreetMap (sin key) con un filtro CSS (`invert + hue-rotate + brightness/contrast/saturate`) para lograr el mismo look oscuro sin depender de una clave externa. También se ajustó `lib/tiempo.ts` para mostrar "hace X años" en vez de "hace 93 meses" en eventos antiguos (los volcanes Sangay/Reventador en los datos reales de EONET tienen fechas de 2019), tras verlo en pantalla.

**Verificación:** `npx tsc --noEmit` y `npm run build` pasan sin errores. Se probó en el navegador contra datos reales (METAR, EONET, NASA POWER); el mapa, la lista de eventos, el reloj Zulu y el gráfico cargan y se actualizan correctamente. No se hizo commit/push todavía: pendiente de la URL del repositorio de GitHub.

---

## Paso 8 — Tactical HUD: paleta negra, mapa táctico, osciloscopio y briefing automático

**Prompt:**
```
(Continuación del rediseño "panel de operaciones ATC": llevar la estética a un HUD táctico
de verdad — paleta negra, tipografía monoespaciada, esquinas cuadradas, mapa con estaciones
parpadeantes y tooltips neón, gráfico de clima estilo osciloscopio con detección de anomalías,
un componente de "análisis táctico" con un briefing automático, y la foto del cielo con efecto
de escaneo y telemetría del modelo. Esta sesión se cortó por límite de ventana de contexto a
mitad del trabajo; se retomó en una sesión nueva leyendo BITACORA.md y el estado real de los
archivos para continuar desde donde quedó.)
```

**Resumen:** Al recuperar la sesión se verificó con `git status`, `tsc` y `npm run build` que la primera mitad de este paso ya estaba aplicada en el código (no se había alcanzado a documentar en esta bitácora antes del corte): paleta negra/mono (`--background:#000`, `--font-geist-mono` como fuente global), `* { border-radius: 0 !important }` para esquinas cuadradas, clase `.panel` con recorte diagonal y esquinas técnicas, `app/api/metar/aeropuertos/route.ts` (METAR de SELT y SEQM en una sola llamada), estaciones parpadeantes en `MapaEventos.tsx` (clase `.parpadeo`) con tooltip neón (`.leaflet-tooltip` con borde y glow cian), tiles oscuros vía filtro CSS (`.mapa-oscuro`) y el catálogo de 14 categorías EONET en `lib/eonetCategorias.ts`.

A partir de ahí se completó lo que faltaba:
- `lib/anomalia.ts`: detección de anomalías por z-score (umbral 1.5 desviaciones estándar) sobre las series de viento y humedad de NASA POWER.
- `components/GraficoClima.tsx`: de `AreaChart` con degradado a `LineChart` tipo osciloscopio (grid táctico, trazos netos sin animación, colores `--acento`/`--cian`), con marcadores pulsantes rojos sobre los puntos que la función de anomalías detecta, chip de conteo de anomalías y lista de detalle (día, campo, valor, σ).
- `lib/briefing.ts` + `components/AnalisisTactico.tsx`: un componente nuevo que hace sus propios fetch a `/api/metar`, `/api/eventos` y `/api/clima` (seguro ante fallos parciales, igual que el resto del panel), calcula categoría de vuelo, alerta de tormenta, evento EONET más cercano (distancia/rumbo con `lib/geo.ts`) y anomalías climáticas, y compone un "briefing táctico" de texto en pantalla estilo terminal (revelado línea por línea con cursor parpadeante). Se etiquetó explícitamente como "generado por reglas locales, no es un LLM real" para no sugerir que hay una llamada a un modelo de lenguaje donde no la hay.
- `components/FotoCielo.tsx`: la vista previa de la imagen aplica la clase `.escaneo-ia` (barrido cian) mientras se clasifica, y al terminar se muestra un bloque de telemetría con datos medidos de verdad (tiempo de inferencia con `performance.now()`, dimensiones reales de la imagen, peso en KB, número de clases devueltas) — nada inventado, solo instrumentado.
- `app/page.tsx`: se insertó `<AnalisisTactico />` entre la sección de eventos y el gráfico de clima.
- `README.md`: se agregó la sección "Madurez tecnológica de IA en Ecuador", una reflexión sin estadísticas inventadas sobre cómo este proyecto (un modelo de Azure Custom Vision entrenado por un desarrollador local) refleja la forma más realista en que la IA está entrando hoy a instituciones ecuatorianas.

**Verificación:** `npm run lint`, `npx tsc --noEmit` y `npm run build` pasan sin errores ni warnings. El tooling de previsualización de esta sesión no tiene acceso a la carpeta `cielo-claro/` (vive fuera de la raíz de proyecto configurada), así que se verificó levantando `next dev` manualmente y consultando por HTTP: el HTML inicial renderiza los tres estados de carga (`Cargando METAR`, `Cargando eventos`, `Cargando clima`, `Generando análisis táctico`) sin errores de servidor, y las 4 rutas de API (`/api/metar`, `/api/metar/aeropuertos`, `/api/eventos`, `/api/clima`) responden con datos reales. Sigue pendiente el commit/push: se necesita la URL del repositorio de GitHub que el usuario mencionó tener lista.

---

## Paso 9 — Commit, push y verificación del deploy en Vercel

**Prompt:**
```
ya tengo el enlace de mi github, así que crealo subelo a la nube y avísame cuando esté listo
```
```
revisa como tal las actualizaciones del proyecto por que ya está desplegado en vercel
entones solo para que estés al día
```
```
claro, haber en sí en el repo de github ya está puesto eso: https://github.com/JuanSQuezada/Cielo_Claro
y tiene un readmi unclusive
https://cielo-claro.vercel.app/
```

**Resumen:** Se confirmó con el usuario que el repositorio de GitHub ya está creado y es **privado** (relevante porque `lib/config.ts` trae la clave de predicción de Azure en texto plano). Se agregó el remoto `origin` → `https://github.com/JuanSQuezada/Cielo_Claro.git`, se hizo commit de todo el trabajo del Paso 8 (27 archivos) y `git push -u origin main` contra un repo remoto vacío (sin conflictos).

El usuario reportó que el proyecto ya estaba desplegado en Vercel (`https://cielo-claro.vercel.app/`, deploy automático vía integración GitHub↔Vercel, sin `.vercel/` ni `vercel.json` locales porque no hizo falta configuración extra). Se hizo un smoke test real contra producción:
- `GET /` → 200 OK, HTML inicial renderiza los estados de carga de los 5 componentes cliente sin errores de servidor.
- `GET /api/metar`, `/api/metar/aeropuertos`, `/api/eventos`, `/api/clima` → 200 OK con datos reales de NOAA/NASA.
- `POST /api/clasificar` con una foto de prueba real → 200 OK, el modelo de Steve respondió con las 4 predicciones ordenadas — confirma que la clave de Azure sigue activa y que no hacía falta ninguna variable de entorno en Vercel (al estar hardcodeada en `lib/config.ts`).

Se agregó el enlace de la demo en vivo al encabezado de `README.md`, cumpliendo el entregable de RETO.md ("Un link público y un repositorio en GitHub").

---
