"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { obtenerToken, borrarToken, obtenerUsuario } from "@/lib/auth";
import type { UsuarioSesion } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/productos-lista", label: "Productos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/secciones", label: "Secciones" },
  { href: "/admin/descuentos", label: "Descuentos" },
  { href: "/admin/ordenes", label: "Ordenes" },
  { href: "/admin/contacto", label: "Mensajes" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/config", label: "Config" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  useEffect(() => {
    if (!obtenerToken()) {
      router.replace("/login");
    } else {
      setOk(true);
      setUsuario(obtenerUsuario());
    }
  }, [router]);

  function salir() {
    borrarToken();
    router.replace("/login");
  }

  if (!ok) return null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="font-bold text-lg text-marca">Mesa Admin</h1>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {LINKS.map((l) => {
            const activo =
              l.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`block px-4 py-2.5 text-sm rounded-full transition-colors ${
                  activo
                    ? "text-white font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                style={activo ? { backgroundColor: "var(--color-marca)" } : undefined}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          {usuario && (
            <div className="flex items-center gap-2 mb-3">
              {usuario.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${API_BASE}${usuario.avatar}`}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: "var(--color-marca)" }}
                >
                  {(usuario.nombre || usuario.email).charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-gray-700 truncate">
                {usuario.nombre || usuario.email}
              </span>
            </div>
          )}
          <Link
            href="/"
            className="block text-sm text-gray-500 hover:text-gray-800"
          >
            Volver al sitio
          </Link>
          <button
            onClick={salir}
            className="block text-sm text-gray-500 hover:text-gray-800 mt-1"
          >
            Salir
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}