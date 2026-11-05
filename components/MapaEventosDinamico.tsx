"use client";

import dynamic from "next/dynamic";

const MapaEventos = dynamic(() => import("./MapaEventos"), {
  ssr: false,
  loading: () => (
    <div className="panel p-4 text-sm text-[var(--texto-tenue)]">Cargando mapa…</div>
  ),
});

export default function MapaEventosDinamico() {
  return <MapaEventos />;
}
