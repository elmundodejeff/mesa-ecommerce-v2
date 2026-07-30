"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerToken, borrarToken } from "@/lib/auth";

const LINKS = [
  { href: "/admin", label: "Productos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/secciones", label: "Secciones" },
  { href: "/admin/descuentos", label: "Descuentos" },
  { href: "/admin/ordenes", label: "Ordenes" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/config", label: "Config" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="font-bold text-lg">Mesa - Admin</h1>
          <nav className="flex gap-4 text-sm">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:underline">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <button onClick={salir} className="text-sm hover:underline">
          Salir
        </button>
      </header>
      <main className="p-6 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}