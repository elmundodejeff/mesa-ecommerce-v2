"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { guardarToken, guardarUsuario } from "@/lib/auth";
import ShellPublico from "@/components/ShellPublico";

interface LoginResp {
  access_token: string;
  user: { id: string; email: string; rol: string; nombre: string | null; avatar: string | null };
}

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rut, setRut] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      // 1. Registrar
      await api("/auth/register", {
        method: "POST",
        body: { email, password, nombre: nombre || undefined, rut: rut || undefined },
      });
      // 2. Suscribir al newsletter si acepto
      if (newsletter) {
        api("/contact/suscribir", {
          method: "POST",
          body: { email, nombre: nombre || undefined },
        }).catch(() => {});
      }
      // 3. Login automatico
      const data = await api<LoginResp>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      guardarToken(data.access_token);
      guardarUsuario(data.user);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setCargando(false);
    }
  }

  return (
    <ShellPublico>
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold mb-1 text-center text-gray-900">Crear cuenta</h1>
          <p className="text-sm text-gray-500 text-center mb-6">Únete y empieza a jugar</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Nombre</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">RUT (opcional)</label>
              <input value={rut} onChange={(e) => setRut(e.target.value)} placeholder="12345678-9" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
              <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="w-4 h-4 accent-[var(--color-marca)]" />
              Quiero recibir novedades y ofertas por correo
            </label>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button type="submit" disabled={cargando} className="w-full text-white py-2.5 btn-pill font-medium disabled:opacity-50" style={{ backgroundColor: "var(--color-marca)" }}>
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
          <p className="text-sm text-gray-500 text-center mt-5">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--color-marca)" }}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </ShellPublico>
  );
}