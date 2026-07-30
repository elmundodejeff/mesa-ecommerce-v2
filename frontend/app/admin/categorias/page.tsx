"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Categoria {
  id: number;
  nombre: string;
  _count?: { productos: number };
}

export default function AdminCategorias() {
  const [items, setItems] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setItems(await api<Categoria[]>("/categories"));
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
      await api("/categories", { method: "POST", auth: true, body: { nombre } });
      setNombre("");
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function eliminar(id: number) {
    if (!confirm("Eliminar categoria?")) return;
    try {
      await api(`/categories/${id}`, { method: "DELETE", auth: true });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Categorias</h2>

      <form onSubmit={crear} className="bg-white rounded-lg shadow p-6 flex gap-3">
        <input
          placeholder="Nombre de la categoria"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="flex-1 border rounded px-3 py-2"
        />
        <button className="bg-emerald-700 text-white px-6 py-2 rounded hover:bg-emerald-800">
          Agregar
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      <div className="bg-white rounded-lg shadow divide-y">
        {items.map((c) => (
          <div key={c.id} className="flex justify-between items-center p-4">
            <span className="text-gray-800">
              {c.nombre}
              {c._count && (
                <span className="text-gray-400 text-sm ml-2">
                  ({c._count.productos} productos)
                </span>
              )}
            </span>
            <button
              onClick={() => eliminar(c.id)}
              className="text-red-600 hover:underline text-sm"
            >
              Eliminar
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="p-4 text-gray-400">Sin categorias aun.</p>
        )}
      </div>
    </div>
  );
}