import { NextResponse } from "next/server";
import { COORDENADAS_LATACUNGA, RANGO_CLIMA } from "@/lib/config";
import { ClimaDiario } from "@/lib/tipos";

export async function GET() {
  try {
    const { lat, lon } = COORDENADAS_LATACUNGA;
    const { inicio, fin } = RANGO_CLIMA;
    const url =
      `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,WS10M,RH2M` +
      `&community=RE&latitude=${lat}&longitude=${lon}&start=${inicio}&end=${fin}&format=JSON`;

    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (res.status === 422) {
      return NextResponse.json(
        { error: "NASA POWER rechazó los parámetros de la consulta (422)" },
        { status: 422 }
      );
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: `NASA POWER respondió ${res.status}` },
        { status: res.status }
      );
    }

    const datos = await res.json();
    const parametros = datos?.properties?.parameter;
    if (!parametros) {
      return NextResponse.json({ error: "Respuesta sin datos de clima" }, { status: 502 });
    }

    const fechas = Object.keys(parametros.T2M ?? {});
    const serie: ClimaDiario[] = fechas.map((fecha) => {
      const viento = parametros.WS10M?.[fecha];
      const humedad = parametros.RH2M?.[fecha];
      return {
        fecha,
        viento: viento === -999 ? null : viento,
        humedad: humedad === -999 ? null : humedad,
      };
    });

    return NextResponse.json(serie);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
