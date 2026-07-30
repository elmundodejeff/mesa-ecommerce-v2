"use client";

import Link from "next/link";
import { useCarrito } from "@/lib/carrito";
import type { Config } from "@/lib/config";

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
}: {
  config: Config;
  productos: Producto[];
}) {
  const { agregar, cantidadTotal } = useCarrito();

  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="px-6 py-4 flex justify-between items-center"
        style={{
          backgroundColor: config.colorHeader,
          color: config.colorHeaderTexto,
        }}
      >
        <h1 className="font-bold text-xl">{config.nombreSitio}</h1>
        <Link
          href="/checkout"
          className="px-4 py-2 rounded"
          style={{ backgroundColor: config.colorMarca, color: "#fff" }}
        >
          Carrito ({cantidadTotal})
        </Link>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productos.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-lg shadow p-5 flex flex-col"
            >
              <h2 className="font-semibold text-lg text-gray-900">
                {p.nombre}
              </h2>
              <p className="text-gray-500 text-sm flex-1 mt-1">
                {p.descripcion || "Sin descripcion"}
              </p>
              <p
                className="font-bold text-xl mt-3"
                style={{ color: config.colorMarca }}
              >
                ${p.precio.toLocaleString("es-CL")}
              </p>
              <p className="text-xs text-gray-400 mb-3">Stock: {p.stock}</p>
              <button
                onClick={() =>
                  agregar({
                    productoId: p.id,
                    nombre: p.nombre,
                    precio: p.precio,
                  })
                }
                disabled={p.stock < 1}
                className="text-white py-2 rounded disabled:opacity-40"
                style={{ backgroundColor: config.colorMarca }}
              >
                {p.stock < 1 ? "Sin stock" : "Agregar"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}