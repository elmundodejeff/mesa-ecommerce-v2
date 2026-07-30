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
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Menu</h2>

      <form onSubmit={crear} className="bg-white rounded-lg shadow p-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Texto"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="Enlace (ej /juegos)"
            value={enlace}
            onChange={(e) => setEnlace(e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="Orden"
            type="number"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <select
            value={padreId}
            onChange={(e) => setPadreId(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">Item raiz (sin padre)</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                Submenu de: {i.texto}
              </option>
            ))}
          </select>
        </div>
        <button className="bg-emerald-700 text-white px-6 py-2 rounded hover:bg-emerald-800">
          Agregar item
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      <div className="bg-white rounded-lg shadow divide-y">
        {items.map((item) => (
          <div key={item.id} className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-800">
                {item.texto}
                <span className="text-gray-400 text-sm ml-2">
                  {item.enlace}
                </span>
              </span>
              <button
                onClick={() => eliminar(item.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Eliminar
              </button>
            </div>
            {item.hijos.length > 0 && (
              <div className="mt-2 ml-4 space-y-1">
                {item.hijos.map((h) => (
                  <div
                    key={h.id}
                    className="flex justify-between items-center text-sm text-gray-600"
                  >
                    <span>
                      &#8627; {h.texto}
                      <span className="text-gray-400 ml-2">{h.enlace}</span>
                    </span>
                    <button
                      onClick={() => eliminar(h.id)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="p-4 text-gray-400">Sin items aun.</p>
        )}
      </div>
    </div>
  );
}