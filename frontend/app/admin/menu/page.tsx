"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface MenuHijo {
  id: number;
  texto: string;
  enlace: string;
}

interface MenuItem {
  id: number;
  texto: string;
  enlace: string;
  orden: number;
  hijos: MenuHijo[];
}

export default function AdminMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [texto, setTexto] = useState("");
  const [enlace, setEnlace] = useState("");
  const [orden, setOrden] = useState("");
  const [padreId, setPadreId] = useState("");
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setItems(await api<MenuItem[]>("/content/menu"));
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
      await api("/content/menu", {
        method: "POST",
        auth: true,
        body: {
          texto,
          enlace,
          orden: orden ? Number(orden) : undefined,
          padreId: padreId ? Number(padreId) : undefined,
        },
      });
      setTexto("");
      setEnlace("");
      setOrden("");
      setPadreId("");
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function eliminar(id: number) {
    if (!confirm("Eliminar item? (elimina tambien sus submenus)")) return;
    try {
      await api(`/content/menu/${id}`, { method: "DELETE", auth: true });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Menú</h1>
          <p className="admin-subtitle">Navegación del sitio con submenús</p>
        </div>
      </div>

      <form onSubmit={crear} className="admin-card space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="admin-label">Texto</label>
            <input placeholder="Ej: Tienda" value={texto} onChange={(e) => setTexto(e.target.value)} required className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Enlace</label>
            <input placeholder="/tienda" value={enlace} onChange={(e) => setEnlace(e.target.value)} required className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Orden</label>
            <input placeholder="0" type="number" value={orden} onChange={(e) => setOrden(e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Ubicación</label>
            <select value={padreId} onChange={(e) => setPadreId(e.target.value)} className="admin-input">
              <option value="">Item raíz (sin padre)</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>Submenú de: {i.texto}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn-primario">Agregar item</button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="admin-card p-0 overflow-hidden">
        {items.map((item) => (
          <div key={item.id} className="px-6 py-4 border-b border-gray-50 last:border-0">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-800">
                {item.texto}
                <span className="text-gray-400 text-sm ml-2 font-normal">{item.enlace}</span>
              </span>
              <button onClick={() => eliminar(item.id)} className="link-peligro">Eliminar</button>
            </div>
            {item.hijos.length > 0 && (
              <div className="mt-2 ml-4 space-y-1">
                {item.hijos.map((h) => (
                  <div key={h.id} className="flex justify-between items-center text-sm text-gray-600">
                    <span>
                      &#8627; {h.texto}
                      <span className="text-gray-400 ml-2">{h.enlace}</span>
                    </span>
                    <button onClick={() => eliminar(h.id)} className="link-peligro">Eliminar</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="px-6 py-4 text-gray-400 text-sm">Sin items aún.</p>
        )}
      </div>
    </>
  );
}