import { CategoriaVuelo } from "./tipos";

export type EventoCercano = {
  titulo: string;
  distanciaKm: number;
  rumbo: string;
};

export type BriefingInput = {
  estacion: string;
  categoria: CategoriaVuelo;
  tormenta: boolean;
  eventoCercano: EventoCercano | null;
  anomalias: number;
};

function recomendacion(categoria: CategoriaVuelo, tormenta: boolean): string {
  if (tormenta) return "NO RECOMENDADO — convección reportada, reevaluar antes de autorizar salida.";
  if (categoria === "LIFR") return "NO RECOMENDADO — mínimos muy por debajo de referencia visual.";
  if (categoria === "IFR") return "SOLO IFR — requiere autorización y equipo instrumental.";
  if (categoria === "MVFR") return "VFR CON PRECAUCIÓN — vigilar techo y visibilidad durante el vuelo.";
  return "APTO PARA OPERACIÓN VISUAL — sin restricciones reportadas.";
}

export function generarBriefing(input: BriefingInput): string[] {
  const { estacion, categoria, tormenta, eventoCercano, anomalias } = input;
  const lineas: string[] = [];

  lineas.push(`> ENLACE ESTABLECIDO — ESTACIÓN ${estacion}`);
  lineas.push(`> CATEGORÍA DE VUELO: ${categoria}`);
  lineas.push(
    tormenta
      ? "> ALERTA: convección activa (CB/TS) en el reporte METAR"
      : "> SIN TORMENTA ELÉCTRICA EN EL REPORTE ACTUAL"
  );
  lineas.push(
    eventoCercano
      ? `> EVENTO NATURAL MÁS CERCANO: ${eventoCercano.titulo.toUpperCase()} — ${eventoCercano.distanciaKm.toFixed(
          0
        )} KM AL ${eventoCercano.rumbo}`
      : "> SIN EVENTOS NATURALES ACTIVOS EN LA REGIÓN"
  );
  lineas.push(
    anomalias > 0
      ? `> ${anomalias} ANOMALÍA${anomalias === 1 ? "" : "S"} CLIMÁTICA${anomalias === 1 ? "" : "S"} EN LOS ÚLTIMOS 30 DÍAS`
      : "> SIN ANOMALÍAS CLIMÁTICAS SIGNIFICATIVAS EN LOS ÚLTIMOS 30 DÍAS"
  );
  lineas.push(`> RECOMENDACIÓN: ${recomendacion(categoria, tormenta)}`);

  return lineas;
}
