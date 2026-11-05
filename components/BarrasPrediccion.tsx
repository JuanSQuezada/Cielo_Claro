import { Prediccion } from "@/lib/tipos";

const COLORES = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

export default function BarrasPrediccion({ predicciones }: { predicciones: Prediccion[] }) {
  return (
    <div className="space-y-2">
      {predicciones.map((p, indice) => {
        const color = COLORES[indice] ?? "#64748b";
        return (
          <div key={p.tagName}>
            <div className="flex justify-between text-xs mb-1">
              <span className="capitalize flex items-center gap-1">
                {indice === 0 && <span aria-hidden>🏆</span>}
                {p.tagName}
              </span>
              <span className="font-medium" style={{ color }}>
                {(p.probability * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-black/30 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.round(p.probability * 100)}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
