"use client";

import { useEffect, useState } from "react";
import { api, apiUpload } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
  const [subiendo, setSubiendo] = useState(false);
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

  async function subirImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append("imagen", f);
      const res = await apiUpload<{ url: string }>("/content/upload", fd);
      setImagen(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!imagen) { setError("Sube o ingresa una imagen"); return; }
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

  const previewImg = imagen
    ? (imagen.startsWith("http") ? imagen : `${API_BASE}${imagen}`)
    : "";

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Banners</h1>
          <p className="admin-subtitle">Carrusel principal de la home</p>
        </div>
      </div>

      <form onSubmit={crear} className="admin-card space-y-3">
        <div>
          <label className="admin-label">Imagen</label>
          <div className="flex items-center gap-4 mb-2">
            {previewImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewImg} alt="" className="h-20 w-36 object-cover rounded border" />
            ) : (
              <div className="h-20 w-36 rounded border border-dashed flex items-center justify-center text-gray-300 text-xs">Sin imagen</div>
            )}
            <label className="btn-secundario cursor-pointer">
              {subiendo ? "Subiendo..." : "Subir archivo"}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={subirImagen} disabled={subiendo} className="hidden" />
            </label>
            {imagen && (
              <button type="button" onClick={() => setImagen("")} className="link-peligro">Quitar</button>
            )}
          </div>
          <input
            placeholder="O pega una URL: https://..."
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
            className="admin-input"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="admin-label">Título (opcional)</label>
            <input placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Subtítulo (opcional)</label>
            <input placeholder="Subtítulo" value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Enlace (opcional)</label>
            <input placeholder="/tienda" value={enlace} onChange={(e) => setEnlace(e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Orden</label>
            <input placeholder="0" type="number" value={orden} onChange={(e) => setOrden(e.target.value)} className="admin-input" />
          </div>
        </div>
        <button className="btn-primario">Agregar banner</button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((b) => {
          const img = b.imagen.startsWith("http") ? b.imagen : `${API_BASE}${b.imagen}`;
          return (
            <div key={b.id} className="admin-card p-0 overflow-hidden">
              <div className="h-32 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={b.titulo || "banner"}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{b.titulo || "(sin título)"}</p>
                  <p className="text-xs text-gray-400">Orden: {b.orden}</p>
                </div>
                <button onClick={() => eliminar(b.id)} className="link-peligro">Eliminar</button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="text-gray-400 text-sm">Sin banners aún.</p>
        )}
      </div>
    </>
  );
}