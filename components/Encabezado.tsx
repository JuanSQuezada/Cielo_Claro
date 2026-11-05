"use client";

import { useEffect, useState } from "react";
import { formatoZulu } from "@/lib/tiempo";
import { AEROPUERTO_PRINCIPAL, AEROPUERTO_RESPALDO } from "@/lib/config";

export default function Encabezado() {
  const [hora, setHora] = useState<string | null>(null);

  useEffect(() => {
    const actualizar = () => setHora(formatoZulu(new Date()));
    actualizar();
    const id = setInterval(actualizar, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="px-4 py-4 sm:px-6 border-b border-[var(--borde)] radar-grid">
      <div className="max-w-6xl mx-auto w-full flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 bg-[var(--acento)] pulso"
              style={{ color: "var(--acento)" }}
              aria-hidden
            />
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider uppercase">Cielo Claro</h1>
            <span className="text-[10px] uppercase tracking-widest border border-[var(--cian)] text-[var(--cian)] px-1.5 py-0.5">
              ATC OPS
            </span>
          </div>
          <p className="text-sm text-[var(--texto-tenue)] mt-1">
            Panel de condiciones de vuelo — {AEROPUERTO_PRINCIPAL} Latacunga · respaldo {AEROPUERTO_RESPALDO}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-sm border border-[var(--borde)] bg-black/40 px-3 py-1.5">
          <span className="text-[var(--texto-tenue)] text-xs uppercase">Zulu</span>
          <span className="tabular-nums tracking-wider text-[var(--cian)]">{hora ?? "--:--:--Z"}</span>
        </div>
      </div>
    </header>
  );
}
