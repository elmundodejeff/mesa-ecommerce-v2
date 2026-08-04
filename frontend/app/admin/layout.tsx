"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { obtenerToken, borrarToken, obtenerUsuario } from "@/lib/auth";
import { api } from "@/lib/api";
import type { UsuarioSesion } from "@/lib/auth";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/productos-lista", label: "Productos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/home", label: "Home" },
  { href: "/admin/descuentos", label: "Descuentos" },
  { href: "/admin/ordenes", label: "Ordenes" },
  { href: "/admin/contacto", label: "Comunicaciones" },
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
  const [logo, setLogo] = useState<string | null>(null);
  const [nombreSitio, setNombreSitio] = useState("Mesa Admin");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [badges, setBadges] = useState<Record<string, number>>({});
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  useEffect(() => {
    if (!obtenerToken()) {
      router.replace("/login");
    } else {
      setOk(true);
      setUsuario(obtenerUsuario());
      api<{ logo: string | null; nombreSitio: string; logoUrl: string | null }>("/content/config")
        .then((c) => {
          setLogo(c.logo);
          setNombreSitio(c.nombreSitio || "Mesa Admin");
          setLogoUrl(c.logoUrl);
        })
        .catch(() => {});
      Promise.all([
        api<{ leido: boolean }[]>("/contact", { auth: true }).catch(() => []),
        api<{ visto: boolean }[]>("/orders", { auth: true }).catch(() => []),
        api<unknown[]>("/blog/comentarios/pendientes", { auth: true }).catch(() => []),
      ]).then(([mensajes, ordenes, comentarios]) => {
        setBadges({
          "/admin/contacto": mensajes.filter((m) => !m.leido).length,
          "/admin/ordenes": ordenes.filter((o) => !o.visto).length,
          "/admin/blog": comentarios.length,
        });
      }).catch(() => {});
    }
  }, [router]);

  // Cerrar sidebar movil al navegar
  useEffect(() => {
    setSidebarAbierto(false);
  }, [pathname]);

  function salir() {
    borrarToken();
    router.replace("/login");
  }

  if (!ok) return null;

  const logoNode = (() => {
    const destino = logoUrl || "/admin";
    const contenido = logo ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logo.startsWith("http") ? logo : `${API_BASE}${logo}`} alt={nombreSitio} className="h-9 w-auto object-contain" />
    ) : (
      <h1 className="font-bold text-lg text-marca">{nombreSitio}</h1>
    );
    return destino.startsWith("http") ? (
      <a href={destino} className="hover:opacity-80 transition inline-block">{contenido}</a>
    ) : (
      <Link href={destino} className="hover:opacity-80 transition inline-block">{contenido}</Link>
    );
  })();

  const sidebar = (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0 h-full">
      <div className="px-5 py-5 border-b border-gray-100">
        {logoNode}
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {LINKS.map((l) => {
          const activo = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center justify-between px-4 py-2.5 text-sm rounded-full transition-colors ${activo ? "text-white font-medium" : "text-gray-600 hover:bg-gray-100"}`}
              style={activo ? { backgroundColor: "var(--color-marca)" } : undefined}
            >
              <span>{l.label}</span>
              {badges[l.href] > 0 && (
                <span className={`ml-2 min-w-5 h-5 px-1.5 flex items-center justify-center text-xs font-bold rounded-full ${activo ? "bg-white text-gray-900" : "text-white"}`} style={!activo ? { backgroundColor: "#dc2626" } : undefined}>
                  {badges[l.href]}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        {usuario && (
          <div className="flex items-center gap-2 mb-3">
            {usuario.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${API_BASE}${usuario.avatar}`} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "var(--color-marca)" }}>
                {(usuario.nombre || usuario.email).charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-gray-700 truncate">{usuario.nombre || usuario.email}</span>
          </div>
        )}
        <Link href="/" className="block text-sm text-gray-500 hover:text-gray-800">Volver al sitio</Link>
        <button onClick={salir} className="block text-sm text-gray-500 hover:text-gray-800 mt-1">Salir</button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar desktop */}
      <div className="hidden lg:flex">{sidebar}</div>

      {/* Sidebar movil (deslizable) */}
      {sidebarAbierto && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarAbierto(false)} />
          <div className="relative h-full animate-[deslizar_0.2s_ease-out]">
            {sidebar}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar movil */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button onClick={() => setSidebarAbierto(true)} className="w-9 h-9 flex items-center justify-center text-gray-700" aria-label="Menú">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
          <span className="font-semibold text-gray-800 text-sm">{nombreSitio}</span>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="admin-page">{children}</div>
        </main>
      </div>

      <style>{`
        @keyframes deslizar {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}