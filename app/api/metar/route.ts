import { NextResponse } from "next/server";
import {
  AEROPUERTO_PRINCIPAL,
  AEROPUERTO_RESPALDO,
  CACHE_METAR_SEGUNDOS,
  USER_AGENT,
} from "@/lib/config";

async function obtenerMetar(icaoId: string) {
  const url = `https://aviationweather.gov/api/data/metar?ids=${icaoId}&format=json`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: CACHE_METAR_SEGUNDOS },
  });

  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`Aviation Weather respondió ${res.status}`);

  const datos = await res.json();
  if (!Array.isArray(datos) || datos.length === 0) return null;
  return datos[0];
}

export async function GET() {
  try {
    let metar = await obtenerMetar(AEROPUERTO_PRINCIPAL);
    let estacion = AEROPUERTO_PRINCIPAL;

    if (!metar) {
      metar = await obtenerMetar(AEROPUERTO_RESPALDO);
      estacion = AEROPUERTO_RESPALDO;
    }

    if (!metar) {
      return NextResponse.json(
        { error: "Sin reporte METAR reciente para SELT ni SEQM" },
        { status: 204 }
      );
    }

    return NextResponse.json({ ...metar, estacionUsada: estacion });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
