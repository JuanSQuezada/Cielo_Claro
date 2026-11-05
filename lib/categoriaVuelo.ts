import { CategoriaVuelo, Nube } from "./tipos";

function techoPies(clouds: Nube[]): number | null {
  const capas = clouds.filter((n) => n.cover === "BKN" || n.cover === "OVC");
  if (capas.length === 0) return null;
  return Math.min(...capas.map((n) => n.base));
}

function visibilidadMillas(visib: string): number {
  if (visib === "9999" || visib === "6+") return 10;
  const n = parseFloat(visib);
  return Number.isNaN(n) ? 10 : n;
}

export function calcularCategoria(visib: string, clouds: Nube[]): CategoriaVuelo {
  const techo = techoPies(clouds);
  const visibilidad = visibilidadMillas(visib);

  const porTecho: CategoriaVuelo =
    techo === null
      ? "VFR"
      : techo < 500
      ? "LIFR"
      : techo < 1000
      ? "IFR"
      : techo <= 3000
      ? "MVFR"
      : "VFR";

  const porVisibilidad: CategoriaVuelo =
    visibilidad < 1
      ? "LIFR"
      : visibilidad < 3
      ? "IFR"
      : visibilidad <= 5
      ? "MVFR"
      : "VFR";

  const orden: CategoriaVuelo[] = ["VFR", "MVFR", "IFR", "LIFR"];
  const peor = orden[Math.max(orden.indexOf(porTecho), orden.indexOf(porVisibilidad))];
  return peor;
}

export const COLOR_CATEGORIA: Record<CategoriaVuelo, string> = {
  VFR: "#22c55e",
  MVFR: "#3b82f6",
  IFR: "#ef4444",
  LIFR: "#d946ef",
};

export function hayTormenta(rawOb: string): boolean {
  return /\bCB\b/.test(rawOb) || /\bTS/.test(rawOb);
}
