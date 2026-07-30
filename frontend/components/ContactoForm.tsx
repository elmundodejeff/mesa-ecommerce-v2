"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function ContactoForm({
  colorMarca,
}: {
  colorMarca: string;
}) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await api("/contact", {
        method: "POST",
        body: { nombre, email, mensaje },
      });
      setEnviado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar");
    } finally {
      setCargando(false);
    }
  }

  if (enviado) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded p-4 text-emerald-800">
        Mensaje enviado. Te responderemos pronto.
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <input
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full border rounded px-3 py-2"
      />
      <textarea
        placeholder="Mensaje"
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        required
        rows={5}
        className="w-full border rounded px-3 py-2"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={cargando}
        className="w-full text-white py-3 rounded-lg font-medium disabled:opacity-50"
        style={{ backgroundColor: colorMarca }}
      >
        {cargando ? "Enviando..." : "Enviar mensaje"}
      </button>
    </form>
  );
}