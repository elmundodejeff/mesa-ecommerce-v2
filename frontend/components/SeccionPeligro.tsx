"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { borrarToken } from "@/lib/auth";

export default function SeccionPeligro() {
  const router = useRouter();
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  async function desactivar() {
    if (!confirm("Seguro que quieres desactivar tu cuenta? No podras iniciar sesion hasta que un administrador la reactive.")) {
      return;
    }
    setError("");
    setProcesando(true);
    try {
      await api("/users/me/desactivar", { method: "PATCH", auth: true });
      borrarToken();
      alert("Tu cuenta ha sido desactivada.");
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setProcesando(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border-2 border-red-200 p-6">
      <h2 className="font-semibold text-red-600 mb-2">Zona de peligro</h2>
      <p className="text-sm text-gray-500 mb-4">
        Al desactivar tu cuenta no podras iniciar sesion. Tus compras se conservan.
        Si quieres reactivarla, escribenos y la gestionamos.
      </p>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <button
        onClick={desactivar}
        disabled={procesando}
        className="bg-red-600 text-white px-6 py-2 btn-pill hover:bg-red-700 disabled:opacity-50"
      >
        {procesando ? "Procesando..." : "Desactivar mi cuenta"}
      </button>
    </section>
  );
}