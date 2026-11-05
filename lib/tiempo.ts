export function formatoZulu(fecha: Date): string {
  const hh = String(fecha.getUTCHours()).padStart(2, "0");
  const mm = String(fecha.getUTCMinutes()).padStart(2, "0");
  const ss = String(fecha.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}Z`;
}

export function fechaCorta(iso: string): string {
  const fecha = new Date(iso);
  return fecha.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function tiempoRelativo(iso: string): string {
  const ahora = Date.now();
  const entonces = new Date(iso).getTime();
  const diffMs = ahora - entonces;
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "hace instantes";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHoras = Math.round(diffMin / 60);
  if (diffHoras < 24) return `hace ${diffHoras} h`;
  const diffDias = Math.round(diffHoras / 24);
  if (diffDias < 30) return `hace ${diffDias} d`;
  const diffMeses = Math.round(diffDias / 30);
  if (diffMeses < 18) return `hace ${diffMeses} mes${diffMeses === 1 ? "" : "es"}`;
  const diffAnios = Math.round(diffMeses / 12);
  return `hace ${diffAnios} año${diffAnios === 1 ? "" : "s"}`;
}
