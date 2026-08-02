"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { guardarToken, guardarUsuario } from "@/lib/auth";
import ShellPublico from "@/components/ShellPublico";

interface LoginResp {
  access_token: string;
  user: {
    id: string;
    email: string;
    rol: string;
    nombre: string | null;
    avatar: string | null;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const data = await api<LoginResp>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      guardarToken(data.access_token);
      guardarUsuario(data.user);
      router.push(data.user.rol === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesion");
    } finally {
      setCargando(false);
    }
  }

  return (
    <ShellPublico>
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold mb-1 text-center text-gray-900">Iniciar sesión</h1>
          <p className="text-sm text-gray-500 text-center mb-6">Bienvenido de vuelta</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={cargando}
              className="w-full text-white py-2.5 btn-pill font-medium disabled:opacity-50"
              style={{ backgroundColor: "var(--color-marca)" }}
            >
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
          <p className="text-sm text-gray-500 text-center mt-5">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="font-medium hover:underline" style={{ color: "var(--color-marca)" }}>
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </ShellPublico>
  );
}