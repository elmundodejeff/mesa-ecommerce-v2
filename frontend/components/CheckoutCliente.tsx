"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { obtenerToken } from "@/lib/auth";
import { useCarrito } from "@/lib/carrito";

interface OrdenResp {
  id: number;
  total: number;
  subtotal: number;
  descuentoMonto: number;
  descuentoCodigo: string | null;
  puntosUsados: number;
  puntosGanados: number;
  avisoDescuento: string | null;
  avisoPuntos: string | null;
}

interface LoyaltyResp {
  saldo: number;
}

export default function CheckoutCliente() {
  const { items, cambiarCantidad, quitar, vaciar, total } = useCarrito();
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [codigo, setCodigo] = useState("");

  // Pre-cargar codigo de descuento aplicado en el carrito lateral
  useEffect(() => {
    const guardado = localStorage.getItem("mesa_descuento");
    if (guardado) {
      try {
        const d = JSON.parse(guardado);
        if (d.codigo) setCodigo(d.codigo);
      } catch {
        // ignore
      }
    }
  }, []);
  const [puntosAUsar, setPuntosAUsar] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [orden, setOrden] = useState<OrdenResp | null>(null);

  const [logueado, setLogueado] = useState(false);
  const [saldoPuntos, setSaldoPuntos] = useState<number | null>(null);

  useEffect(() => {
    const token = obtenerToken();
    if (token) {
      setLogueado(true);
      api<LoyaltyResp>("/loyalty/me", { auth: true })
        .then((r) => setSaldoPuntos(r.saldo))
        .catch(() => setSaldoPuntos(null));
    }
  }, []);

  async function pagar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const resp = await api<OrdenResp>("/orders/checkout", {
        method: "POST",
        auth: true, // manda token si hay sesion, no falla si es invitado
        body: {
          items: items.map((i) => ({
            productoId: i.productoId,
            cantidad: i.cantidad,
          })),
          nombreEnvio: nombre || undefined,
          direccionEnvio: direccion || undefined,
          ciudadEnvio: ciudad || undefined,
          codigo: codigo || undefined,
          puntosAUsar: puntosAUsar ? Number(puntosAUsar) : undefined,
        },
      });
      setOrden(resp);
      vaciar();
      localStorage.removeItem("mesa_descuento");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar");
    } finally {
      setCargando(false);
    }
  }

  if (orden) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-8 text-center">
          <h1 className="text-2xl font-bold text-marca mb-2">
            Orden #{orden.id} confirmada
          </h1>
          <div className="text-left mt-6 space-y-1 text-gray-800">
            <p>Subtotal: ${orden.subtotal.toLocaleString("es-CL")}</p>
            {orden.descuentoMonto > 0 && (
              <p className="text-marca">
                Descuento ({orden.descuentoCodigo}): -$
                {orden.descuentoMonto.toLocaleString("es-CL")}
              </p>
            )}
            {orden.puntosUsados > 0 && (
              <p className="text-marca">
                Puntos canjeados: -$
                {orden.puntosUsados.toLocaleString("es-CL")}
              </p>
            )}
            <p className="font-bold text-lg border-t pt-2">
              Total: ${orden.total.toLocaleString("es-CL")}
            </p>
            {orden.puntosGanados > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Ganaste {orden.puntosGanados.toLocaleString("es-CL")} puntos
                con esta compra.
              </p>
            )}
            {orden.avisoDescuento && (
              <p className="text-amber-600 text-sm mt-2">
                Descuento: {orden.avisoDescuento}
              </p>
            )}
            {orden.avisoPuntos && (
              <p className="text-amber-600 text-sm">
                Puntos: {orden.avisoPuntos}
              </p>
            )}
          </div>
          <Link
            href="/"
            className="inline-block mt-6 text-white px-6 py-2 btn-pill bg-marca"
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
        <Link href="/" className="text-marca hover:underline text-sm">
          &larr; Seguir comprando
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 my-4">Checkout</h1>

        {!logueado && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm text-blue-800">
            Compras como invitado.{" "}
            <Link href="/login" className="underline font-medium">
              Inicia sesion
            </Link>{" "}
            para ganar y usar puntos.
          </div>
        )}

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
            </section>

            <section className="bg-white rounded-lg shadow p-6 space-y-3">
              <h2 className="font-semibold text-gray-900">
                Descuentos y puntos
              </h2>
              <input
                placeholder="Codigo de descuento (opcional)"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                className="w-full border rounded px-3 py-2"
              />
              {logueado && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Canjear puntos
                    {saldoPuntos !== null && (
                      <span className="text-gray-400">
                        {" "}
                        (saldo: {saldoPuntos.toLocaleString("es-CL")})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={saldoPuntos ?? undefined}
                    placeholder="0"
                    value={puntosAUsar}
                    onChange={(e) => setPuntosAUsar(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    1 punto = $1 de descuento
                  </p>
                </div>
              )}
            </section>

            {error && <p className="text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={cargando}
              className="w-full text-white py-3 btn-pill bg-marca"
            >
              {cargando ? "Procesando..." : "Pagar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}