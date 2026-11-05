import { Prediccion } from "@/lib/tipos";

export default function BarrasPrediccion({ predicciones }: { predicciones: Prediccion[] }) {
  return (
    <div className="space-y-2">
      {predicciones.map((p) => (
        <div key={p.tagName}>
          <div className="flex justify-between text-xs mb-1">
            <span className="capitalize">{p.tagName}</span>
            <span className="text-[var(--texto-tenue)]">
              {(p.probability * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-black/30 overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${Math.round(p.probability * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
