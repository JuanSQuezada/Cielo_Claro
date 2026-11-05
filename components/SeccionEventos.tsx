"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Leyenda from "./Leyenda";
import ListaEventos from "./ListaEventos";
import { EventoEonet, Metar } from "@/lib/tipos";

const MapaEventos = dynamic(() => import("./MapaEventos"), {
  ssr: false,
  loading: () => <div className="h-[28rem] bg-white/5 animate-pulse border border-[var(--borde)]" />,
});

type MetarAeropuerto = Metar & { icaoId: string };

export default function SeccionEventos() {
  const [eventos, setEventos] = useState<EventoEonet[]>([]);
  const [aeropuertos, setAeropuertos] = useState<MetarAeropuerto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/eventos")
      .then(async (res) => {
        const datos = await res.json();
        if (!res.ok) throw new Error(datos.error ?? "Error al consultar EONET");
        setEventos(datos);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));

    fetch("/api/metar/aeropuertos")
      .then(async (res) => {
        const datos = await res.json();
        if (res.ok && Array.isArray(datos)) setAeropuertos(datos);
      })
      .catch(() => {});
  }, []);

  const categoriasPresentes = useMemo(
    () => Array.from(new Set(eventos.map((e) => e.categories[0]?.id).filter((id): id is string => Boolean(id)))),
    [eventos]
  );

  if (cargando) {
    return <div className="panel p-4 text-sm text-[var(--texto-tenue)]">Cargando eventos…</div>;
  }

  if (error) {
    return <div className="panel p-4 text-sm text-red-300">No se pudo cargar el mapa: {error}</div>;
  }

  return (
    <div className="panel p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-bold uppercase tracking-wide text-sm">Eventos naturales activos — radar operativo</h2>
        <span className="text-xs text-[var(--texto-tenue)]">
          {eventos.length} evento{eventos.length === 1 ? "" : "s"} dentro de la región · anillos a 50/150/300 km de SELT
        </span>
      </div>

      <Leyenda categoriasPresentes={categoriasPresentes} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <MapaEventos
          eventos={eventos}
          seleccionado={seleccionado}
          onSeleccionar={setSeleccionado}
          aeropuertos={aeropuertos}
        />
        <ListaEventos eventos={eventos} seleccionado={seleccionado} onSeleccionar={setSeleccionado} />
      </div>
    </div>
  );
}
