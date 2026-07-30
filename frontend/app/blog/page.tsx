import Link from "next/link";
import { getConfig } from "@/lib/config";

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

export default async function BlogList() {
  const [config, entradas] = await Promise.all([getConfig(), getEntradas()]);

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

      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Blog</h1>
        {entradas.length === 0 ? (
          <p className="text-gray-500">No hay entradas aun.</p>
        ) : (
          <div className="space-y-6">
            {entradas.map((e) => (
              <Link
                key={e.id}
                href={`/blog/${e.id}`}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
              >
                {e.imagen && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.imagen}
                    alt={e.titulo}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-5">
                  <p className="text-xs text-gray-400 mb-1">
                    {new Date(e.fecha).toLocaleDateString("es-CL")}
                  </p>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {e.titulo}
                  </h2>
                  <p className="text-gray-500 mt-2 line-clamp-2">
                    {e.contenido}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}