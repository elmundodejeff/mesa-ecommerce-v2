"use client";

import { useEffect, useState } from "react";
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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Ordenes ({ordenes.length})
      </h2>
      {error && <p className="text-red-600">{error}</p>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Total</th>
              <th className="p-3">Estado</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((o) => (
              <>
                <tr key={o.id} className="border-b text-gray-800">
                  <td className="p-3 font-medium">{o.id}</td>
                  <td className="p-3">
                    {new Date(o.fecha).toLocaleDateString("es-CL")}
                  </td>
                  <td className="p-3">{o.nombreEnvio || "Invitado"}</td>
                  <td className="p-3">
                    ${o.total.toLocaleString("es-CL")}
                  </td>
                  <td className="p-3">
                    <select
                      value={o.estado}
                      onChange={(e) => cambiarEstado(o.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      {ESTADOS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() =>
                        setAbierta(abierta === o.id ? null : o.id)
                      }
                      className="text-emerald-700 hover:underline"
                    >
                      {abierta === o.id ? "Ocultar" : "Ver items"}
                    </button>
                  </td>
                </tr>
                {abierta === o.id && (
                  <tr key={`${o.id}-detalle`} className="bg-gray-50">
                    <td colSpan={6} className="p-3">
                      <ul className="text-gray-700 space-y-1">
                        {o.items.map((it) => (
                          <li key={it.id}>
                            {it.cantidad} x {it.nombre} - $
                            {it.precio.toLocaleString("es-CL")}
                          </li>
                        ))}
                        {o.descuentoMonto > 0 && (
                          <li className="text-emerald-700">
                            Descuento ({o.descuentoCodigo}): -$
                            {o.descuentoMonto.toLocaleString("es-CL")}
                          </li>
                        )}
                      </ul>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}