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
  descuentoMonto: number;
  descuentoCodigo: string | null;
  items: OrdenItem[];
}

const ESTADOS = [
  "nuevo",
  "pagado",
  "preparando",
  "enviado",
  "entregado",
  "cancelado",
];

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

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Órdenes</h1>
          <p className="admin-subtitle">Pedidos y su estado</p>
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
              {ordenes.map((o) => (
                <Fragment key={o.id}>
                  <tr>
                    <td className="pl-6 font-medium text-gray-800">{o.id}</td>
                    <td>{new Date(o.fecha).toLocaleDateString("es-CL")}</td>
                    <td>{o.nombreEnvio || "Invitado"}</td>
                    <td>${o.total.toLocaleString("es-CL")}</td>
                    <td>
                      <select
                        value={o.estado}
                        onChange={(e) => cambiarEstado(o.id, e.target.value)}
                        className="admin-input py-1.5 w-auto"
                      >
                        {ESTADOS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="text-right pr-6">
                      <button
                        onClick={() => setAbierta(abierta === o.id ? null : o.id)}
                        className="link-accion"
                      >
                        {abierta === o.id ? "Ocultar" : "Ver items"}
                      </button>
                    </td>
                  </tr>
                  {abierta === o.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-6 py-3">
                        <ul className="text-sm text-gray-700 space-y-1">
                          {o.items.map((it) => (
                            <li key={it.id}>
                              {it.cantidad} x {it.nombre} - ${it.precio.toLocaleString("es-CL")}
                            </li>
                          ))}
                          {o.descuentoMonto > 0 && (
                            <li className="text-marca font-medium">
                              Descuento ({o.descuentoCodigo}): -${o.descuentoMonto.toLocaleString("es-CL")}
                            </li>
                          )}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}