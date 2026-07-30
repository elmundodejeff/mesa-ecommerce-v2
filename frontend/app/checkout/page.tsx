"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCarrito } from "@/lib/carrito";

interface OrdenResp {
  id: number;
  total: number;
  subtotal: number;
  descuentoMonto: number;
  descuentoCodigo: string | null;
  avisoDescuento: string | null;
}

export default function Checkout() {
  const { items, cambiarCantidad, quitar, vaciar, total } = useCarrito();
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [orden, setOrden] = useState<OrdenResp | null>(null);

  async function pagar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const resp = await api<OrdenResp>("/orders/checkout", {
        method: "POST",
        body: {
          items: items.map((i) => ({
            productoId: i.productoId,
            cantidad: i.cantidad,
          })),
          nombreEnvio: nombre || undefined,
          direccionEnvio: direccion || undefined,
          ciudadEnvio: ciudad || undefined,
          codigo: codigo || undefined,
        },
      });
      setOrden(resp);
      vaciar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar");
    } finally {
      setCargando(false);
    }
  }

  // Pantalla de confirmacion
  if (orden) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-8 text-center">
          <h1 className="text-2xl font-bold text-emerald-700 mb-2">
            Orden #{orden.id} confirmada
          </h1>
          <div className="text-left mt-6 space-y-1 text-gray-800">
            <p>Subtotal: ${orden.subtotal.toLocaleString("es-CL")}</p>
            {orden.descuentoMonto > 0 && (
              <p className="text-emerald-700">
                Descuento ({orden.descuentoCodigo}): -$
                {orden.descuentoMonto.toLocaleString("es-CL")}
              </p>
            )}
            <p className="font-bold text-lg border-t pt-2">
              Total: ${orden.total.toLocaleString("es-CL")}
            </p>
            {orden.avisoDescuento && (
              <p className="text-amber-600 text-sm mt-2">
                Aviso: {orden.avisoDescuento}
              </p>
            )}
          </div>
          <Link
            href="/"
            className="inline-block mt-6 bg-emerald-700 text-white px-6 py-2 rounded hover:bg-emerald-800"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-emerald-700 hover:underline text-sm">
          &larr; Seguir comprando
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 my-4">Checkout</h1>

        {items.length === 0 ? (
          <p className="text-gray-500">Tu carrito esta vacio.</p>
        ) : (
          <form onSubmit={pagar} className="space-y-6">
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold mb-4 text-gray-900">Tu carrito</h2>
              {items.map((i) => (
                <div
                  key={i.productoId}
                  className="flex items-center justify-between border-b py-2 text-gray-800"
                >
                  <span className="flex-1">{i.nombre}</span>
                  <input
                    type="number"
                    min={1}
                    value={i.cantidad}
                    onChange={(e) =>
                      cambiarCantidad(i.productoId, Number(e.target.value))
                    }
                    className="w-16 border rounded px-2 py-1 mx-3"
                  />
                  <span className="w-24 text-right">
                    ${(i.precio * i.cantidad).toLocaleString("es-CL")}
                  </span>
                  <button
                    type="button"
                    onClick={() => quitar(i.productoId)}
                    className="text-red-600 ml-3 hover:underline"
                  >
                    x
                  </button>
                </div>
              ))}
              <p className="text-right font-bold text-lg mt-3 text-gray-900">
                Total: ${total.toLocaleString("es-CL")}
              </p>
            </section>

            <section className="bg-white rounded-lg shadow p-6 space-y-3">
              <h2 className="font-semibold text-gray-900">Datos de envio</h2>
              <input
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <input
                placeholder="Direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <input
                placeholder="Ciudad"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <input
                placeholder="Codigo de descuento (opcional)"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                className="w-full border rounded px-3 py-2"
              />
            </section>

            {error && <p className="text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-emerald-700 text-white py-3 rounded hover:bg-emerald-800 disabled:opacity-50"
            >
              {cargando ? "Procesando..." : "Pagar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}