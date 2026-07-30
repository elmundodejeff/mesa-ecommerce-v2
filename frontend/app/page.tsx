"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCarrito } from "@/lib/carrito";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  descripcion: string | null;
}

export default function Tienda() {
  const { agregar, cantidadTotal } = useCarrito();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Producto[]>("/products")
      .then(setProductos)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Error al cargar"),
      );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-900 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-xl">Mesa</h1>
        <Link
          href="/checkout"
          className="bg-emerald-700 px-4 py-2 rounded hover:bg-emerald-600"
        >
          Carrito ({cantidadTotal})
        </Link>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productos.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-lg shadow p-5 flex flex-col"
            >
              <h2 className="font-semibold text-lg text-gray-900">{p.nombre}</h2>
              <p className="text-gray-500 text-sm flex-1 mt-1">
                {p.descripcion || "Sin descripcion"}
              </p>
              <p className="text-emerald-700 font-bold text-xl mt-3">
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
                className="bg-emerald-700 text-white py-2 rounded hover:bg-emerald-800 disabled:opacity-40"
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