import Encabezado from "@/components/Encabezado";
import SeccionMetar from "@/components/SeccionMetar";
import GraficoClima from "@/components/GraficoClima";
import FotoCielo from "@/components/FotoCielo";
import MapaEventosDinamico from "@/components/MapaEventosDinamico";

export default function Home() {
  return (
    <>
      <Encabezado />
      <main className="flex-1 px-4 py-6 sm:px-6 max-w-5xl mx-auto w-full space-y-6">
        <SeccionMetar />
        <MapaEventosDinamico />
        <GraficoClima />
        <FotoCielo />
      </main>
    </>
  );
}
