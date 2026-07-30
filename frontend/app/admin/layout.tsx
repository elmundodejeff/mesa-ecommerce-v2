"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { obtenerToken, borrarToken } from "@/lib/auth";

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

  useEffect(() => {
    if (!obtenerToken()) {
      router.replace("/login");
    } else {
      setOk(true);
    }
  }, [router]);

  function salir() {
    borrarToken();
    router.replace("/login");
  }

  if (!ok) return null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-emerald-900 text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <h1 className="font-bold text-lg">Mesa Admin</h1>
        </div>
        <nav className="flex-1 py-3">
          {LINKS.map((l) => {
            const activo =
              l.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`block px-5 py-2.5 text-sm transition-colors ${
                  activo
                    ? "bg-emerald-700 font-medium border-l-4 border-white"
                    : "hover:bg-emerald-800 border-l-4 border-transparent"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            className="block text-sm text-white/70 hover:text-white"
          >
            Volver al sitio
          </Link>
          <button
            onClick={salir}
            className="block text-sm text-white/70 hover:text-white"
          >
            Salir
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}