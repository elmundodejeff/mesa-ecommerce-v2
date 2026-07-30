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
  const [editId, setEditId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState("");

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

  function empezarEdicion(c: Categoria) {
    setEditId(c.id);
    setEditNombre(c.nombre);
    setError("");
  }

  function cancelarEdicion() {
    setEditId(null);
    setEditNombre("");
  }

  async function guardarEdicion(id: number) {
    if (!editNombre.trim()) return;
    setError("");
    try {
      await api(`/categories/${id}`, {
        method: "PATCH",
        auth: true,
        body: { nombre: editNombre.trim() },
      });
      cancelarEdicion();
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
        <button className="text-white px-6 py-2 btn-pill bg-marca">
          Agregar
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      <div className="bg-white rounded-lg shadow divide-y">
        {items.map((c) => (
          <div key={c.id} className="flex justify-between items-center p-4">
            {editId === c.id ? (
              <>
                <input
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") guardarEdicion(c.id);
                    if (e.key === "Escape") cancelarEdicion();
                  }}
                  autoFocus
                  className="flex-1 border rounded px-3 py-1.5 mr-3"
                />
                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() => guardarEdicion(c.id)}
                    className="text-marca hover:underline"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={cancelarEdicion}
                    className="text-gray-500 hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="text-gray-800">
                  {c.nombre}
                  {c._count && (
                    <span className="text-gray-400 text-sm ml-2">
                      ({c._count.productos} productos)
                    </span>
                  )}
                </span>
                <div className="flex gap-4 text-sm">
                  <button
                    onClick={() => empezarEdicion(c)}
                    className="text-marca hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminar(c.id)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="p-4 text-gray-400">Sin categorias aun.</p>
        )}
      </div>
    </div>
  );
}