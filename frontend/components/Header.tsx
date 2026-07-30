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

  useEffect(() => {
    setUsuario(obtenerUsuario());
  }, []);

  function salir() {
    borrarToken();
    setUsuario(null);
    window.location.reload();
  }

  return (
    <header
      className="px-6 py-4 flex justify-between items-center relative z-30"
      style={{
        backgroundColor: config.colorHeader,
        color: config.colorHeaderTexto,
      }}
    >
      <div className="flex items-center gap-8">
        <h1 className="font-bold text-xl">{config.nombreSitio}</h1>
        <nav className="hidden md:flex gap-5 text-sm">
          {menu.map((item) => {
            const activo =
              item.enlace === "/"
                ? pathname === "/"
                : pathname.startsWith(item.enlace);
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
                        <Link
                          key={h.id}
                          href={h.enlace}
                          className="block px-4 py-2.5 hover:bg-gray-100 border-b last:border-0 text-sm"
                        >
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

      <div className="flex items-center gap-5">
        <Link
          href="/checkout"
          className="px-4 py-2 font-medium inline-flex items-center gap-2 btn-pill text-white"
          style={{ backgroundColor: config.colorMarca }}
        >
          <span aria-hidden="true">&#128722;</span> {cantidadTotal}
        </Link>

        {usuario ? (
          <div className="flex items-center gap-3">
            {usuario.rol === "admin" && (
              <Link href="/admin" className="text-sm font-medium hover:underline">
                Admin
              </Link>
            )}
            <Link
              href="/cuenta"
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
              {usuario.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${API_BASE}${usuario.avatar}`}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border border-white/30"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: config.colorMarca }}
                >
                  {(usuario.nombre || usuario.email).charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm">
                Hola, {usuario.nombre || usuario.email}
              </span>
            </Link>
            <button
              onClick={salir}
              className="text-sm hover:underline opacity-80"
            >
              Salir
            </button>
          </div>
        ) : (
          <Link href="/login" className="text-sm font-medium hover:underline">
            Iniciar sesion
          </Link>
        )}
      </div>
    </header>
  );
}