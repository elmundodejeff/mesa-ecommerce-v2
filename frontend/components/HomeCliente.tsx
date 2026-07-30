"use client";

import { useState } from "react";
import Link from "next/link";
import CardProducto from "./CardProducto";
import type { ProductoCard } from "./CardProducto";
import ModalDetalle from "./ModalDetalle";
import type { Config } from "@/lib/config";
import type { Banner } from "@/app/page";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Seccion {
  id: number;
  nombre: string;
  orden: number;
  activa: boolean;
  productos: ProductoCard[];
}

export default function HomeCliente({
  config,
  banners,
  secciones,
}: {
  config: Config;
  banners: Banner[];
  secciones: Seccion[];
}) {
  const [detalle, setDetalle] = useState<ProductoCard | null>(null);
  const conProductos = secciones.filter((s) => s.productos.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {banners.length > 0 && <BannerHero banner={banners[0]} colorMarca={config.colorMarca} />}

      <main className="p-6 max-w-6xl mx-auto space-y-14 py-10">
        {conProductos.map((seccion) => (
          <section key={seccion.id}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                {seccion.nombre.toLowerCase().includes("venta") && (
                  <span
                    className="text-xs font-medium text-white px-3 py-1 rounded-full uppercase"
                    style={{ backgroundColor: config.colorMarca }}
                  >
                    Preventa
                  </span>
                )}
                <h2 className="text-2xl font-bold text-gray-900">{seccion.nombre}</h2>
              </div>
              <Link href="/tienda" className="text-sm hover:underline" style={{ color: config.colorMarca }}>
                Ver toda la tienda
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {seccion.productos.map((p) => (
                <CardProducto
                  key={p.id}
                  producto={p}
                  colorMarca={config.colorMarca}
                  onVer={setDetalle}
                />
              ))}
            </div>
          </section>
        ))}

        {conProductos.length === 0 && (
          <p className="text-center text-gray-400 py-20">
            No hay secciones con productos aun. Configuralas en el admin.
          </p>
        )}
      </main>

      {detalle && (
        <ModalDetalle
          producto={detalle}
          colorMarca={config.colorMarca}
          onCerrar={() => setDetalle(null)}
          onAgregar={() => {}}
        />
      )}
    </div>
  );
}

function BannerHero({ banner, colorMarca }: { banner: Banner; colorMarca: string }) {
  const [error, setError] = useState(false);
  return (
    <div className="relative w-full h-64 md:h-80 overflow-hidden">
      {error || !banner.imagen ? (
        <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${colorMarca}, ${colorMarca}dd)` }} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${API_BASE}${banner.imagen}`}
          alt={banner.titulo || "banner"}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      )}
      {(banner.titulo || banner.subtitulo) && (
        <div className="absolute inset-0 bg-black/25 flex flex-col justify-center items-center text-white text-center px-4">
          {banner.titulo && <h2 className="text-3xl md:text-5xl font-bold drop-shadow">{banner.titulo}</h2>}
          {banner.subtitulo && <p className="mt-2 text-base md:text-lg drop-shadow">{banner.subtitulo}</p>}
        </div>
      )}
    </div>
  );
}