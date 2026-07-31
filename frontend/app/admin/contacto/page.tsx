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
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Mensajes de contacto</h1>
          <p className="admin-subtitle">Bandeja de entrada del formulario</p>
        </div>
        {sinLeer > 0 && (
          <span className="admin-badge" style={{ background: "#fee2e2", color: "#dc2626" }}>
            {sinLeer} sin leer
          </span>
        )}
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="space-y-3">
        {items.map((m) => (
          <div
            key={m.id}
            className={`admin-card ${m.leido ? "opacity-60" : ""}`}
            style={!m.leido ? { borderLeft: "3px solid var(--color-marca)" } : {}}
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
              <div className="flex gap-4 shrink-0">
                {!m.leido && (
                  <button onClick={() => marcarLeido(m.id)} className="link-accion">
                    Marcar leído
                  </button>
                )}
                <button onClick={() => eliminar(m.id)} className="link-peligro">Eliminar</button>
              </div>
            </div>
            <p className="text-gray-700 mt-2 whitespace-pre-wrap">{m.mensaje}</p>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-gray-400 text-sm">Sin mensajes.</p>
        )}
      </div>
    </>
  );
}