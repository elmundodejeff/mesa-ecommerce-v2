import Link from "next/link";
import { getConfig } from "@/lib/config";
import ContactoForm from "@/components/ContactoForm";
import NewsletterForm from "@/components/NewsletterForm";
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
  const marca = config.colorMarca;
  const hayDatos =
    config.contactoCorreo ||
    config.contactoTelefono ||
    config.contactoDireccion ||
    config.contactoHorario;
  return (
    <div className="min-h-screen bg-white">
      <Header config={config} menu={menu} />
      <main className="px-6 py-12 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Hablemos</h1>
          <p className="text-gray-500 mt-3">
            ¿Tienes una duda sobre un juego, tu pedido, o quieres proponernos algo?
            Escríbenos y te respondemos lo antes posible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Otras formas de contacto</h2>
            <ul className="space-y-4">
              {config.contactoCorreo ? (
                <li>
                  <p className="font-medium text-gray-800">Correo</p>
                  <p className="text-gray-500 text-sm">{config.contactoCorreo}</p>
                </li>
              ) : null}
              {config.contactoTelefono ? (
                <li>
                  <p className="font-medium text-gray-800">Teléfono</p>
                  <p className="text-gray-500 text-sm">{config.contactoTelefono}</p>
                </li>
              ) : null}
              {config.contactoDireccion ? (
                <li>
                  <p className="font-medium text-gray-800">Dirección</p>
                  <p className="text-gray-500 text-sm">{config.contactoDireccion}</p>
                </li>
              ) : null}
              {config.contactoHorario ? (
                <li>
                  <p className="font-medium text-gray-800">Horario</p>
                  <p className="text-gray-500 text-sm">{config.contactoHorario}</p>
                </li>
              ) : null}
              {!hayDatos && (
                <li className="text-gray-400 text-sm">
                  Completa los datos de contacto desde el panel de administración.
                </li>
              )}
            </ul>

            {(config.contactoInstagram || config.contactoTiktok) && (
              <div className="flex gap-4 pt-1">
                {config.contactoInstagram ? (
                  <Link href={config.contactoInstagram} target="_blank" className="text-sm font-medium hover:underline" style={{ color: marca }}>
                    Instagram
                  </Link>
                ) : null}
                {config.contactoTiktok ? (
                  <Link href={config.contactoTiktok} target="_blank" className="text-sm font-medium hover:underline" style={{ color: marca }}>
                    TikTok
                  </Link>
                ) : null}
              </div>
            )}

            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
              <p className="text-sm text-gray-600 leading-relaxed">
                Somos una tienda hecha por y para amantes de los juegos de mesa.
                Cada mensaje lo lee una persona real, así que cuéntanos con confianza
                en qué podemos ayudarte.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Envíanos un mensaje</h2>
            <ContactoForm colorMarca={marca} />
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-gray-100 p-8 md:p-10 text-center" style={{ backgroundColor: `${marca}08` }}>
          <h2 className="text-2xl font-bold text-gray-900">Suscríbete al newsletter</h2>
          <p className="text-gray-500 mt-2 mb-6 max-w-lg mx-auto">
            Recibe novedades, preventas y ofertas antes que nadie. Sin spam, prometido.
          </p>
          <div className="max-w-2xl mx-auto">
            <NewsletterForm colorMarca={marca} />
          </div>
        </div>
      </main>
      <Footer config={config} />
    </div>
  );
}