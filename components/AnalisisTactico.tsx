"use client";

import { useEffect, useState } from "react";
import { calcularCategoria, hayTormenta } from "@/lib/categoriaVuelo";
import { distanciaKm, rumboDesde } from "@/lib/geo";
import { detectarAnomalias } from "@/lib/anomalia";
import { generarBriefing, EventoCercano } from "@/lib/briefing";
import { COORDENADAS_LATACUNGA } from "@/lib/config";
import { ClimaDiario, EventoEonet, Metar } from "@/lib/tipos";

export default function AnalisisTactico() {
  const [lineas, setLineas] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [visibles, setVisibles] = useState(0);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const [resMetar, resEventos, resClima] = await Promise.all([
          fetch("/api/metar"),
          fetch("/api/eventos").catch(() => null),
          fetch("/api/clima").catch(() => null),
        ]);

        if (resMetar.status === 204 || !resMetar.ok) {
          throw new Error("Sin reporte METAR disponible para generar el briefing");
        }
        const metar: Metar & { estacionUsada: string } = await resMetar.json();

        const eventos: EventoEonet[] =
          resEventos && resEventos.ok ? await resEventos.json().catch(() => []) : [];
        const clima: ClimaDiario[] = resClima && resClima.ok ? await resClima.json().catch(() => []) : [];

        const categoria = calcularCategoria(metar.visib, metar.clouds);
        const tormenta = hayTormenta(metar.rawOb);

        const eventoCercano: EventoCercano | null = eventos
          .map((evento) => {
            const punto = evento.geometry[evento.geometry.length - 1];
            if (!punto || punto.coordinates.length < 2) return null;
            const [lon, lat] = punto.coordinates;
            return {
              titulo: evento.title,
              distanciaKm: distanciaKm(COORDENADAS_LATACUNGA.lat, COORDENADAS_LATACUNGA.lon, lat, lon),
              rumbo: rumboDesde(COORDENADAS_LATACUNGA.lat, COORDENADAS_LATACUNGA.lon, lat, lon),
            };
          })
          .filter((e): e is EventoCercano => e !== null)
          .sort((a, b) => a.distanciaKm - b.distanciaKm)[0] ?? null;

        const anomalias = detectarAnomalias(clima).length;

        const briefing = generarBriefing({
          estacion: metar.estacionUsada,
          categoria,
          tormenta,
          eventoCercano,
          anomalias,
        });

        if (!cancelado) setLineas(briefing);
      } catch (err) {
        if (!cancelado) setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!lineas) return;
    if (visibles >= lineas.length) return;
    const id = setTimeout(() => setVisibles((v) => v + 1), 350);
    return () => clearTimeout(id);
  }, [lineas, visibles]);

  if (cargando) {
    return <div className="panel p-4 text-sm text-[var(--texto-tenue)]">Generando análisis táctico…</div>;
  }

  if (error || !lineas) {
    return (
      <div className="panel p-4 text-sm text-red-300">
        No se pudo generar el briefing táctico: {error}
      </div>
    );
  }

  const completo = visibles >= lineas.length;

  return (
    <div className="panel p-4 space-y-2" style={{ "--panel-accent": "var(--acento)" } as React.CSSProperties}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-bold uppercase tracking-wide text-sm">Análisis táctico — briefing automático</h2>
        <span className="hud-chip text-[10px] px-1.5 py-0.5 text-[var(--texto-tenue)] border-[var(--borde)]">
          generado por reglas locales, no es un LLM real
        </span>
      </div>

      <div className="bg-black/60 border border-[var(--borde)] p-3 font-mono text-xs sm:text-sm leading-relaxed text-[var(--acento)] min-h-[9rem]">
        {lineas.slice(0, visibles).map((linea, i) => (
          <p key={i}>{linea}</p>
        ))}
        {!completo && <span className="cursor-blink">█</span>}
      </div>
    </div>
  );
}
