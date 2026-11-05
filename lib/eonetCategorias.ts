export type CategoriaEonet = {
  etiqueta: string;
  color: string;
  icono: string;
};

export const CATEGORIAS_EONET: Record<string, CategoriaEonet> = {
  wildfires: { etiqueta: "Incendio", color: "#f97316", icono: "🔥" },
  volcanoes: { etiqueta: "Volcán", color: "#ef4444", icono: "🌋" },
  severeStorms: { etiqueta: "Tormenta severa", color: "#3b82f6", icono: "⛈️" },
  floods: { etiqueta: "Inundación", color: "#06b6d4", icono: "🌊" },
  drought: { etiqueta: "Sequía", color: "#ca8a04", icono: "🏜️" },
  dustHaze: { etiqueta: "Polvo / neblina", color: "#a8a29e", icono: "💨" },
  earthquakes: { etiqueta: "Sismo", color: "#dc2626", icono: "🌐" },
  landslides: { etiqueta: "Deslizamiento", color: "#92400e", icono: "⛰️" },
  manmade: { etiqueta: "Evento antrópico", color: "#64748b", icono: "⚙️" },
  seaLakeIce: { etiqueta: "Hielo marino/lacustre", color: "#38bdf8", icono: "🧊" },
  snow: { etiqueta: "Nieve", color: "#e2e8f0", icono: "❄️" },
  tempExtremes: { etiqueta: "Temperatura extrema", color: "#f43f5e", icono: "🌡️" },
  waterColor: { etiqueta: "Color de agua", color: "#22d3ee", icono: "💧" },
  icebergs: { etiqueta: "Iceberg", color: "#7dd3fc", icono: "🧊" },
};

export function categoriaDe(id: string): CategoriaEonet {
  return CATEGORIAS_EONET[id] ?? { etiqueta: id, color: "#a3a3a3", icono: "⚠️" };
}
