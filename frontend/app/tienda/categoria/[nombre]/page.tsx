import { getConfig } from "@/lib/config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TiendaCliente from "@/components/TiendaCliente";
import type { ProductoCard } from "@/components/CardProducto";
import type { Categoria, MenuItem } from "@/app/page";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return res.json();
  } catch {
    return fallback;
  }
}

export default async function TiendaCategoria({
  params,
}: {
  params: Promise<{ nombre: string }>;
}) {
  const { nombre } = await params;
  const nombreDecodificado = decodeURIComponent(nombre);

  const [config, productos, menu, categorias] = await Promise.all([
    getConfig(),
    getJson<ProductoCard[]>("/products", []),
    getJson<MenuItem[]>("/content/menu", []),
    getJson<Categoria[]>("/categories", []),
  ]);

  // Filtrar por nombre de categoria (case-insensitive)
  const filtrados = productos.filter((p) =>
    (p.categorias || []).some(
      (c) => c.nombre.toLowerCase() === nombreDecodificado.toLowerCase(),
    ),
  );

  return (
    <>
      <Header config={config} menu={menu} />
      <TiendaCliente
        config={config}
        productos={filtrados}
        categorias={categorias}
        titulo={nombreDecodificado}
      />
      <Footer config={config} />
    </>
  );
}