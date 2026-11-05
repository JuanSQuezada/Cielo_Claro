import { NextResponse } from "next/server";
import { AZURE_PREDICTION_KEY, AZURE_PREDICTION_URL } from "@/lib/config";
import { Prediccion } from "@/lib/tipos";

const TAMANO_MAXIMO = 4 * 1024 * 1024;

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

    const res = await fetch(AZURE_PREDICTION_URL, {
      method: "POST",
      headers: {
        "Prediction-Key": AZURE_PREDICTION_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: bytes,
    });

    if (!res.ok) {
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

    return NextResponse.json({ predicciones });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
