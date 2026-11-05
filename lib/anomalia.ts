import { ClimaDiario } from "./tipos";

export type AnomaliaDia = {
  fecha: string;
  campo: "viento" | "humedad";
  valor: number;
  desviacion: number;
};

const UMBRAL_Z = 1.5;

function mediaYDesvio(valores: number[]) {
  const media = valores.reduce((acc, v) => acc + v, 0) / valores.length;
  const varianza = valores.reduce((acc, v) => acc + (v - media) ** 2, 0) / valores.length;
  return { media, desvio: Math.sqrt(varianza) };
}

function detectarCampo(serie: ClimaDiario[], campo: "viento" | "humedad"): AnomaliaDia[] {
  const puntos = serie
    .map((d) => ({ fecha: d.fecha, valor: d[campo] }))
    .filter((p): p is { fecha: string; valor: number } => p.valor != null);

  if (puntos.length < 3) return [];

  const { media, desvio } = mediaYDesvio(puntos.map((p) => p.valor));
  if (desvio === 0) return [];

  return puntos
    .map((p) => ({ ...p, z: (p.valor - media) / desvio }))
    .filter((p) => Math.abs(p.z) >= UMBRAL_Z)
    .map((p) => ({ fecha: p.fecha, campo, valor: p.valor, desviacion: p.z }));
}

export function detectarAnomalias(serie: ClimaDiario[]): AnomaliaDia[] {
  return [...detectarCampo(serie, "viento"), ...detectarCampo(serie, "humedad")].sort(
    (a, b) => Math.abs(b.desviacion) - Math.abs(a.desviacion)
  );
}
