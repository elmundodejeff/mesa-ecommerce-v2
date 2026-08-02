"use client";

import { useEffect, useState, Fragment } from "react";
import { api } from "@/lib/api";

interface OrdenItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface Orden {
  id: number;
  total: number;
  estado: string;
  fecha: string;
  nombreEnvio: string | null;
  direccionEnvio: string | null;
  ciudadEnvio: string | null;
  regionEnvio: string | null;
  telefonoEnvio: string | null;
  notaEntrega: string | null;
  descuentoMonto: number;
  descuentoCodigo: string | null;
  puntosUsados: number;
  fechaEnvio: string | null;
  fechaEntrega: string | null;
  fechaCancelacion: string | null;
  items: OrdenItem[];
}

const ESTADOS = ["nuevo", "pagado", "preparando", "enviado", "entregado", "cancelado"];

export default function AdminOrdenes() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [error, setError] = useState("");
  const [abierta, setAbierta] = useState<number | null>(null);

  async function cargar() {
    try {
      const data = await api<Orden[]>("/orders", { auth: true });
      setOrdenes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cambiarEstado(id: number, estado: string) {
    try {
      await api(`/orders/${id}/estado`, {
        method: "PATCH",
        auth: true,
        body: { estado },
      });
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    }
  }

  const fmt = (n: number) => `$${n.toLocaleString("es-CL")}`;
  const fmtFecha = (f: string) => new Date(f).toLocaleString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Órdenes</h1>
          <p className="admin-subtitle">Pedidos, estado y detalle</p>
        </div>
        <span className="admin-badge">{ordenes.length}</span>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-tabla">
            <thead>
              <tr>
                <th className="pl-6">#</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => {
                const subtotal = o.items.reduce((a, it) => a + it.precio * it.cantidad, 0);
                return (
                  <Fragment key={o.id}>
                    <tr>
                      <td className="pl-6 font-medium text-gray-800">{o.id}</td>
                      <td>{new Date(o.fecha).toLocaleDateString("es-CL")}</td>
                      <td>{o.nombreEnvio || "Invitado"}</td>
                      <td>{fmt(o.total)}</td>
                      <td>
                        <select
                          value={o.estado}
                          onChange={(e) => cambiarEstado(o.id, e.target.value)}
                          className="admin-input py-1.5 w-auto"
                        >
                          {ESTADOS.map((s) => (<option key={s} value={s}>{s}</option>))}
                        </select>
                      </td>
                      <td className="text-right pr-6">
                        <button
                          onClick={() => setAbierta(abierta === o.id ? null : o.id)}
                          className="link-accion"
                        >
                          {abierta === o.id ? "Ocultar" : "Ver detalle"}
                        </button>
                      </td>
                    </tr>
                    {abierta === o.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Items + desglose */}
                            <div className="md:col-span-2">
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Productos</p>
                              <ul className="text-sm text-gray-700 space-y-1 mb-3">
                                {o.items.map((it) => (
                                  <li key={it.id} className="flex justify-between">
                                    <span>{it.cantidad} × {it.nombre}</span>
                                    <span>{fmt(it.precio * it.cantidad)}</span>
                                  </li>
                                ))}
                              </ul>
                              <div className="border-t border-gray-200 pt-2 space-y-1 text-sm">
                                <div className="flex justify-between text-gray-500">
                                  <span>Subtotal</span><span>{fmt(subtotal)}</span>
                                </div>
                                {o.descuentoMonto > 0 && (
                                  <div className="flex justify-between" style={{ color: "var(--color-marca)" }}>
                                    <span>Descuento{o.descuentoCodigo ? ` (${o.descuentoCodigo})` : ""}</span>
                                    <span>-{fmt(o.descuentoMonto)}</span>
                                  </div>
                                )}
                                {o.puntosUsados > 0 && (
                                  <div className="flex justify-between" style={{ color: "var(--color-marca)" }}>
                                    <span>Puntos canjeados</span>
                                    <span>-{fmt(o.puntosUsados)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold text-gray-900 pt-1">
                                  <span>Total</span><span>{fmt(o.total)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Envio + timeline */}
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Envío</p>
                                {o.direccionEnvio || o.ciudadEnvio ? (
                                  <div className="text-sm text-gray-700 space-y-0.5">
                                    {o.nombreEnvio && <p className="font-medium">{o.nombreEnvio}</p>}
                                    {o.direccionEnvio && <p>{o.direccionEnvio}</p>}
                                    <p>{[o.ciudadEnvio, o.regionEnvio].filter(Boolean).join(", ")}</p>
                                    {o.telefonoEnvio && <p className="text-gray-500">{o.telefonoEnvio}</p>}
                                    {o.notaEntrega && <p className="text-gray-500 italic mt-1">&quot;{o.notaEntrega}&quot;</p>}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-400">Sin datos de envío.</p>
                                )}
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Seguimiento</p>
                                <ul className="text-sm space-y-1.5">
                                  <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-marca)" }} />
                                    <span className="text-gray-500">Compra:</span>
                                    <span className="text-gray-700">{fmtFecha(o.fecha)}</span>
                                  </li>
                                  {o.fechaEnvio && (
                                    <li className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-marca)" }} />
                                      <span className="text-gray-500">Envío:</span>
                                      <span className="text-gray-700">{fmtFecha(o.fechaEnvio)}</span>
                                    </li>
                                  )}
                                  {o.fechaEntrega && (
                                    <li className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-marca)" }} />
                                      <span className="text-gray-500">Entrega:</span>
                                      <span className="text-gray-700">{fmtFecha(o.fechaEntrega)}</span>
                                    </li>
                                  )}
                                  {o.fechaCancelacion && (
                                    <li className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                      <span className="text-gray-500">Cancelación:</span>
                                      <span className="text-red-600">{fmtFecha(o.fechaCancelacion)}</span>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}