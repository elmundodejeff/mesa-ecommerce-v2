"use client";

import Link from "next/link";
import { useCarrito } from "@/lib/carrito";

export default function CarritoLateral({ colorMarca }: { colorMarca: string }) {
  const { items, cambiarCantidad, quitar, total } = useCarrito();

  return (
    <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Tu carrito</h2>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">
          Tu carrito esta vacio.
        </p>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {items.map((i) => (
              <div key={i.productoId} className="flex items-center gap-2 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{i.nombre}</p>
                  <p className="text-xs text-gray-400">
                    ${i.precio.toLocaleString("es-CL")} c/u
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      i.cantidad <= 1
                        ? quitar(i.productoId)
                        : cambiarCantidad(i.productoId, i.cantidad - 1)
                    }
                    className="w-6 h-6 rounded-full border text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                    aria-label="Restar"
                  >
                    &minus;
                  </button>
                  <span className="w-6 text-center">{i.cantidad}</span>
                  <button
                    onClick={() => cambiarCantidad(i.productoId, i.cantidad + 1)}
                    className="w-6 h-6 rounded-full border text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                    aria-label="Sumar"
                  >
                    +
                  </button>
                </div>
                <span className="w-20 text-right font-medium text-gray-800">
                  ${(i.precio * i.cantidad).toLocaleString("es-CL")}
                </span>
                <button
                  onClick={() => quitar(i.productoId)}
                  className="text-gray-300 hover:text-red-500 ml-1"
                  aria-label="Quitar"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>${total.toLocaleString("es-CL")}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900">
              <span>Total</span>
              <span>${total.toLocaleString("es-CL")}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="block text-center text-white py-3 mt-4 font-medium btn-pill"
            style={{ backgroundColor: colorMarca }}
          >
            Continuar al envio
          </Link>
          <p className="text-xs text-gray-400 text-center mt-2">
            Codigo de descuento y puntos se aplican en el siguiente paso.
          </p>
        </>
      )}
    </aside>
  );
}