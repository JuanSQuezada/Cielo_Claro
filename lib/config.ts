export const AEROPUERTO_PRINCIPAL = "SELT";
export const AEROPUERTO_RESPALDO = "SEQM";

export const COORDENADAS_LATACUNGA = {
  lat: -0.93,
  lon: -78.62,
};

export const COORDENADAS_AEROPUERTOS: Record<string, { lat: number; lon: number }> = {
  SELT: { lat: -0.9077, lon: -78.6155 },
  SEQM: { lat: -0.1292, lon: -78.3575 },
};

export const USER_AGENT = "CieloClaro/1.0";

export const CACHE_METAR_SEGUNDOS = 600;

export const BBOX_ECUADOR = "-81.1,1.7,-75.1,-5.1";

export const RANGO_CLIMA = {
  inicio: "20261001",
  fin: "20261031",
};

// --- Azure Custom Vision (clasificación de la foto del cielo) -------------
//
// NOTA DIDÁCTICA — mala práctica a propósito:
// En un proyecto real, una clave como esta NUNCA debería escribirse directo
// en el código fuente (menos aún en un repositorio público). Lo correcto es
// guardarla en una variable de entorno: un archivo `.env.local` en tu
// computadora (que `.gitignore` ya excluye de git) y, en producción, el
// panel de "Environment Variables" del hosting (Vercel, en este caso).
// El código entonces la leería así: `process.env.AZURE_PREDICTION_KEY`.
//
// Aquí se deja "hardcodeada" (escrita directo abajo) a propósito, por una
// razón didáctica muy concreta: este proyecto se comparte con estudiantes
// que van a clonar el repo y correrlo en local sin configurar nada extra.
// Si la clave solo viviera en una variable de entorno, cada estudiante
// tendría que crear su propio `.env.local` antes de poder ver algo
// funcionando — y esa fricción no vale la pena para un ejercicio educativo.
//
// La clave y el endpoint de abajo son INVENTADOS (no son el recurso real de
// Azure usado en la demo en producción) — por eso el clasificador de fotos
// entra en "modo demo" cuando corres este proyecto en tu computadora: ver
// `app/api/clasificar/route.ts`. El resto del panel (METAR, mapa, clima) no
// depende de ninguna clave y siempre usa datos reales.
//
// `process.env.X ?? "valor-inventado"`: si existiera la variable de entorno
// `AZURE_PREDICTION_URL`/`AZURE_PREDICTION_KEY` (como en el deploy real de
// Vercel), se usa esa; si no (como en tu copia local), se usa el valor de
// ejemplo inventado de abajo. Así el mismo código sirve para la demo real
// en producción y para que cualquiera lo corra en modo demo sin configurar
// nada.
export const AZURE_PREDICTION_URL =
  process.env.AZURE_PREDICTION_URL ??
  "https://cieloclaroeducativo-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7/classify/iterations/Red%20Neuronal%20Cielo/image";

export const AZURE_PREDICTION_KEY =
  process.env.AZURE_PREDICTION_KEY ??
  "Vzk3as5ec2IXvzEOJuXjMwpvL9XS0RO7ZCG8wR1IAT2oCBU7dVpG9h56GktkgRIgWUTrVkpbEsvyDEMO9key";
