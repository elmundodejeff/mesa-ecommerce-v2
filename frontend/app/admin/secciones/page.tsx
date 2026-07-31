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
  const [editId, setEditId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editOrden, setEditOrden] = useState("");

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

  function empezarEdicion(s: Seccion) {
    setEditId(s.id);
    setEditNombre(s.nombre);
    setEditOrden(String(s.orden));
    setError("");
  }

  function cancelarEdicion() {
    setEditId(null);
    setEditNombre("");
    setEditOrden("");
  }

  async function guardarEdicion(id: number) {
    if (!editNombre.trim()) return;
    setError("");
    try {
      await api(`/sections/${id}`, {
        method: "PATCH",
        auth: true,
        body: {
          nombre: editNombre.trim(),
          orden: editOrden ? Number(editOrden) : 0,
        },
      });
      cancelarEdicion();
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
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Secciones</h1>
          <p className="admin-subtitle">Bloques de la home ordenables</p>
        </div>
      </div>

      <form onSubmit={crear} className="admin-card flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="admin-label">Nombre</label>
          <input
            placeholder="Ej: Novedades"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="admin-input"
          />
        </div>
        <div className="w-24">
          <label className="admin-label">Orden</label>
          <input
            placeholder="0"
            type="number"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="admin-input"
          />
        </div>
        <button className="btn-primario shrink-0">Agregar</button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="admin-card p-0 overflow-hidden">
        {items.map((s) => (
          <div key={s.id} className="flex justify-between items-center px-6 py-4 border-b border-gray-50 last:border-0">
            {editId === s.id ? (
              <>
                <div className="flex gap-2 flex-1 mr-3">
                  <input
                    type="number"
                    value={editOrden}
                    onChange={(e) => setEditOrden(e.target.value)}
                    className="admin-input w-20"
                    placeholder="Orden"
                  />
                  <input
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") guardarEdicion(s.id);
                      if (e.key === "Escape") cancelarEdicion();
                    }}
                    autoFocus
                    className="admin-input flex-1"
                  />
                </div>
                <div className="flex gap-4 shrink-0">
                  <button onClick={() => guardarEdicion(s.id)} className="link-accion">Guardar</button>
                  <button onClick={cancelarEdicion} className="text-sm text-gray-500 hover:opacity-70">Cancelar</button>
                </div>
              </>
            ) : (
              <>
                <span className="text-gray-800">
                  <span className="text-gray-400 text-sm mr-2">#{s.orden}</span>
                  {s.nombre}
                  {!s.activa && (
                    <span className="admin-badge ml-2" style={{ background: "#fef3c7", color: "#b45309" }}>inactiva</span>
                  )}
                </span>
                <div className="flex gap-4 shrink-0">
                  <button onClick={() => empezarEdicion(s)} className="link-accion">Editar</button>
                  <button onClick={() => toggleActiva(s)} className="link-accion">
                    {s.activa ? "Desactivar" : "Activar"}
                  </button>
                  <button onClick={() => eliminar(s.id)} className="link-peligro">Eliminar</button>
                </div>
              </>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="px-6 py-4 text-gray-400 text-sm">Sin secciones aún.</p>
        )}
      </div>
    </>
  );
}