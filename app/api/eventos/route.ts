import { NextResponse } from "next/server";
import { BBOX_ECUADOR } from "@/lib/config";

export async function GET() {
  try {
    const url = `https://eonet.gsfc.nasa.gov/api/v3/events?status=open&bbox=${BBOX_ECUADOR}`;
    const res = await fetch(url, { next: { revalidate: 600 } });

    if (!res.ok) {
      return NextResponse.json(
        { error: `EONET respondió ${res.status}` },
        { status: res.status }
      );
    }

    const datos = await res.json();
    return NextResponse.json(datos.events ?? []);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
