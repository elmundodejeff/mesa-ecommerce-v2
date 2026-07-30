import Link from "next/link";
import { getConfig } from "@/lib/config";
import ComentarForm from "@/components/ComentarForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { MenuItem } from "@/app/page";

interface Comentario {
  id: number;
  contenido: string;
  creado: string;
  user: { nombre: string | null };
}

interface Entrada {
  id: number;
  titulo: string;
  contenido: string;
  imagen: string | null;
  fecha: string;
  comentarios: Comentario[];
}

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getEntrada(id: string): Promise<Entrada | null> {
  try {
    const res = await fetch(`${BASE}/blog/entradas/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
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

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [config, entrada, menu] = await Promise.all([
    getConfig(),
    getEntrada(id),
    getMenu(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header config={config} menu={menu} />

      <main className="p-6 max-w-3xl mx-auto">
        {!entrada ? (
          <p className="text-gray-500">Entrada no encontrada.</p>
        ) : (
          <article>
            {entrada.imagen && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entrada.imagen}
                alt={entrada.titulo}
                className="w-full h-64 object-cover rounded-xl mb-6"
              />
            )}
            <p className="text-sm text-gray-400">
              {new Date(entrada.fecha).toLocaleDateString("es-CL")}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1 mb-4">
              {entrada.titulo}
            </h1>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {entrada.contenido}
            </div>

            <hr className="my-8" />

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Comentarios ({entrada.comentarios.length})
              </h2>
              <div className="space-y-3 mb-6">
                {entrada.comentarios.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    Aun no hay comentarios. Se el primero.
                  </p>
                ) : (
                  entrada.comentarios.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white rounded-lg p-4 shadow-sm"
                    >
                      <p className="text-gray-800">{c.contenido}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {c.user.nombre || "Usuario"} -{" "}
                        {new Date(c.creado).toLocaleDateString("es-CL")}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <ComentarForm entradaId={entrada.id} />
            </section>
          </article>
        )}
      </main>
      <Footer config={config} />
    </div>
  );
}