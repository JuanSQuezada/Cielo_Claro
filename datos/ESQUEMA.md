# Esquema de datos — Cielo Claro

Basado en respuestas reales guardadas en esta carpeta (`metar.json`, `clima.json`, `eventos.json`), consultadas el 2026-11-05.

## 1. METAR — Aviation Weather Data API (NOAA)

`GET https://aviationweather.gov/api/data/metar?ids=SELT,SEQM&format=json`
Header requerido: `User-Agent` propio (ej. `CieloClaro/1.0`).

Responde un **array** de objetos (uno por estación con reporte reciente). Si no hay METAR reciente responde **204 sin cuerpo** (hay que manejarlo e intentar con la estación de respaldo).

| Campo | Tipo | Unidad | Notas |
| --- | --- | --- | --- |
| `icaoId` | string | — | Código ICAO (SELT, SEQM) |
| `rawOb` | string | — | Texto METAR crudo, siempre mostrar |
| `reportTime` | string ISO | — | Hora del reporte |
| `temp` | number | °C | Temperatura |
| `dewp` | number | °C | Punto de rocío |
| `wdir` | number \| "VRB" | grados | Dirección del viento; puede venir como string "VRB" en vez de número |
| `wspd` | number | nudos (KT) | Velocidad del viento |
| `visib` | string | millas | Viene como string, ej. `"6+"` o `"9999"`; no siempre es numérico puro |
| `altim` | number | hPa | Presión altimétrica |
| `cover` | string | — | Cobertura de nube dominante: FEW, SCT, BKN, OVC, CLR, SKC |
| `clouds` | array | — | Lista de capas `{cover, base}`; `base` en pies. Puede venir vacío `[]` |
| `fltCat` | string | — | Categoría de vuelo que ya calcula la API: VFR, MVFR, IFR, LIFR (usar como referencia, pero igual calcular con `categoriaVuelo.ts` según RETO.md) |
| `qcField` | number | — | Código interno de control de calidad, ignorar |

**Campos que pueden faltar o venir vacíos:** `clouds` (cielo despejado), `wdir` (puede ser "VRB"), el array completo si hay 204. El texto `rawOb` puede traer grupos `CB` o `TS` que hay que buscar con regex para la alerta de tormenta.

## 2. NASA POWER — clima diario

`GET https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,WS10M,RH2M&community=RE&latitude=-0.93&longitude=-78.62&start=20261001&end=20261031&format=JSON`

Responde un **GeoJSON Feature**. Los datos están en `properties.parameter.<VARIABLE>.<YYYYMMDD>`.

| Campo | Tipo | Unidad | Notas |
| --- | --- | --- | --- |
| `properties.parameter.T2M` | object { fecha: number } | °C | Temperatura a 2m |
| `properties.parameter.WS10M` | object { fecha: number } | m/s | Velocidad del viento a 10m |
| `properties.parameter.RH2M` | object { fecha: number } | % | Humedad relativa a 2m |
| clave de fecha | string `YYYYMMDD` | — | Una entrada por día del rango pedido |

**Valor faltante:** NASA POWER usa **-999** como marcador de dato faltante — el código debe filtrar/ignorar ese valor antes de graficar. Si algún parámetro está mal escrito, la API responde **HTTP 422**.

## 3. NASA EONET — eventos naturales abiertos

`GET https://eonet.gsfc.nasa.gov/api/v3/events?status=open&bbox=-81.1,1.7,-75.1,-5.1`

Responde un objeto con `events: []`.

| Campo | Tipo | Unidad | Notas |
| --- | --- | --- | --- |
| `id` | string | — | ID único del evento |
| `title` | string | — | Nombre del evento |
| `description` | string \| null | — | Frecuentemente `null` |
| `categories[].id` / `.title` | string | — | ej. `wildfires`, `volcanoes` |
| `closed` | string \| null | — | `null` mientras el evento sigue abierto |
| `geometry[].coordinates` | [lon, lat] (+ alt opcional) | grados | **Orden es [longitud, latitud]**, ojo al invertir para Leaflet que usa [lat, lon] |
| `geometry[].date` | string ISO | — | Fecha del punto geométrico; un evento puede tener varios puntos (ej. ruta de un incendio) |
| `sources[].url` | string | — | Link a la fuente original |

**Campos que pueden faltar:** `description` casi siempre `null`; un evento puede no tener coordenadas recientes si `geometry` está vacío.

## 4. Azure Custom Vision — clasificación (modelo de Steve)

`POST https://cieloclaroeducativo-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7/classify/iterations/Red%20Neuronal%20Cielo/url`

Para envío de archivo (lo que usa `FotoCielo`), se usa la variante `/image` en vez de `/url`, con:
- Header `Prediction-Key`
- Header `Content-Type: application/octet-stream`
- Body: bytes crudos de la imagen

Respuesta esperada (JSON):

```json
{
  "id": "...",
  "project": "...",
  "iteration": "...",
  "created": "...",
  "predictions": [
    { "probability": 0.987, "tagId": "...", "tagName": "cumulonimbus" },
    { "probability": 0.01, "tagId": "...", "tagName": "despejado" }
  ]
}
```

`predictions` no viene garantizado en orden descendente — hay que ordenar por `probability` en el servidor antes de devolver al cliente. La etiqueta de tormenta a comparar con el METAR es exactamente `cumulonimbus`.
