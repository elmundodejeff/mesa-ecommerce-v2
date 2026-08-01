"use client";
import { useState } from "react";
import { api } from "@/lib/api";
export default function NewsletterForm({
  colorMarca,
}: {
  colorMarca: string;
}) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [listo, setListo] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  async function suscribir(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await api("/contact/suscribir", {
        method: "POST",
        body: { email, nombre: nombre || undefined },
      });
      setListo(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al suscribir");
    } finally {
      setCargando(false);
    }
  }
  if (listo) {
    return (
      <div className="rounded-xl p-5 text-center" style={{ backgroundColor: `${colorMarca}12`, color: colorMarca }}>
        <p className="font-medium">Listo, ya estás suscrito</p>
        <p className="text-sm mt-1 opacity-80">Te avisaremos de novedades y ofertas.</p>
      </div>
    );
  }
  return (
    <form onSubmit={suscribir} className="flex flex-col sm:flex-row gap-3">
      <input
        placeholder="Tu nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition"
        style={{ ["--tw-ring-color" as string]: `${colorMarca}40` }}
      />
      <input
        type="email"
        placeholder="Tu correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition"
        style={{ ["--tw-ring-color" as string]: `${colorMarca}40` }}
      />
      <button
        type="submit"
        disabled={cargando}
        className="text-white px-6 py-3 btn-pill font-medium disabled:opacity-50 shrink-0"
        style={{ backgroundColor: colorMarca }}
      >
        {cargando ? "..." : "Suscribirme"}
      </button>
      {error && <p className="text-red-600 text-sm w-full">{error}</p>}
    </form>
  );
}