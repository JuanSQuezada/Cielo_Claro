"use client";

import { useState } from "react";
import BarrasPrediccion from "./BarrasPrediccion";
import { hayTormenta } from "@/lib/categoriaVuelo";
import { Prediccion } from "@/lib/tipos";

type Telemetria = {
  tiempoMs: number;
  tamanoKb: number;
  ancho: number;
  alto: number;
  clases: number;
};

function dimensionesDe(archivo: File): Promise<{ ancho: number; alto: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(archivo);
    img.onload = () => {
      resolve({ ancho: img.naturalWidth, alto: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => resolve({ ancho: 0, alto: 0 });
    img.src = url;
  });
}

export default function FotoCielo() {
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [predicciones, setPredicciones] = useState<Prediccion[] | null>(null);
  const [telemetria, setTelemetria] = useState<Telemetria | null>(null);
  const [coinciden, setCoinciden] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);

  async function manejarArchivo(archivo: File) {
    setCargando(true);
    setError(null);
    setPredicciones(null);
    setTelemetria(null);
    setCoinciden(false);
    setVistaPrevia(URL.createObjectURL(archivo));

    const inicio = performance.now();

    try {
      const { ancho, alto } = await dimensionesDe(archivo);
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
      setTelemetria({
        tiempoMs: Math.round(performance.now() - inicio),
        tamanoKb: Math.round(archivo.size / 1024),
        ancho,
        alto,
        clases: lista.length,
      });

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
      <h2 className="font-semibold">Foto del cielo — clasificación por IA</h2>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          const archivo = e.dataTransfer.files?.[0];
          if (archivo) manejarArchivo(archivo);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          arrastrando ? "border-[var(--acento)] bg-[var(--acento)]/10" : "border-[var(--borde)] hover:bg-white/5"
        }`}
      >
        <span className="text-2xl" aria-hidden>
          📷
        </span>
        <span className="text-sm text-[var(--texto-tenue)]">
          Arrastra una foto aquí o haz clic para seleccionarla
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            if (archivo) manejarArchivo(archivo);
          }}
          className="hidden"
        />
      </label>

      {vistaPrevia && (
        <div className={`relative border border-[var(--borde)] ${cargando ? "escaneo-ia" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={vistaPrevia}
            alt="Vista previa del cielo"
            className="w-full max-h-64 object-cover"
          />
        </div>
      )}

      {cargando && (
        <p className="text-sm text-[var(--cian)] flex items-center gap-2 font-mono">
          <span className="w-2 h-2 bg-[var(--cian)] pulso" aria-hidden />
          ANALIZANDO IMAGEN — RED NEURONAL EN EJECUCIÓN…
        </p>
      )}

      {error && <p className="text-sm text-red-300">{error}</p>}

      {predicciones && predicciones.length > 0 && (
        <div className="space-y-3">
          <BarrasPrediccion predicciones={predicciones} />

          {telemetria && (
            <div className="hud-tile p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              <TelemetriaItem etiqueta="Inferencia" valor={`${telemetria.tiempoMs} ms`} />
              <TelemetriaItem etiqueta="Imagen" valor={`${telemetria.ancho}×${telemetria.alto}px`} />
              <TelemetriaItem etiqueta="Peso" valor={`${telemetria.tamanoKb} KB`} />
              <TelemetriaItem etiqueta="Clases" valor={`${telemetria.clases}`} />
            </div>
          )}

          {coinciden && (
            <p
              className="text-sm font-medium px-3 py-2 pulso"
              style={{ color: "var(--ambar)", border: "1px solid var(--ambar)", background: "rgba(255,176,0,0.08)" }}
            >
              ⚠️ Las dos fuentes coinciden: METAR y foto reportan condición de tormenta.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function TelemetriaItem({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-[var(--texto-tenue)]">{etiqueta}</p>
      <p className="text-[var(--cian)] tabular-nums">{valor}</p>
    </div>
  );
}
