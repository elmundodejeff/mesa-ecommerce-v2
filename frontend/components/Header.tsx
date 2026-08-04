"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCarrito } from "@/lib/carrito";
import { obtenerUsuario, borrarToken } from "@/lib/auth";
import type { UsuarioSesion } from "@/lib/auth";
import type { Config } from "@/lib/config";
import type { MenuItem } from "@/app/page";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function Header({
  config,
  menu,
}: {
  config: Config;
  menu: MenuItem[];
}) {
  const { cantidadTotal } = useCarrito();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [montado, setMontado] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    setUsuario(obtenerUsuario());
    setMontado(true);
  }, []);

  // Cerrar el menu movil al cambiar de ruta
  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  function salir() {
    borrarToken();
    setUsuario(null);
    window.location.reload();
  }

  const logoNode = (() => {
    const destino = config.logoUrl || "/";
    const contenido = config.logo ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={config.logo.startsWith("http") ? config.logo : `${API_BASE}${config.logo}`}
        alt={config.nombreSitio}
        className="h-9 sm:h-10 w-auto object-contain"
      />
    ) : (
      <h1 className="font-bold text-lg sm:text-xl">{config.nombreSitio}</h1>
    );
    return destino.startsWith("http") ? (
      <a href={destino} className="hover:opacity-80 transition">{contenido}</a>
    ) : (
      <Link href={destino} className="hover:opacity-80 transition">{contenido}</Link>
    );
  })();

  return (
    <header
      className="px-4 sm:px-6 py-3 sm:py-4 relative z-30"
      style={{ backgroundColor: config.colorHeader, color: config.colorHeaderTexto }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-8">
          {logoNode}
          {/* Nav desktop */}
          <nav className="hidden md:flex gap-5 text-sm">
            {menu.map((item) => {
              const activo = montado && (item.enlace === "/" ? pathname === "/" : pathname.startsWith(item.enlace));
              const tieneHijos = item.hijos && item.hijos.length > 0;
              return (
                <div key={item.id} className="relative group">
                  <Link
                    href={item.enlace}
                    className="hover:opacity-80 transition inline-flex items-center gap-1"
                    style={activo ? { color: config.colorMarca, fontWeight: 600 } : undefined}
                  >
                    {item.texto}
                    {tieneHijos && <span className="text-xs opacity-70">&#9662;</span>}
                  </Link>
                  {tieneHijos && (
                    <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-40">
                      <div className="bg-white text-gray-800 rounded-lg shadow-xl min-w-44 overflow-hidden">
                        {item.hijos.map((h) => (
                          <Link key={h.id} href={h.enlace} className="block px-4 py-2.5 hover:bg-gray-100 border-b last:border-0 text-sm">
                            {h.texto}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Carrito */}
          <Link
            href="/checkout"
            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white hover:opacity-90 transition"
            style={{ backgroundColor: config.colorMarca }}
            aria-label={`Carrito (${cantidadTotal})`}
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
            {cantidadTotal > 0 && (
              <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cantidadTotal}
              </span>
            )}
          </Link>

          {/* Cuenta desktop */}
          <div className="hidden md:flex items-center gap-3">
            {usuario ? (
              <>
                {usuario.rol === "admin" && (
                  <Link href="/admin" className="text-sm font-medium hover:underline">Admin</Link>
                )}
                <Link href="/cuenta" className="flex items-center gap-2 hover:opacity-80 transition">
                  {usuario.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${API_BASE}${usuario.avatar}`} alt="" className="w-8 h-8 rounded-full object-cover border border-white/30" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: config.colorMarca }}>
                      {(usuario.nombre || usuario.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm">Hola, {usuario.nombre || usuario.email}</span>
                </Link>
                <button onClick={salir} className="text-sm hover:underline opacity-80">Salir</button>
              </>
            ) : (
              <Link href="/login" className="text-sm font-medium hover:underline">Iniciar sesión</Link>
            )}
          </div>

          {/* Boton hamburguesa (movil) */}
          <button
            onClick={() => setMenuAbierto((v) => !v)}
            className="md:hidden w-10 h-10 flex items-center justify-center"
            aria-label="Menú"
          >
            {menuAbierto ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Panel movil desplegable */}
      {menuAbierto && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/20">
          <nav className="flex flex-col gap-1">
            {menu.map((item) => {
              const activo = montado && (item.enlace === "/" ? pathname === "/" : pathname.startsWith(item.enlace));
              return (
                <div key={item.id}>
                  <Link
                    href={item.enlace}
                    className="block py-2 hover:opacity-80"
                    style={activo ? { color: config.colorMarca, fontWeight: 600 } : undefined}
                  >
                    {item.texto}
                  </Link>
                  {item.hijos && item.hijos.length > 0 && (
                    <div className="ml-4 flex flex-col">
                      {item.hijos.map((h) => (
                        <Link key={h.id} href={h.enlace} className="block py-1.5 text-sm opacity-90 hover:opacity-70">
                          &#8627; {h.texto}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="mt-3 pt-3 border-t border-white/20">
            {usuario ? (
              <div className="flex flex-col gap-2">
                {usuario.rol === "admin" && (
                  <Link href="/admin" className="py-1.5 text-sm font-medium">Panel de administración</Link>
                )}
                <Link href="/cuenta" className="py-1.5 text-sm">Mi perfil ({usuario.nombre || usuario.email})</Link>
                <button onClick={salir} className="py-1.5 text-sm text-left opacity-80">Cerrar sesión</button>
              </div>
            ) : (
              <Link href="/login" className="block py-1.5 text-sm font-medium">Iniciar sesión</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}