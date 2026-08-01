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
      <div className="rounded-xl p-5 text-center" style={{ backgroundColor: `${colorMarca}12`, color: colorMarca }}>
        <p className="font-medium">Mensaje enviado</p>
        <p className="text-sm mt-1 opacity-80">Te responderemos lo antes posible.</p>
      </div>
    );
  }
  return (
    <form onSubmit={enviar} className="space-y-3">
      <input
        placeholder="Tu nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition"
        style={{ ["--tw-ring-color" as string]: `${colorMarca}40` }}
      />
      <input
        type="email"
        placeholder="Tu correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition"
        style={{ ["--tw-ring-color" as string]: `${colorMarca}40` }}
      />
      <textarea
        placeholder="Tu mensaje"
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        required
        rows={5}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition resize-none"
        style={{ ["--tw-ring-color" as string]: `${colorMarca}40` }}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={cargando}
        className="w-full text-white py-3 btn-pill font-medium disabled:opacity-50"
        style={{ backgroundColor: colorMarca }}
      >
        {cargando ? "Enviando..." : "Enviar mensaje"}
      </button>
    </form>
  );
}