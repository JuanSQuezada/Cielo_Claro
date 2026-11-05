"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { ClimaDiario } from "@/lib/tipos";
import { estadisticas } from "@/lib/estadisticas";
import { detectarAnomalias, AnomaliaDia } from "@/lib/anomalia";

function formatearDia(fecha: string) {
  return fecha.slice(6, 8);
}

type PuntoDot = { cx?: number; cy?: number; payload?: { dia: string } };

function puntoAnomalo(dia: string, campo: "viento" | "humedad", anomalias: AnomaliaDia[], fechaCompleta: (dia: string) => string | undefined) {
  const fecha = fechaCompleta(dia);
  return fecha ? anomalias.some((a) => a.campo === campo && a.fecha === fecha) : false;
}

function crearDot(campo: "viento" | "humedad", anomalias: AnomaliaDia[], fechaCompleta: (dia: string) => string | undefined) {
  return function PuntoLinea(props: PuntoDot) {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null || !payload) return <g key={`${cx}-${cy}`} />;
    const esAnomalia = puntoAnomalo(payload.dia, campo, anomalias, fechaCompleta);
    if (!esAnomalia) return <g key={`${cx}-${cy}`} />;
    return (
      <g key={`${cx}-${cy}`}>
        <circle cx={cx} cy={cy} r={5} fill="none" stroke="var(--rojo)" strokeWidth={2} className="pulso" />
        <circle cx={cx} cy={cy} r={2.5} fill="var(--rojo)" />
      </g>
    );
  };
}

export default function GraficoClima() {
  const [serie, setSerie] = useState<ClimaDiario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/clima")
      .then(async (res) => {
        const datos = await res.json();
        if (!res.ok) throw new Error(datos.error ?? "Error al consultar NASA POWER");
        setSerie(datos);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return <div className="panel p-4 text-sm text-[var(--texto-tenue)]">Cargando clima…</div>;
  }

  if (error) {
    return (
      <div className="panel p-4 text-sm text-red-300">
        No se pudo cargar el gráfico de clima: {error}
      </div>
    );
  }

  const datos = serie.map((d) => ({
    dia: formatearDia(d.fecha),
    fecha: d.fecha,
    viento: d.viento,
    humedad: d.humedad,
  }));

  const estViento = estadisticas(serie.map((d) => d.viento));
  const estHumedad = estadisticas(serie.map((d) => d.humedad));
  const anomalias = detectarAnomalias(serie);
  const fechaCompleta = (dia: string) => datos.find((d) => d.dia === dia)?.fecha;

  return (
    <div className="panel p-4 space-y-3" style={{ "--panel-accent": "var(--acento)" } as React.CSSProperties}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-bold uppercase tracking-wide text-sm">Osciloscopio climático — octubre 2026</h2>
        <span
          className="hud-chip text-[10px] px-1.5 py-0.5"
          style={{
            color: anomalias.length > 0 ? "var(--rojo)" : "var(--texto-tenue)",
            borderColor: anomalias.length > 0 ? "var(--rojo)" : "var(--borde)",
          }}
        >
          {anomalias.length} anomalía{anomalias.length === 1 ? "" : "s"} detectada{anomalias.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <StatCard etiqueta="Viento prom." valor={estViento.promedio} unidad="m/s" color="var(--acento)" />
        <StatCard etiqueta="Viento máx." valor={estViento.maximo} unidad="m/s" color="var(--acento)" />
        <StatCard etiqueta="Humedad prom." valor={estHumedad.promedio} unidad="%" color="var(--cian)" />
        <StatCard etiqueta="Humedad mín." valor={estHumedad.minimo} unidad="%" color="var(--cian)" />
      </div>

      <div className="h-72 radar-grid border border-[var(--borde)] bg-black/40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--borde)" />
            <XAxis dataKey="dia" stroke="var(--texto-tenue)" fontSize={11} fontFamily="var(--font-geist-mono)" />
            <YAxis stroke="var(--texto-tenue)" fontSize={11} fontFamily="var(--font-geist-mono)" />
            <Tooltip
              contentStyle={{
                background: "rgba(0,0,0,0.9)",
                border: "1px solid var(--cian)",
                fontFamily: "var(--font-geist-mono)",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-geist-mono)" }} />
            <Line
              type="linear"
              dataKey="viento"
              name="Viento (m/s)"
              stroke="var(--acento)"
              strokeWidth={1.5}
              dot={crearDot("viento", anomalias, fechaCompleta)}
              activeDot={{ r: 3 }}
              connectNulls
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="humedad"
              name="Humedad (%)"
              stroke="var(--cian)"
              strokeWidth={1.5}
              dot={crearDot("humedad", anomalias, fechaCompleta)}
              activeDot={{ r: 3 }}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {anomalias.length > 0 && (
        <ul className="flex flex-wrap gap-2 text-[11px] font-mono">
          {anomalias.slice(0, 6).map((a) => (
            <li
              key={`${a.campo}-${a.fecha}`}
              className="hud-tile px-2 py-1"
              style={{ borderColor: "var(--rojo)", color: "var(--rojo)" }}
            >
              DÍA {formatearDia(a.fecha)} · {a.campo.toUpperCase()} {a.valor.toFixed(1)} · σ {a.desviacion.toFixed(1)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatCard({
  etiqueta,
  valor,
  unidad,
  color,
}: {
  etiqueta: string;
  valor: number | null;
  unidad: string;
  color: string;
}) {
  return (
    <div className="hud-tile p-2">
      <p className="text-[10px] uppercase tracking-wide text-[var(--texto-tenue)]">{etiqueta}</p>
      <p className="text-sm font-semibold font-mono tabular-nums" style={{ color }}>
        {valor == null ? "—" : `${valor.toFixed(1)} ${unidad}`}
      </p>
    </div>
  );
}
