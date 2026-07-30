"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Seccion {
  id: number;
  nombre: string;
  orden: number;
  activa: boolean;
  _count?: { productos: number };
}

export default function AdminSecciones() {
  const [items, setItems] = useState<Seccion[]>([]);
  const [nombre, setNombre] = useState("");
  const [orden, setOrden] = useState("");
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setItems(await api<Seccion[]>("/sections"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/sections", {
        method: "POST",
        auth: true,
        body: { nombre, orden: orden ? Number(orden) : undefined },
      });
      setNombre("");
      setOrden("");
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function toggleActiva(s: Seccion) {
    try {
      await api(`/sections/${s.id}`, {
        method: "PATCH",
        auth: true,
        body: { activa: !s.activa },
      });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function eliminar(id: number) {
    if (!confirm("Eliminar seccion?")) return;
    try {
      await api(`/sections/${id}`, { method: "DELETE", auth: true });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Secciones</h2>

      <form onSubmit={crear} className="bg-white rounded-lg shadow p-6 flex gap-3">
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="flex-1 border rounded px-3 py-2"
        />
        <input
          placeholder="Orden"
          type="number"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          className="w-24 border rounded px-3 py-2"
        />
        <button className="bg-emerald-700 text-white px-6 py-2 rounded hover:bg-emerald-800">
          Agregar
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      <div className="bg-white rounded-lg shadow divide-y">
        {items.map((s) => (
          <div key={s.id} className="flex justify-between items-center p-4">
            <span className="text-gray-800">
              <span className="text-gray-400 text-sm mr-2">#{s.orden}</span>
              {s.nombre}
              {!s.activa && (
                <span className="text-amber-600 text-sm ml-2">(inactiva)</span>
              )}
            </span>
            <div className="flex gap-4 text-sm">
              <button
                onClick={() => toggleActiva(s)}
                className="text-emerald-700 hover:underline"
              >
                {s.activa ? "Desactivar" : "Activar"}
              </button>
              <button
                onClick={() => eliminar(s.id)}
                className="text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="p-4 text-gray-400">Sin secciones aun.</p>
        )}
      </div>
    </div>
  );
}