import { EventoEonet } from "@/lib/tipos";
import { categoriaDe } from "@/lib/eonetCategorias";
import { COORDENADAS_LATACUNGA } from "@/lib/config";
import { distanciaKm, rumboDesde } from "@/lib/geo";
import { tiempoRelativo, fechaCorta } from "@/lib/tiempo";

type Props = {
  eventos: EventoEonet[];
  seleccionado: string | null;
  onSeleccionar: (id: string) => void;
};

export default function ListaEventos({ eventos, seleccionado, onSeleccionar }: Props) {
  if (eventos.length === 0) {
    return <p className="text-sm text-[var(--texto-tenue)]">Sin eventos abiertos en la zona.</p>;
  }

  const conDistancia = eventos
    .map((evento) => {
      const punto = evento.geometry[evento.geometry.length - 1];
      const [lon, lat] = punto?.coordinates ?? [null, null];
      const distancia =
        lat != null && lon != null
          ? distanciaKm(COORDENADAS_LATACUNGA.lat, COORDENADAS_LATACUNGA.lon, lat, lon)
          : null;
      const rumbo =
        lat != null && lon != null
          ? rumboDesde(COORDENADAS_LATACUNGA.lat, COORDENADAS_LATACUNGA.lon, lat, lon)
          : null;
      return { evento, punto, distancia, rumbo };
    })
    .sort((a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity));

  return (
    <ul className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
      {conDistancia.map(({ evento, punto, distancia, rumbo }) => {
        const categoriaId = evento.categories[0]?.id ?? "otro";
        const { etiqueta, color, icono } = categoriaDe(categoriaId);
        const activo = evento.id === seleccionado;
        const fuente = evento.sources?.[0];

        return (
          <li key={evento.id}>
            <button
              type="button"
              onClick={() => onSeleccionar(evento.id)}
              className={`w-full text-left hud-tile p-3 transition-colors ${activo ? "" : "hover:bg-white/5"}`}
              style={activo ? { borderColor: "var(--cian)", boxShadow: "0 0 8px rgba(34,229,255,0.3)" } : undefined}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="shrink-0 w-6 h-6 flex items-center justify-center text-sm"
                    style={{ background: `${color}22`, border: `1px solid ${color}` }}
                  >
                    {icono}
                  </span>
                  <span className="font-medium text-sm truncate">{evento.title}</span>
                </div>
                <span
                  className="hud-chip shrink-0 text-[10px] px-1.5 py-0.5"
                  style={{ color, background: `${color}14` }}
                >
                  {etiqueta}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--texto-tenue)] font-mono">
                {distancia != null && (
                  <span>
                    {distancia.toFixed(0)} KM {rumbo} DE SELT
                  </span>
                )}
                {punto?.date && <span>{tiempoRelativo(punto.date)} · {fechaCorta(punto.date)}</span>}
              </div>

              {fuente && (
                <a
                  href={fuente.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 inline-block text-xs text-[var(--cian)] hover:underline"
                >
                  Ver fuente ({fuente.id}) ↗
                </a>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
