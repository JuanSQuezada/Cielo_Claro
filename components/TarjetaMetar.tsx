import { Metar } from "@/lib/tipos";

function formatearViento(wdir: number | "VRB", wspd: number) {
  const direccion = wdir === "VRB" ? "variable" : `${wdir}°`;
  return `${direccion} a ${wspd} kt`;
}

export default function TarjetaMetar({ metar }: { metar: Metar & { estacionUsada: string } }) {
  return (
    <div className="panel p-4 sm:p-5 space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">METAR actual</h2>
        <span className="text-xs text-[var(--texto-tenue)]">
          Estación {metar.estacionUsada}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-[var(--texto-tenue)]">Viento</dt>
          <dd>{formatearViento(metar.wdir, metar.wspd)}</dd>
        </div>
        <div>
          <dt className="text-[var(--texto-tenue)]">Visibilidad</dt>
          <dd>{metar.visib} millas</dd>
        </div>
        <div>
          <dt className="text-[var(--texto-tenue)]">Nubes</dt>
          <dd>
            {metar.clouds.length === 0
              ? "Despejado"
              : metar.clouds.map((n) => `${n.cover} ${n.base} ft`).join(", ")}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--texto-tenue)]">Temperatura</dt>
          <dd>
            {metar.temp}°C / rocío {metar.dewp}°C
          </dd>
        </div>
      </dl>

      <div>
        <dt className="text-xs text-[var(--texto-tenue)] mb-1">Texto original</dt>
        <code className="block text-xs bg-black/30 rounded-lg p-2 break-words">
          {metar.rawOb}
        </code>
      </div>
    </div>
  );
}
