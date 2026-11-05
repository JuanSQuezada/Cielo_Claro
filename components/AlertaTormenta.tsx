export default function AlertaTormenta({ hay }: { hay: boolean }) {
  if (!hay) return null;
  return (
    <div
      className="panel p-4 flex items-center gap-3 pulso"
      style={{
        "--panel-accent": "var(--rojo)",
        borderColor: "var(--rojo)",
        background: "rgba(255, 35, 64, 0.08)",
        color: "var(--rojo)",
      } as React.CSSProperties}
    >
      <span className="text-2xl" aria-hidden>
        ⚠
      </span>
      <div>
        <p className="font-bold uppercase tracking-wide" style={{ color: "var(--rojo)" }}>
          Alerta de tormenta
        </p>
        <p className="text-sm text-[var(--foreground)]/80">
          El METAR reporta nubes de tormenta (CB) o tormenta eléctrica (TS).
        </p>
      </div>
    </div>
  );
}
