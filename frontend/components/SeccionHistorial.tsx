"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface OrdenItem {
  id: number;
  cantidad: number;
}

interface Orden {
  id: number;
  total: number;
  fecha: string;
  estado: string;
  items: OrdenItem[];
}

const estadoColor: Record<string, string> = {
  nuevo: "bg-blue-100 text-blue-700",
  pagado: "bg-green-100 text-green-700",
  enviado: "bg-purple-100 text-purple-700",
  entregado: "bg-gray-200 text-gray-700",
  cancelado: "bg-red-100 text-red-700",
};

export default function SeccionHistorial() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api<Orden[]>("/orders/mis-ordenes", { auth: true })
      .then(setOrdenes)
      .catch(() => setOrdenes([]))
      .finally(() => setCargando(false));
  }, []);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-800 mb-4">Mis compras</h2>
      {cargando ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : ordenes.length === 0 ? (
        <p className="text-sm text-gray-400">Aun no tienes compras.</p>
      ) : (
        <div className="divide-y">
          {ordenes.map((o) => {
            const totalItems = o.items.reduce((s, i) => s + i.cantidad, 0);
            return (
              <div key={o.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <span className="font-medium text-gray-800">Orden #{o.id}</span>
                  <span className="text-gray-400 ml-2">
                    {new Date(o.fecha).toLocaleDateString("es-CL")}
                  </span>
                  <span className="text-gray-400 ml-2">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${estadoColor[o.estado] || "bg-gray-100 text-gray-600"}`}>
                    {o.estado}
                  </span>
                  <span className="font-medium text-gray-800">
                    ${o.total.toLocaleString("es-CL")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}