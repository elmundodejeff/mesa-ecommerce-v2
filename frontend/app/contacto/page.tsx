import Link from "next/link";
import { getConfig } from "@/lib/config";
import ContactoForm from "@/components/ContactoForm";
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

export default async function Contacto() {
  const [config, menu] = await Promise.all([getConfig(), getMenu()]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header config={config} menu={menu} />

      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Contacto</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-800">Datos</h2>
            <ul className="space-y-3 text-gray-700">
              {config.contactoCorreo ? (
                <li>
                  <span className="text-gray-400 text-sm block">Correo</span>
                  {config.contactoCorreo}
                </li>
              ) : null}
              {config.contactoTelefono ? (
                <li>
                  <span className="text-gray-400 text-sm block">Telefono</span>
                  {config.contactoTelefono}
                </li>
              ) : null}
              {config.contactoDireccion ? (
                <li>
                  <span className="text-gray-400 text-sm block">Direccion</span>
                  {config.contactoDireccion}
                </li>
              ) : null}
              {config.contactoHorario ? (
                <li>
                  <span className="text-gray-400 text-sm block">Horario</span>
                  {config.contactoHorario}
                </li>
              ) : null}
            </ul>
            <div className="flex gap-4 pt-2">
              {config.contactoInstagram ? (
                <Link href={config.contactoInstagram} target="_blank" className="hover:underline" style={{ color: config.colorMarca }}>
                  Instagram
                </Link>
              ) : null}
              {config.contactoTiktok ? (
                <Link href={config.contactoTiktok} target="_blank" className="hover:underline" style={{ color: config.colorMarca }}>
                  TikTok
                </Link>
              ) : null}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-gray-800 mb-4">
              Envianos un mensaje
            </h2>
            <ContactoForm colorMarca={config.colorMarca} />
          </div>
        </div>
      </main>
      <Footer config={config} />
    </div>
  );
}