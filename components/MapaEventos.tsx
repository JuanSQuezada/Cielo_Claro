"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { COORDENADAS_LATACUNGA } from "@/lib/config";
import { EventoEonet } from "@/lib/tipos";

const COLOR_CATEGORIA: Record<string, string> = {
  wildfires: "#f97316",
  volcanoes: "#ef4444",
  severeStorms: "#3b82f6",
  floods: "#06b6d4",
};

function colorDeCategoria(id: string) {
  return COLOR_CATEGORIA[id] ?? "#a3a3a3";
}

export default function MapaEventos() {
  const [eventos, setEventos] = useState<EventoEonet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/eventos")
      .then(async (res) => {
        const datos = await res.json();
        if (!res.ok) throw new Error(datos.error ?? "Error al consultar EONET");
        setEventos(datos);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return <div className="panel p-4 text-sm text-[var(--texto-tenue)]">Cargando eventos…</div>;
  }

  if (error) {
    return <div className="panel p-4 text-sm text-red-300">No se pudo cargar el mapa: {error}</div>;
  }

  return (
    <div className="panel p-4 space-y-3">
      <h2 className="font-semibold">Eventos naturales activos</h2>
      <div className="h-80 rounded-xl overflow-hidden">
        <MapContainer
          center={[COORDENADAS_LATACUNGA.lat, COORDENADAS_LATACUNGA.lon]}
          zoom={6}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {eventos.map((evento) => {
            const punto = evento.geometry[evento.geometry.length - 1];
            if (!punto || punto.coordinates.length < 2) return null;
            const [lon, lat] = punto.coordinates;
            const categoria = evento.categories[0]?.id ?? "otro";
            return (
              <CircleMarker
                key={evento.id}
                center={[lat, lon]}
                radius={8}
                pathOptions={{ color: colorDeCategoria(categoria), fillOpacity: 0.7 }}
              >
                <Popup>{evento.title}</Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
      {eventos.length === 0 && (
        <p className="text-sm text-[var(--texto-tenue)]">Sin eventos abiertos en la zona.</p>
      )}
    </div>
  );
}
