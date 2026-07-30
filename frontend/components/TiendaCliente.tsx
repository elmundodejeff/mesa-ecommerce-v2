"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCarrito } from "@/lib/carrito";
import type { Config } from "@/lib/config";
import type { Banner, MenuItem } from "@/app/page";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  descripcion: string | null;
}

export default function TiendaCliente({
  config,
  productos,
  banners,
  menu,
}: {
  config: Config;
  productos: Producto[];
  banners: Banner[];
  menu: MenuItem[];
}) {
  const { agregar, cantidadTotal } = useCarrito();

  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="px-6 py-4 flex justify-between items-center relative z-30"
        style={{
          backgroundColor: config.colorHeader,
          color: config.colorHeaderTexto,
        }}
      >
        <h1 className="font-bold text-xl">{config.nombreSitio}</h1>
        <Link
          href="/checkout"
          className="px-4 py-2 rounded font-medium"
          style={{ backgroundColor: config.colorMarca, color: "#fff" }}
        >
          Carrito ({cantidadTotal})
        </Link>
      </header>

      {menu.length > 0 && (
        <nav
          className="px-6 flex gap-1 text-sm relative z-30 shadow-sm"
          style={{
            backgroundColor: config.colorHeader,
            color: config.colorHeaderTexto,
          }}
        >
          {menu.map((item) => (
            <div key={item.id} className="relative group">
              <Link
                href={item.enlace}
                className="px-4 py-3 hover:bg-black/20 inline-flex items-center gap-1"
              >
                {item.texto}
                {item.hijos.length > 0 && (
                  <span className="text-xs opacity-70">&#9662;</span>
                )}
              </Link>
              {item.hijos.length > 0 && (
                <div className="absolute left-0 top-full hidden group-hover:block bg-white text-gray-800 rounded-b shadow-xl min-w-44 z-40 overflow-hidden">
                  {item.hijos.map((h) => (
                    <Link
                      key={h.id}
                      href={h.enlace}
                      className="block px-4 py-2.5 hover:bg-gray-100 border-b last:border-0"
                    >
                      {h.texto}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}

      {banners.length > 0 && (
        <Carrusel banners={banners} colorMarca={config.colorMarca} />
      )}

      <main className="p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Productos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productos.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col border border-gray-100"
            >
              <h3 className="font-semibold text-lg text-gray-900">
                {p.nombre}
              </h3>
              <p className="text-gray-500 text-sm flex-1 mt-1 line-clamp-2">
                {p.descripcion || "Sin descripcion"}
              </p>
              <p
                className="font-bold text-2xl mt-4"
                style={{ color: config.colorMarca }}
              >
                ${p.precio.toLocaleString("es-CL")}
              </p>
              <p className="text-xs text-gray-400 mb-4">
                {p.stock > 0 ? `${p.stock} disponibles` : "Agotado"}
              </p>
              <button
                onClick={() =>
                  agregar({
                    productoId: p.id,
                    nombre: p.nombre,
                    precio: p.precio,
                  })
                }
                disabled={p.stock < 1}
                className="text-white py-2.5 rounded-lg font-medium disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: config.colorMarca }}
              >
                {p.stock < 1 ? "Sin stock" : "Agregar al carrito"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function Carrusel({
  banners,
  colorMarca,
}: {
  banners: Banner[];
  colorMarca: string;
}) {
  const [actual, setActual] = useState(0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => {
      setActual((a) => (a + 1) % banners.length);
    }, 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const b = banners[actual];
  const sinImagen = imgError[b.id];

  return (
    <div className="relative w-full h-48 md:h-56 overflow-hidden">
      {sinImagen ? (
        <div
          className="w-full h-full"
          style={{
            background: `linear-gradient(135deg, ${colorMarca}, ${colorMarca}dd)`,
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={b.imagen}
          alt={b.titulo || "banner"}
          className="w-full h-full object-cover"
          onError={() => setImgError((e) => ({ ...e, [b.id]: true }))}
        />
      )}
      {(b.titulo || b.subtitulo) && (
        <div className="absolute inset-0 bg-black/25 flex flex-col justify-center items-center text-white text-center px-4">
          {b.titulo && (
            <h2 className="text-2xl md:text-4xl font-bold drop-shadow">
              {b.titulo}
            </h2>
          )}
          {b.subtitulo && (
            <p className="mt-2 text-base md:text-lg drop-shadow">
              {b.subtitulo}
            </p>
          )}
        </div>
      )}
      {banners.length > 1 && (
        <>
          <button
            onClick={() =>
              setActual((a) => (a - 1 + banners.length) % banners.length)
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full hover:bg-black/60"
          >
            &lt;
          </button>
          <button
            onClick={() => setActual((a) => (a + 1) % banners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full hover:bg-black/60"
          >
            &gt;
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setActual(i)}
                className={`w-2 h-2 rounded-full ${
                  i === actual ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}