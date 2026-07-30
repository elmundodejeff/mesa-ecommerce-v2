"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Banner {
  id: number;
  imagen: string;
  titulo: string | null;
  subtitulo: string | null;
  enlace: string | null;
  orden: number;
}

export default function AdminBanners() {
  const [items, setItems] = useState<Banner[]>([]);
  const [imagen, setImagen] = useState("");
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [enlace, setEnlace] = useState("");
  const [orden, setOrden] = useState("");
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setItems(await api<Banner[]>("/content/banners"));
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
      await api("/content/banners", {
        method: "POST",
        auth: true,
        body: {
          imagen,
          titulo: titulo || undefined,
          subtitulo: subtitulo || undefined,
          enlace: enlace || undefined,
          orden: orden ? Number(orden) : undefined,
        },
      });
      setImagen("");
      setTitulo("");
      setSubtitulo("");
      setEnlace("");
      setOrden("");
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function eliminar(id: number) {
    if (!confirm("Eliminar banner?")) return;
    try {
      await api(`/content/banners/${id}`, { method: "DELETE", auth: true });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Banners</h2>

      <form onSubmit={crear} className="bg-white rounded-lg shadow p-6 space-y-3">
        <input
          placeholder="URL de la imagen"
          value={imagen}
          onChange={(e) => setImagen(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Titulo (opcional)"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="Subtitulo (opcional)"
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="Enlace (opcional)"
            value={enlace}
            onChange={(e) => setEnlace(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="Orden"
            type="number"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        <button className="bg-emerald-700 text-white px-6 py-2 rounded hover:bg-emerald-800">
          Agregar banner
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((b) => (
          <div key={b.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-32 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.imagen}
                alt={b.titulo || "banner"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="p-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">
                  {b.titulo || "(sin titulo)"}
                </p>
                <p className="text-xs text-gray-400">Orden: {b.orden}</p>
              </div>
              <button
                onClick={() => eliminar(b.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-gray-400">Sin banners aun.</p>
        )}
      </div>
    </div>
  );
}