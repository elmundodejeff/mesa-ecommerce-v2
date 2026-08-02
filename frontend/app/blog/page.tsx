import Link from "next/link";
import { getConfig } from "@/lib/config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { MenuItem } from "@/app/page";
interface Entrada {
  id: number;
  titulo: string;
  contenido: string;
  imagen: string | null;
  fecha: string;
}
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
async function getEntradas(): Promise<Entrada[]> {
  try {
    const res = await fetch(`${BASE}/blog/entradas`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
async function getMenu(): Promise<MenuItem[]> {
  try {
    const res = await fetch(`${BASE}/content/menu`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function fecha(f: string) {
  return new Date(f).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
}

function Placeholder({ marca }: { marca: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${marca}22, ${marca}0d)` }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={marca} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    </div>
  );
}

export default async function BlogList() {
  const [config, entradas, menu] = await Promise.all([getConfig(), getEntradas(), getMenu()]);
  const marca = config.colorMarca;
  const [destacada, ...resto] = entradas;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header config={config} menu={menu} />
      <main className="px-6 py-12 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Blog</h1>
          <p className="text-gray-500 mt-3">
            Novedades, guías y reseñas del mundo de los juegos de mesa.
          </p>
        </div>

        {entradas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500">No hay entradas aún.</p>
          </div>
        ) : (
          <>
            {/* Post destacado */}
            <Link
              href={`/blog/${destacada.id}`}
              className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="h-56 md:h-full min-h-[240px] overflow-hidden">
                  {destacada.imagen ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={destacada.imagen} alt={destacada.titulo} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <Placeholder marca={marca} />
                  )}
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <span className="inline-flex items-center self-start text-xs font-semibold px-3 py-1 rounded-full mb-3" style={{ backgroundColor: `${marca}18`, color: marca }}>
                    Más reciente
                  </span>
                  <p className="text-xs text-gray-400 mb-2">{fecha(destacada.fecha)}</p>
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:opacity-80 transition-opacity">{destacada.titulo}</h2>
                  <p className="text-gray-500 mt-3 line-clamp-3">{destacada.contenido}</p>
                  <span className="mt-4 text-sm font-medium inline-flex items-center gap-1" style={{ color: marca }}>
                    Leer más
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  </span>
                </div>
              </div>
            </Link>

            {/* Resto en grilla */}
            {resto.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {resto.map((e) => (
                  <Link
                    key={e.id}
                    href={`/blog/${e.id}`}
                    className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow"
                  >
                    <div className="h-44 overflow-hidden">
                      {e.imagen ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={e.imagen} alt={e.titulo} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <Placeholder marca={marca} />
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-gray-400 mb-1.5">{fecha(e.fecha)}</p>
                      <h2 className="text-lg font-semibold text-gray-900 group-hover:opacity-80 transition-opacity line-clamp-2">{e.titulo}</h2>
                      <p className="text-gray-500 text-sm mt-2 line-clamp-2">{e.contenido}</p>
                      <span className="mt-3 text-sm font-medium inline-flex items-center gap-1" style={{ color: marca }}>
                        Leer más
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer config={config} />
    </div>
  );
}