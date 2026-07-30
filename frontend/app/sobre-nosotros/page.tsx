import { getConfig } from "@/lib/config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SobreNosotrosContenido from "@/components/SobreNosotrosContenido";
import type { SobreNosotrosData } from "@/components/SobreNosotrosContenido";
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
  const data = (config.sobreNosotros as SobreNosotrosData) || {};
  const vacio = !data || Object.keys(data).length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header config={config} menu={menu} />
      {vacio ? (
        <main className="p-6 max-w-3xl mx-auto py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Sobre nosotros</h1>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-gray-500">
            Esta pagina aun no tiene contenido. Configurala desde el admin.
          </div>
        </main>
      ) : (
        <SobreNosotrosContenido data={data} colorMarca={config.colorMarca} />
      )}
      <Footer config={config} />
    </div>
  );
}