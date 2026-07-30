"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiUpload } from "@/lib/api";
import {
  obtenerToken,
  obtenerUsuario,
  guardarUsuario,
  type UsuarioSesion,
} from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function CuentaPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!obtenerToken()) {
      router.replace("/login");
      return;
    }
    setUsuario(obtenerUsuario());
  }, [router]);

  async function subirAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError("");
    setOk(false);
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append("avatar", files[0]);
      const resp = await apiUpload<{ avatar: string }>(
        "/users/me/avatar",
        fd,
      );
      if (usuario) {
        const actualizado = { ...usuario, avatar: resp.avatar };
        setUsuario(actualizado);
        guardarUsuario(actualizado);
      }
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  }

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mi cuenta</h1>
          <Link href="/" className="text-sm text-gray-500 hover:underline">
            Volver
          </Link>
        </div>

        <div className="flex flex-col items-center gap-4">
          {usuario.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${API_BASE}${usuario.avatar}`}
              alt="Avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-100"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-emerald-700 flex items-center justify-center text-white text-4xl font-bold">
              {(usuario.nombre || usuario.email).charAt(0).toUpperCase()}
            </div>
          )}

          <label className="cursor-pointer text-sm bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-lg">
            {subiendo ? "Subiendo..." : "Cambiar foto"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={subirAvatar}
              disabled={subiendo}
              className="hidden"
            />
          </label>

          {ok && <p className="text-emerald-700 text-sm">Foto actualizada.</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        <div className="mt-8 border-t pt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Nombre</span>
            <span className="text-gray-800">{usuario.nombre || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="text-gray-800">{usuario.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Rol</span>
            <span className="text-gray-800 capitalize">{usuario.rol}</span>
          </div>
        </div>
      </div>
    </div>
  );
}