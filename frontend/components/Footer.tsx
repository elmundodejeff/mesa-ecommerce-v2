import Link from "next/link";
import type { Config } from "@/lib/config";

export default function Footer({ config }: { config: Config }) {
  const anio = new Date().getFullYear();
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-10">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg text-gray-900">
            {config.nombreSitio}<span style={{ color: config.colorMarca }}>.</span>
          </h3>
          <p className="text-sm text-gray-500 mt-2 max-w-xs">
            Juegos de mesa para reunir a quienes quieres alrededor de la mesa.
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-3">Navegacion</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-gray-800">Inicio</Link></li>
            <li><Link href="/tienda" className="hover:text-gray-800">Tienda</Link></li>
            <li><Link href="/blog" className="hover:text-gray-800">Blog</Link></li>
            <li><Link href="/contacto" className="hover:text-gray-800">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-3">Contacto</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            {config.contactoCorreo && <li>{config.contactoCorreo}</li>}
            {config.contactoTelefono && <li>{config.contactoTelefono}</li>}
            {config.contactoDireccion && <li>{config.contactoDireccion}</li>}
            {config.contactoInstagram && (
              <li>
                <a href={`https://instagram.com/${config.contactoInstagram.replace("@", "")}`} className="hover:text-gray-800">
                  Instagram
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 py-5 text-center text-xs text-gray-400">
        &copy; {anio} {config.nombreSitio}. Todos los derechos reservados.
      </div>
    </footer>
  );
}