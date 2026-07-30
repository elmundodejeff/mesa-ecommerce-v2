import { getConfig } from "@/lib/config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { MenuItem } from "@/app/page";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getMenu(): Promise<MenuItem[]> {
  try {
    const res = await fetch(`${BASE}/content/menu`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function SobreNosotros() {
  const [config, menu] = await Promise.all([getConfig(), getMenu()]);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header config={config} menu={menu} />
      <main className="p-6 max-w-3xl mx-auto py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Sobre nosotros</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4 text-gray-700 leading-relaxed">
          <p>
            En {config.nombreSitio} creemos que los mejores momentos suceden
            alrededor de una mesa. Somos una tienda dedicada a los juegos de
            mesa, cartas coleccionables y todo lo necesario para reunir a
            quienes quieres.
          </p>
          <p>
            Seleccionamos cada producto pensando en la experiencia de juego:
            desde clasicos imprescindibles hasta novedades y preventas
            exclusivas. Nuestro objetivo es que encuentres tu proximo juego
            favorito y lo disfrutes con familia y amigos.
          </p>
          <p>
            Gracias por ser parte de nuestra comunidad. Si tienes dudas o
            sugerencias, no dudes en escribirnos desde la seccion de contacto.
          </p>
        </div>
      </main>
      <Footer config={config} />
    </div>
  );
}