"use client";
import { useState } from "react";
import Link from "next/link";
import CardProducto from "./CardProducto";
import type { ProductoCard } from "./CardProducto";
import ModalDetalle from "./ModalDetalle";
import type { Config } from "@/lib/config";
import type { Banner } from "@/app/page";
import {
  TrustBar,
  CategoriasCirculos,
  Editorial,
  FranjaDescuento,
} from "./BloquesHome";
import type {
  BloqueTrust,
  BloqueCategorias,
  BloqueEditorial,
  BloqueDescuento,
} from "./BloquesHome";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Seccion {
  id: number;
  nombre: string;
  orden: number;
  activa: boolean;
  productos: ProductoCard[];
}

interface BloquesHome {
  trustBar?: BloqueTrust;
  categorias?: BloqueCategorias;
  editorial?: BloqueEditorial;
  descuento?: BloqueDescuento;
}

type ItemHome =
  | { tipo: "seccion"; orden: number; data: Seccion }
  | { tipo: "trust"; orden: number; data: BloqueTrust }
  | { tipo: "categorias"; orden: number; data: BloqueCategorias }
  | { tipo: "editorial"; orden: number; data: BloqueEditorial }
  | { tipo: "descuento"; orden: number; data: BloqueDescuento };

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
  const bloques = (config.bloquesHome || {}) as BloquesHome;

  const items: ItemHome[] = [];

  secciones
    .filter((s) => s.productos.length > 0)
    .forEach((s) => items.push({ tipo: "seccion", orden: s.orden, data: s }));

  if (bloques.trustBar?.visible)
    items.push({ tipo: "trust", orden: bloques.trustBar.orden, data: bloques.trustBar });
  if (bloques.categorias?.visible)
    items.push({ tipo: "categorias", orden: bloques.categorias.orden, data: bloques.categorias });
  if (bloques.editorial?.visible)
    items.push({ tipo: "editorial", orden: bloques.editorial.orden, data: bloques.editorial });
  if (bloques.descuento?.visible)
    items.push({ tipo: "descuento", orden: bloques.descuento.orden, data: bloques.descuento });

  items.sort((a, b) => a.orden - b.orden);

  const hayContenido = items.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {banners.length > 0 && <BannerHero banner={banners[0]} colorMarca={config.colorMarca} />}

      <main className="max-w-6xl mx-auto px-6 space-y-14 py-10">
        {items.map((item, idx) => {
          if (item.tipo === "trust") {
            return (
              <div key={`trust-${idx}`} className="-mx-6">
                <TrustBar items={item.data.items} colorMarca={config.colorMarca} />
              </div>
            );
          }
          if (item.tipo === "categorias") {
            return (
              <CategoriasCirculos
                key={`cat-${idx}`}
                titulo={item.data.titulo}
                items={item.data.items}
                colorMarca={config.colorMarca}
              />
            );
          }
          if (item.tipo === "editorial") {
            return (
              <Editorial
                key={`edi-${idx}`}
                bloque={item.data}
                colorHeader={config.colorHeader}
                colorMarca={config.colorMarca}
              />
            );
          }
          if (item.tipo === "descuento") {
            return (
              <FranjaDescuento
                key={`desc-${idx}`}
                bloque={item.data}
                colorMarca={config.colorMarca}
              />
            );
          }
          const seccion = item.data;
          return (
            <section key={`sec-${seccion.id}`}>
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
          );
        })}

        {!hayContenido && (
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