import { CategoriaVuelo } from "@/lib/tipos";
import { COLOR_CATEGORIA } from "@/lib/categoriaVuelo";

const DESCRIPCION: Record<CategoriaVuelo, string> = {
  VFR: "Visual — condiciones despejadas",
  MVFR: "Visual marginal — precaución",
  IFR: "Instrumental — visibilidad reducida",
  LIFR: "Instrumental baja — condiciones severas",
};

export default function Semaforo({ categoria }: { categoria: CategoriaVuelo }) {
  const color = COLOR_CATEGORIA[categoria];
  const critico = categoria === "IFR" || categoria === "LIFR";
  return (
    <div className="panel p-4 flex items-center gap-4" style={{ "--panel-accent": color } as React.CSSProperties}>
      <span
        className={`w-4 h-4 shrink-0 ${critico ? "pulso" : ""}`}
        style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}`, color }}
        aria-hidden
      />
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[var(--texto-tenue)]">Categoría de vuelo</p>
        <p className="text-lg font-bold tracking-wider" style={{ color }}>
          {categoria}
        </p>
        <p className="text-sm text-[var(--texto-tenue)]">{DESCRIPCION[categoria]}</p>
      </div>
    </div>
  );
}
