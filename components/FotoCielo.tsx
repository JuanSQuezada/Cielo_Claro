"use client";

import { useState } from "react";
import BarrasPrediccion from "./BarrasPrediccion";
import { hayTormenta } from "@/lib/categoriaVuelo";
import { Prediccion } from "@/lib/tipos";

export default function FotoCielo() {
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [predicciones, setPredicciones] = useState<Prediccion[] | null>(null);
  const [coinciden, setCoinciden] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarArchivo(archivo: File) {
    setCargando(true);
    setError(null);
    setPredicciones(null);
    setVistaPrevia(URL.createObjectURL(archivo));

    try {
      const formData = new FormData();
      formData.append("imagen", archivo);

      const [resClasificar, resMetar] = await Promise.all([
        fetch("/api/clasificar", { method: "POST", body: formData }),
        fetch("/api/metar").catch(() => null),
      ]);

      const datosClasificar = await resClasificar.json();
      if (!resClasificar.ok) {
        throw new Error(datosClasificar.error ?? "Error al clasificar la imagen");
      }

      const lista: Prediccion[] = datosClasificar.predicciones;
      setPredicciones(lista);

      if (resMetar && resMetar.ok) {
        const metar = await resMetar.json();
        const principal = lista[0]?.tagName?.toLowerCase();
        if (metar.rawOb && hayTormenta(metar.rawOb) && principal === "cielo lluvioso") {
          setCoinciden(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="panel p-4 space-y-4">
      <h2 className="font-semibold">Foto del cielo</h2>

      <label className="block">
        <span className="sr-only">Subir foto del cielo</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            if (archivo) manejarArchivo(archivo);
          }}
          className="block w-full text-sm text-[var(--texto-tenue)] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white file:text-sm hover:file:bg-blue-500"
        />
      </label>

      {vistaPrevia && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={vistaPrevia}
          alt="Vista previa del cielo"
          className="w-full max-h-64 object-cover rounded-xl"
        />
      )}

      {cargando && (
        <p className="text-sm text-[var(--texto-tenue)]">Clasificando imagen…</p>
      )}

      {error && <p className="text-sm text-red-300">{error}</p>}

      {predicciones && predicciones.length > 0 && (
        <div className="space-y-3">
          <BarrasPrediccion predicciones={predicciones} />
          {coinciden && (
            <p className="text-sm font-medium text-amber-300">
              Las dos fuentes coinciden
            </p>
          )}
        </div>
      )}
    </div>
  );
}
