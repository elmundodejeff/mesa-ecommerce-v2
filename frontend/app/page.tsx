import { getConfig } from "@/lib/config";
import Header from "@/components/Header";
import HomeCliente from "@/components/HomeCliente";
import Footer from "@/components/Footer";

export interface Banner {
  id: number;
  imagen: string;
  titulo: string | null;
  subtitulo: string | null;
  enlace: string | null;
}

export interface Categoria {
  id: number;
  nombre: string;
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
  const [config, banners, menu, secciones] = await Promise.all([
    getConfig(),
    getJson<Banner[]>("/content/banners", []),
    getJson<MenuItem[]>("/content/menu", []),
    getJson<[]>("/sections/home", []),
  ]);

  return (
    <>
      <Header config={config} menu={menu} />
      <HomeCliente config={config} banners={banners} secciones={secciones} />
      <Footer config={config} />
    </>
  );
}