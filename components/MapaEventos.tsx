"use client";

import { MapContainer, TileLayer, Circle, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import { COORDENADAS_LATACUNGA, COORDENADAS_AEROPUERTOS } from "@/lib/config";
import { EventoEonet, Metar } from "@/lib/tipos";
import { categoriaDe } from "@/lib/eonetCategorias";
import { calcularCategoria, COLOR_CATEGORIA } from "@/lib/categoriaVuelo";

const ANILLOS_KM = [50, 150, 300];

function iconoEvento(categoriaId: string, seleccionado: boolean) {
  const { color, icono } = categoriaDe(categoriaId);
  const tamano = seleccionado ? 32 : 24;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${tamano}px;height:${tamano}px;
      background:${color}22;border:2px solid ${color};
      display:flex;align-items:center;justify-content:center;
      font-size:${tamano - 14}px;
      box-shadow:0 0 ${seleccionado ? "14px" : "4px"} ${color};
      transition:all .15s ease;
    ">${icono}</div>`,
    iconSize: [tamano, tamano],
    iconAnchor: [tamano / 2, tamano / 2],
  });
}

function iconoAeropuerto(id: string, color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
      <div class="parpadeo" style="width:20px;height:20px;border:2px solid ${color};box-shadow:0 0 10px ${color};"></div>
      <span style="font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.04em;color:${color};background:rgba(0,0,0,0.75);padding:1px 4px;border:1px solid ${color};">${id}</span>
    </div>`,
    iconSize: [60, 42],
    iconAnchor: [30, 10],
  });
}

type Props = {
  eventos: EventoEonet[];
  seleccionado: string | null;
  onSeleccionar: (id: string) => void;
  aeropuertos?: (Metar & { icaoId: string })[];
};

export default function MapaEventos({ eventos, seleccionado, onSeleccionar, aeropuertos = [] }: Props) {
  const centro: [number, number] = [COORDENADAS_LATACUNGA.lat, COORDENADAS_LATACUNGA.lon];

  return (
    <div className="h-[28rem] overflow-hidden radar-grid border border-[var(--borde)]">
      <MapContainer center={centro} zoom={6} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="mapa-oscuro"
        />

        {ANILLOS_KM.map((km) => (
          <Circle
            key={km}
            center={centro}
            radius={km * 1000}
            pathOptions={{ color: "#22e5ff", weight: 1, fillOpacity: 0, dashArray: "4 6", opacity: 0.4 }}
          />
        ))}
        <Circle center={centro} radius={4000} pathOptions={{ color: "#39ff6a", weight: 2, fillOpacity: 0.25 }} />

        {aeropuertos.map((metar) => {
          const coords = COORDENADAS_AEROPUERTOS[metar.icaoId];
          if (!coords) return null;
          const categoria = calcularCategoria(metar.visib, metar.clouds);
          const color = COLOR_CATEGORIA[categoria];
          return (
            <Marker
              key={metar.icaoId}
              position={[coords.lat, coords.lon]}
              icon={iconoAeropuerto(metar.icaoId, color)}
              zIndexOffset={1000}
            >
              <Tooltip direction="top" offset={[0, -20]}>
                {metar.icaoId} · {categoria} · VIENTO {metar.wdir === "VRB" ? "VRB" : `${metar.wdir}°`}/{metar.wspd}KT ·
                VIS {metar.visib}MI
              </Tooltip>
            </Marker>
          );
        })}

        {eventos.map((evento) => {
          const punto = evento.geometry[evento.geometry.length - 1];
          if (!punto || punto.coordinates.length < 2) return null;
          const [lon, lat] = punto.coordinates;
          const categoriaId = evento.categories[0]?.id ?? "otro";
          const estaSeleccionado = evento.id === seleccionado;
          return (
            <Marker
              key={evento.id}
              position={[lat, lon]}
              icon={iconoEvento(categoriaId, estaSeleccionado)}
              eventHandlers={{ click: () => onSeleccionar(evento.id) }}
            >
              <Tooltip direction="top" offset={[0, -14]}>
                {evento.title}
              </Tooltip>
              <Popup>{evento.title}</Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
