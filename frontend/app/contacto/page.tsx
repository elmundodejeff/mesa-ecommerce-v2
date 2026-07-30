import Link from "next/link";
import { getConfig } from "@/lib/config";
import ContactoForm from "@/components/ContactoForm";

export default async function Contacto() {
  const config = await getConfig();

  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="px-6 py-4 flex justify-between items-center"
        style={{
          backgroundColor: config.colorHeader,
          color: config.colorHeaderTexto,
        }}
      >
        <Link href="/" className="font-bold text-xl">
          {config.nombreSitio}
        </Link>
        <Link href="/" className="text-sm hover:underline">
          Volver a la tienda
        </Link>
      </header>

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
    </div>
  );
}