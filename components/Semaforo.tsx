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
  return (
    <div className="panel p-4 flex items-center gap-4">
      <span
        className="w-4 h-4 rounded-full shrink-0"
        style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
        aria-hidden
      />
      <div>
        <p className="text-lg font-bold" style={{ color }}>
          {categoria}
        </p>
        <p className="text-sm text-[var(--texto-tenue)]">{DESCRIPCION[categoria]}</p>
      </div>
    </div>
  );
}
