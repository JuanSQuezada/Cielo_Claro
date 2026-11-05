import { Metar } from "@/lib/tipos";

function formatearViento(wdir: number | "VRB", wspd: number) {
  const direccion = wdir === "VRB" ? "variable" : `${wdir}°`;
  return `${direccion} a ${wspd} kt`;
}

const DATOS: {
  etiqueta: string;
  icono: string;
  valor: (m: Metar) => string;
}[] = [
  { etiqueta: "Viento", icono: "⟐", valor: (m) => formatearViento(m.wdir, m.wspd) },
  { etiqueta: "Visibilidad", icono: "◎", valor: (m) => `${m.visib} mi` },
  {
    etiqueta: "Nubes",
    icono: "▦",
    valor: (m) => (m.clouds.length === 0 ? "Despejado" : m.clouds.map((n) => `${n.cover} ${n.base} ft`).join(", ")),
  },
  { etiqueta: "Temperatura", icono: "◈", valor: (m) => `${m.temp}°C / rocío ${m.dewp}°C` },
  { etiqueta: "Altímetro", icono: "▤", valor: (m) => `${m.altim} hPa` },
];

export default function TarjetaMetar({ metar }: { metar: Metar & { estacionUsada: string } }) {
  return (
    <div className="panel p-4 sm:p-5 space-y-4" style={{ "--panel-accent": "var(--cian)" } as React.CSSProperties}>
      <div className="flex items-baseline justify-between">
        <h2 className="font-bold uppercase tracking-wide text-sm">METAR actual</h2>
        <span className="text-xs border border-[var(--cian)] text-[var(--cian)] px-2 py-0.5">
          Estación {metar.estacionUsada}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {DATOS.map(({ etiqueta, icono, valor }) => (
          <div key={etiqueta} className="hud-tile p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-[var(--texto-tenue)] flex items-center gap-1">
              <span aria-hidden className="text-[var(--cian)]">
                {icono}
              </span>
              {etiqueta}
            </p>
            <p className="text-sm font-medium mt-0.5 font-mono tabular-nums">{valor(metar)}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--texto-tenue)] mb-1">Texto original</p>
        <code className="block text-xs bg-black/50 border border-[var(--borde)] p-2 break-words font-mono text-[var(--cian)]">
          {metar.rawOb}
        </code>
      </div>
    </div>
  );
}
