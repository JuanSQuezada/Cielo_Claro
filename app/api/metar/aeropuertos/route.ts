import { NextResponse } from "next/server";
import {
  AEROPUERTO_PRINCIPAL,
  AEROPUERTO_RESPALDO,
  CACHE_METAR_SEGUNDOS,
  USER_AGENT,
} from "@/lib/config";

export async function GET() {
  try {
    const ids = `${AEROPUERTO_PRINCIPAL},${AEROPUERTO_RESPALDO}`;
    const url = `https://aviationweather.gov/api/data/metar?ids=${ids}&format=json`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: CACHE_METAR_SEGUNDOS },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Aviation Weather respondió ${res.status}` }, { status: res.status });
    }

    const datos = await res.json();
    return NextResponse.json(Array.isArray(datos) ? datos : []);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
