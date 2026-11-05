"use client";

import { useEffect, useState } from "react";
import TarjetaMetar from "./TarjetaMetar";
import Semaforo from "./Semaforo";
import AlertaTormenta from "./AlertaTormenta";
import { calcularCategoria, hayTormenta } from "@/lib/categoriaVuelo";
import { Metar } from "@/lib/tipos";

type MetarConEstacion = Metar & { estacionUsada: string };

export default function SeccionMetar() {
  const [metar, setMetar] = useState<MetarConEstacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/metar")
      .then(async (res) => {
        if (res.status === 204) {
          throw new Error("Sin reporte METAR reciente para SELT ni SEQM");
        }
        const datos = await res.json();
        if (!res.ok) throw new Error(datos.error ?? "Error al consultar METAR");
        setMetar(datos);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return <div className="panel p-4 text-sm text-[var(--texto-tenue)]">Cargando METAR…</div>;
  }

  if (error || !metar) {
    return (
      <div className="panel p-4 text-sm text-red-300">
        No se pudo cargar el METAR: {error}
      </div>
    );
  }

  const categoria = calcularCategoria(metar.visib, metar.clouds);
  const tormenta = hayTormenta(metar.rawOb);

  return (
    <div className="space-y-3">
      <Semaforo categoria={categoria} />
      <AlertaTormenta hay={tormenta} />
      <TarjetaMetar metar={metar} />
    </div>
  );
}
