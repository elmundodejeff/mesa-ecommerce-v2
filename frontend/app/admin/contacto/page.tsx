"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Mensaje {
  id: number;
  nombre: string;
  email: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
}

export default function AdminContacto() {
  const [items, setItems] = useState<Mensaje[]>([]);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setItems(await api<Mensaje[]>("/contact", { auth: true }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function marcarLeido(id: number) {
    try {
      await api(`/contact/${id}/leido`, { method: "PATCH", auth: true });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function eliminar(id: number) {
    if (!confirm("Eliminar mensaje?")) return;
    try {
      await api(`/contact/${id}`, { method: "DELETE", auth: true });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  const sinLeer = items.filter((m) => !m.leido).length;

  return (
    <div className="max-w-3xl space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Mensajes de contacto
        {sinLeer > 0 && (
          <span className="ml-2 text-sm bg-red-500 text-white px-2 py-0.5 rounded-full">
            {sinLeer} sin leer
          </span>
        )}
      </h2>
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-3">
        {items.map((m) => (
          <div
            key={m.id}
            className={`bg-white rounded-lg shadow p-4 ${
              m.leido ? "opacity-60" : "border-l-4 border-emerald-500"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-800">
                  {m.nombre}{" "}
                  <span className="text-gray-400 text-sm font-normal">
                    &lt;{m.email}&gt;
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(m.fecha).toLocaleString("es-CL")}
                </p>
              </div>
              <div className="flex gap-3 text-sm shrink-0">
                {!m.leido && (
                  <button
                    onClick={() => marcarLeido(m.id)}
                    className="text-emerald-700 hover:underline"
                  >
                    Marcar leido
                  </button>
                )}
                <button
                  onClick={() => eliminar(m.id)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
            <p className="text-gray-700 mt-2 whitespace-pre-wrap">
              {m.mensaje}
            </p>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-gray-400">Sin mensajes.</p>
        )}
      </div>
    </div>
  );
}