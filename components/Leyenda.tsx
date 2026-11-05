import { CATEGORIAS_EONET } from "@/lib/eonetCategorias";

type Props = {
  categoriasPresentes: string[];
};

export default function Leyenda({ categoriasPresentes }: Props) {
  const entradas = Object.entries(CATEGORIAS_EONET).filter(([id]) => categoriasPresentes.includes(id));

  if (entradas.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {entradas.map(([id, { etiqueta, color, icono }]) => (
        <span
          key={id}
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
          style={{ borderColor: `${color}55`, background: `${color}14`, color }}
        >
          <span>{icono}</span>
          {etiqueta}
        </span>
      ))}
    </div>
  );
}
