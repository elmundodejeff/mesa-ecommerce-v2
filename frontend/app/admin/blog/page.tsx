"use client";

import { useEffect, useState } from "react";
import { api, apiUpload } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Entrada {
  id: number;
  titulo: string;
  contenido: string;
  imagen: string | null;
  fecha: string;
}

interface ComentarioPendiente {
  id: number;
  contenido: string;
  creado: string;
  user: { nombre: string | null };
  entrada: { titulo: string };
}

export default function AdminBlog() {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [pendientes, setPendientes] = useState<ComentarioPendiente[]>([]);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [imagen, setImagen] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      const [e, p] = await Promise.all([
        api<Entrada[]>("/blog/entradas"),
        api<ComentarioPendiente[]>("/blog/comentarios/pendientes", { auth: true }),
      ]);
      setEntradas(e);
      setPendientes(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
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

  async function crearEntrada(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/blog/entradas", {
        method: "POST",
        auth: true,
        body: { titulo, contenido, imagen: imagen || undefined },
      });
      setTitulo("");
      setContenido("");
      setImagen("");
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  async function eliminarEntrada(id: number) {
    if (!confirm("Eliminar entrada?")) return;
    try {
      await api(`/blog/entradas/${id}`, { method: "DELETE", auth: true });
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  async function aprobar(id: number) {
    try {
      await api(`/blog/comentarios/${id}/aprobar`, { method: "PATCH", auth: true });
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  async function rechazar(id: number) {
    try {
      await api(`/blog/comentarios/${id}`, { method: "DELETE", auth: true });
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  const previewImg = imagen
    ? (imagen.startsWith("http") ? imagen : `${API_BASE}${imagen}`)
    : "";

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Blog</h1>
          <p className="admin-subtitle">Entradas y moderación de comentarios</p>
        </div>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <section className="admin-card">
        <h2 className="admin-card-title">Nueva entrada</h2>
        <form onSubmit={crearEntrada} className="space-y-3">
          <div>
            <label className="admin-label">Título</label>
            <input
              placeholder="Título de la entrada"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Imagen (opcional)</label>
            <div className="flex items-center gap-4 mb-2">
              {previewImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewImg} alt="" className="h-16 w-24 object-cover rounded border" />
              ) : (
                <div className="h-16 w-24 rounded border border-dashed flex items-center justify-center text-gray-300 text-xs">Sin imagen</div>
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
          <div>
            <label className="admin-label">Contenido</label>
            <textarea
              placeholder="Escribe el contenido..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              required
              rows={5}
              className="admin-input"
            />
          </div>
          <button className="btn-primario">Publicar</button>
        </form>
      </section>

      <section className="admin-card">
        <h2 className="admin-card-title">Comentarios pendientes ({pendientes.length})</h2>
        {pendientes.length === 0 ? (
          <p className="text-gray-400 text-sm">Nada por moderar.</p>
        ) : (
          <div className="space-y-3">
            {pendientes.map((c) => (
              <div key={c.id} className="border border-gray-100 rounded-lg p-3 flex justify-between items-start gap-4">
                <div className="text-sm">
                  <p className="text-gray-800">{c.contenido}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {c.user.nombre || "Usuario"} en &quot;{c.entrada.titulo}&quot;
                  </p>
                </div>
                <div className="flex gap-4 shrink-0">
                  <button onClick={() => aprobar(c.id)} className="link-accion">Aprobar</button>
                  <button onClick={() => rechazar(c.id)} className="link-peligro">Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="admin-card">
        <h2 className="admin-card-title">Entradas ({entradas.length})</h2>
        <div className="divide-y divide-gray-50">
          {entradas.map((e) => (
            <div key={e.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{e.titulo}</p>
                <p className="text-xs text-gray-400">{new Date(e.fecha).toLocaleDateString("es-CL")}</p>
              </div>
              <button onClick={() => eliminarEntrada(e.id)} className="link-peligro">Eliminar</button>
            </div>
          ))}
          {entradas.length === 0 && (
            <p className="text-gray-400 text-sm">Sin entradas aún.</p>
          )}
        </div>
      </section>
    </>
  );
}