"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { obtenerToken } from "@/lib/auth";

export default function ComentarForm({ entradaId }: { entradaId: number }) {
  const [logueado, setLogueado] = useState(false);
  const [contenido, setContenido] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    setLogueado(!!obtenerToken());
  }, []);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await api("/blog/comentarios", {
        method: "POST",
        auth: true,
        body: { contenido, entradaId },
      });
      setContenido("");
      setEnviado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al comentar");
    } finally {
      setCargando(false);
    }
  }

  if (!logueado) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800">
        <Link href="/login" className="underline font-medium">
          Inicia sesion
        </Link>{" "}
        para dejar un comentario.
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded p-4 text-sm text-emerald-800">
        Comentario enviado. Sera visible una vez aprobado por el equipo.
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <textarea
        placeholder="Escribe tu comentario..."
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        required
        rows={3}
        className="w-full border rounded px-3 py-2"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={cargando}
        className="bg-emerald-700 text-white px-6 py-2 rounded hover:bg-emerald-800 disabled:opacity-50"
      >
        {cargando ? "Enviando..." : "Comentar"}
      </button>
    </form>
  );
}