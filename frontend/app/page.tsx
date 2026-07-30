import { getConfig } from "@/lib/config";
import TiendaCliente from "@/components/TiendaCliente";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  descripcion: string | null;
}

export interface Banner {
  id: number;
  imagen: string;
  titulo: string | null;
  subtitulo: string | null;
  enlace: string | null;
}

export interface MenuItem {
  id: number;
  texto: string;
  enlace: string;
  hijos: { id: number; texto: string; enlace: string }[];
}

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

export default async function Home() {
  const [config, productos, banners, menu] = await Promise.all([
    getConfig(),
    getJson<Producto[]>("/products", []),
    getJson<Banner[]>("/content/banners", []),
    getJson<MenuItem[]>("/content/menu", []),
  ]);

  return (
    <TiendaCliente
      config={config}
      productos={productos}
      banners={banners}
      menu={menu}
    />
  );
}