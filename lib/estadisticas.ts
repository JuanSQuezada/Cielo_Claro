export function estadisticas(valores: (number | null)[]) {
  const validos = valores.filter((v): v is number => v != null);
  if (validos.length === 0) {
    return { promedio: null, minimo: null, maximo: null };
  }
  const promedio = validos.reduce((acc, v) => acc + v, 0) / validos.length;
  return {
    promedio,
    minimo: Math.min(...validos),
    maximo: Math.max(...validos),
  };
}
