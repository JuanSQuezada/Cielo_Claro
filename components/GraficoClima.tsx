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

function formatearDia(fecha: string) {
  return fecha.slice(6, 8);
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
    viento: d.viento,
    humedad: d.humedad,
  }));

  return (
    <div className="panel p-4 space-y-3">
      <h2 className="font-semibold">Viento y humedad — octubre 2026</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2b42" />
            <XAxis dataKey="dia" stroke="#8a97ad" fontSize={12} />
            <YAxis stroke="#8a97ad" fontSize={12} />
            <Tooltip
              contentStyle={{ background: "#121a2b", border: "1px solid #1f2b42" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="viento"
              name="Viento (m/s)"
              stroke="#3b82f6"
              connectNulls
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="humedad"
              name="Humedad (%)"
              stroke="#22c55e"
              connectNulls
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
