import { NextResponse } from "next/server";
import { AZURE_PREDICTION_KEY, AZURE_PREDICTION_URL } from "@/lib/config";
import { Prediccion } from "@/lib/tipos";

const TAMANO_MAXIMO = 4 * 1024 * 1024;

// Etiquetas reales del modelo "Red Neuronal Cielo" de Steve (ver BITACORA.md,
// Paso 5). Se usan aquí solo para que el modo demo devuelva algo parecido a
// lo que respondería el modelo real, nunca para inventar un modelo nuevo.
const ETIQUETAS_DEMO = ["Cielo Lluvioso", "Cielo Nublado", "Cielo Soleado", "Cielo Ocaso"];

// Modo demo: cuando `lib/config.ts` está usando la clave de ejemplo
// inventada (porque no hay una variable de entorno AZURE_PREDICTION_KEY real
// configurada, como en el deploy de producción), Azure responde 401/403.
// En vez de mostrar un error técnico confuso a quien está aprendiendo con
// este repo, se devuelven predicciones de ejemplo, claramente marcadas como
// simuladas, para que el resto de la interfaz (barras, telemetría) se pueda
// ver funcionando igual.
function prediccionesDemo(): Prediccion[] {
  const pesos = [0.62, 0.21, 0.11, 0.06];
  return ETIQUETAS_DEMO.map((tagName, i) => ({ tagName, probability: pesos[i] })).sort(
    (a, b) => b.probability - a.probability
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imagen = formData.get("imagen");

    if (!(imagen instanceof Blob)) {
      return NextResponse.json({ error: "Falta el campo 'imagen'" }, { status: 400 });
    }
    if (imagen.size > TAMANO_MAXIMO) {
      return NextResponse.json(
        { error: "La imagen supera el máximo de 4 MB" },
        { status: 413 }
      );
    }

    const bytes = await imagen.arrayBuffer();

    // El endpoint/clave reales de Azure viven en una variable de entorno
    // (solo configurada en el deploy de producción de Vercel). Si no existe
    // esa variable, `lib/config.ts` cae en un endpoint y una clave de
    // ejemplo inventados que no apuntan a ningún recurso real: la llamada
    // de abajo puede fallar por DNS (dominio inventado, ni siquiera existe)
    // o por un 401/403 (clave inventada rechazada) — ambos casos se tratan
    // igual: se entra en modo demo, nunca se deja ver un error técnico.
    let res: Response;
    try {
      res = await fetch(AZURE_PREDICTION_URL, {
        method: "POST",
        headers: {
          "Prediction-Key": AZURE_PREDICTION_KEY,
          "Content-Type": "application/octet-stream",
        },
        body: bytes,
      });
    } catch {
      return NextResponse.json({
        predicciones: prediccionesDemo(),
        demo: true,
        mensaje:
          "Modo demo: este endpoint de Azure es de ejemplo (inventado) y no existe de verdad, así que estas predicciones son simuladas, no vienen de un modelo real. Para ver clasificaciones reales, usa tu propio recurso de Azure Custom Vision en lib/config.ts (ver GUIA_INICIO.md).",
      });
    }

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return NextResponse.json({
          predicciones: prediccionesDemo(),
          demo: true,
          mensaje:
            "Modo demo: esta clave de Azure es de ejemplo (inventada), así que estas predicciones son simuladas, no vienen de un modelo real. Para ver clasificaciones reales, usa tu propia clave de Azure Custom Vision en lib/config.ts (ver GUIA_INICIO.md).",
        });
      }
      const texto = await res.text();
      return NextResponse.json(
        { error: `El modelo respondió ${res.status}: ${texto}` },
        { status: res.status }
      );
    }

    const datos = await res.json();
    const predicciones: Prediccion[] = (datos.predictions ?? [])
      .map((p: { tagName: string; probability: number }) => ({
        tagName: p.tagName,
        probability: p.probability,
      }))
      .sort((a: Prediccion, b: Prediccion) => b.probability - a.probability);

    return NextResponse.json({ predicciones, demo: false });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
