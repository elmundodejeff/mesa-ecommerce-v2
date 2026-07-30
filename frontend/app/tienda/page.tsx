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

export default async function TiendaPage() {
  const [config, productos, menu, categorias] = await Promise.all([
    getConfig(),
    getJson<ProductoCard[]>("/products", []),
    getJson<MenuItem[]>("/content/menu", []),
    getJson<Categoria[]>("/categories", []),
  ]);

  return (
    <>
      <Header config={config} menu={menu} />
      <TiendaCliente config={config} productos={productos} categorias={categorias} />
      <Footer config={config} />
    </>
  );
}