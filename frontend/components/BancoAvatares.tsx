"use client";

import { useState, useEffect } from "react";
import { api, apiUpload } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Avatar {
  id: number;
  url: string;
}

export default function BancoAvatares() {
  const [avatares, setAvatares] = useState<Avatar[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setAvatares(await api<Avatar[]>("/content/avatares"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function subir(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append("imagen", f);
      await apiUpload("/content/avatares", fd);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  }

  async function borrar(id: number) {
    if (!confirm("Eliminar este avatar del banco?")) return;
    try {
      await api(`/content/avatares/${id}`, { method: "DELETE", auth: true });
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Imagenes que los usuarios podran elegir como avatar.
      </p>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex flex-wrap gap-3">
        {avatares.map((a) => (
          <div key={a.id} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${API_BASE}${a.url}`}
              alt=""
              className="w-16 h-16 rounded-full object-cover border"
            />
            <button
              onClick={() => borrar(a.id)}
              className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
            >
              x
            </button>
          </div>
        ))}
        <label className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 text-gray-400 text-2xl">
          {subiendo ? "..." : "+"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={subir}
            disabled={subiendo}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}