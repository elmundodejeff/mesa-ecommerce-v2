import { getConfig } from "@/lib/config";
import TiendaCliente from "@/components/TiendaCliente";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  descripcion: string | null;
}

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getProductos(): Promise<Producto[]> {
  const res = await fetch(`${BASE}/products`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function Home() {
  const [config, productos] = await Promise.all([
    getConfig(),
    getProductos(),
  ]);

  return <TiendaCliente config={config} productos={productos} />;
}