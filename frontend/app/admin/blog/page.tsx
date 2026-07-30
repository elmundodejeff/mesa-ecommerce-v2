"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

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
  const [error, setError] = useState("");

  async function cargar() {
    try {
      const [e, p] = await Promise.all([
        api<Entrada[]>("/blog/entradas"),
        api<ComentarioPendiente[]>("/blog/comentarios/pendientes", {
          auth: true,
        }),
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
      await api(`/blog/comentarios/${id}/aprobar`, {
        method: "PATCH",
        auth: true,
      });
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

  return (
    <div className="max-w-3xl space-y-8">
      <h2 className="text-xl font-semibold text-gray-900">Blog</h2>
      {error && <p className="text-red-600">{error}</p>}

      <section className="bg-white rounded-lg shadow p-6 space-y-3">
        <h3 className="font-medium text-gray-800">Nueva entrada</h3>
        <form onSubmit={crearEntrada} className="space-y-3">
          <input
            placeholder="Titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
          <input
            placeholder="URL imagen (opcional)"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <textarea
            placeholder="Contenido"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            required
            rows={5}
            className="w-full border rounded px-3 py-2"
          />
          <button className="bg-emerald-700 text-white px-6 py-2 rounded hover:bg-emerald-800">
            Publicar
          </button>
        </form>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium text-gray-800 mb-4">
          Comentarios pendientes ({pendientes.length})
        </h3>
        {pendientes.length === 0 ? (
          <p className="text-gray-400 text-sm">Nada por moderar.</p>
        ) : (
          <div className="space-y-3">
            {pendientes.map((c) => (
              <div
                key={c.id}
                className="border rounded p-3 flex justify-between items-start gap-4"
              >
                <div className="text-sm">
                  <p className="text-gray-800">{c.contenido}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {c.user.nombre || "Usuario"} en &quot;{c.entrada.titulo}
                    &quot;
                  </p>
                </div>
                <div className="flex gap-3 text-sm shrink-0">
                  <button
                    onClick={() => aprobar(c.id)}
                    className="text-emerald-700 hover:underline"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => rechazar(c.id)}
                    className="text-red-600 hover:underline"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium text-gray-800 mb-4">
          Entradas ({entradas.length})
        </h3>
        <div className="divide-y">
          {entradas.map((e) => (
            <div
              key={e.id}
              className="py-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-gray-800">{e.titulo}</p>
                <p className="text-xs text-gray-400">
                  {new Date(e.fecha).toLocaleDateString("es-CL")}
                </p>
              </div>
              <button
                onClick={() => eliminarEntrada(e.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Eliminar
              </button>
            </div>
          ))}
          {entradas.length === 0 && (
            <p className="text-gray-400 text-sm">Sin entradas aun.</p>
          )}
        </div>
      </section>
    </div>
  );
}