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
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Categorías</h1>
          <p className="admin-subtitle">Organiza los productos por categoría</p>
        </div>
      </div>

      <form onSubmit={crear} className="admin-card flex gap-3">
        <input
          placeholder="Nombre de la categoría"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="admin-input flex-1"
        />
        <button className="btn-primario shrink-0">Agregar</button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="admin-card p-0 overflow-hidden">
        {items.map((c) => (
          <div key={c.id} className="flex justify-between items-center px-6 py-4 border-b border-gray-50 last:border-0">
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
                  className="admin-input flex-1 mr-3"
                />
                <div className="flex gap-4 shrink-0">
                  <button onClick={() => guardarEdicion(c.id)} className="link-accion">Guardar</button>
                  <button onClick={cancelarEdicion} className="text-sm text-gray-500 hover:opacity-70">Cancelar</button>
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
                <div className="flex gap-4 shrink-0">
                  <button onClick={() => empezarEdicion(c)} className="link-accion">Editar</button>
                  <button onClick={() => eliminar(c.id)} className="link-peligro">Eliminar</button>
                </div>
              </>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="px-6 py-4 text-gray-400 text-sm">Sin categorías aún.</p>
        )}
      </div>
    </>
  );
}