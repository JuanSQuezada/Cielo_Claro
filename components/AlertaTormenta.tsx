export default function AlertaTormenta({ hay }: { hay: boolean }) {
  if (!hay) return null;
  return (
    <div className="panel p-4 border-red-500/50 bg-red-500/10 flex items-center gap-3">
      <span className="text-2xl" aria-hidden>
        ⚠️
      </span>
      <div>
        <p className="font-semibold text-red-400">
          Alerta de tormenta
        </p>
        <p className="text-sm text-red-200/80">
          El METAR reporta nubes de tormenta (CB) o tormenta eléctrica (TS).
        </p>
      </div>
    </div>
  );
}
