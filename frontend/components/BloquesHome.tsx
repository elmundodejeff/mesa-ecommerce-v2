"use client";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// --- Iconos SVG inline (sin dependencias) ---
const ICONOS: Record<string, React.ReactNode> = {
  truck: <path d="M10 17h4V5H2v12h3m5 0H6m4 0v-2m5 2h4v-4l-3-3h-3v7zm0 0v-2m4 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />,
  "shield-check": <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>,
  gift: <><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8M16.5 8a2.5 2.5 0 0 0 0-5C9 3 12 8 12 8" /></>,
  "message-heart": <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M12 13.5s-2.5-1.7-2.5-3.2a1.3 1.3 0 0 1 2.5-.5 1.3 1.3 0 0 1 2.5.5c0 1.5-2.5 3.2-2.5 3.2z" /></>,
  cards: <><rect x="3" y="5" width="12" height="16" rx="2" /><path d="M8 5V3m11 4-3 14 3 .5" /></>,
  "dice-5": <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1" /><circle cx="16" cy="8" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="8" cy="16" r="1" /><circle cx="16" cy="16" r="1" /></>,
  puzzle: <path d="M19.4 13a1.6 1.6 0 0 0 0-3.2h-.8a1.6 1.6 0 0 1-1.5-2.2 1.6 1.6 0 0 0-2.9-1.3l-.5.6a1.6 1.6 0 0 1-2.6 0l-.5-.6a1.6 1.6 0 0 0-2.9 1.3A1.6 1.6 0 0 1 5.4 9.8h-.8a1.6 1.6 0 0 0 0 3.2h.8a1.6 1.6 0 0 1 1.5 2.2 1.6 1.6 0 0 0 2.9 1.3l.5-.6a1.6 1.6 0 0 1 2.6 0l.5.6a1.6 1.6 0 0 0 2.9-1.3 1.6 1.6 0 0 1 1.5-2.2z" />,
  "users-group": <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  tools: <path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 1 5.4-5.4l-2.5 2.5-1.4-1.4z" />,
  flame: <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C8 9 7 11 7 13a5 5 0 0 0 10 0c0-5-5-11-5-11z" />,
  star: <path d="m12 2 3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z" />,
  tag: <><path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
};

function Icono({ nombre, size = 22 }: { nombre: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {ICONOS[nombre] || ICONOS.star}
    </svg>
  );
}

// --- Tipos ---
export interface TrustItem { icono: string; texto: string; }
export interface CategoriaItem { nombre: string; icono: string; enlace: string; imagen?: string; }
export interface BloqueTrust { visible: boolean; orden: number; items: TrustItem[]; }
export interface BloqueCategorias { visible: boolean; orden: number; titulo: string; items: CategoriaItem[]; }
export interface BloqueEditorial { visible: boolean; orden: number; titulo: string; subtitulo: string; imagen: string; enlace: string; textoBoton: string; }
export interface BloqueDescuento { visible: boolean; orden: number; texto: string; codigo: string; }

// --- Bloque: Franja de confianza ---
export function TrustBar({ items, colorMarca }: { items: TrustItem[]; colorMarca: string }) {
  return (
    <div className="border-y border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((it, i) => (
          <div key={i} className="flex items-center justify-center gap-2.5 text-center">
            <span style={{ color: colorMarca }}><Icono nombre={it.icono} /></span>
            <span className="text-sm text-gray-700">{it.texto}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Bloque: Circulos de categoria ---
export function CategoriasCirculos({ titulo, items, colorMarca }: { titulo: string; items: CategoriaItem[]; colorMarca: string }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">{titulo}</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 max-w-3xl mx-auto">
        {items.map((cat, i) => {
          const img = cat.imagen
            ? (cat.imagen.startsWith("http") ? cat.imagen : `${API_BASE}${cat.imagen}`)
            : "";
          return (
            <Link key={i} href={cat.enlace} className="group flex flex-col items-center gap-2">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center bg-white border-2 overflow-hidden transition-transform group-hover:scale-105 group-hover:shadow-md"
                style={{ borderColor: colorMarca, color: colorMarca }}
              >
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={cat.nombre} className="w-full h-full object-cover" />
                ) : (
                  <Icono nombre={cat.icono} size={30} />
                )}
              </div>
              <span className="text-sm text-gray-700 group-hover:text-gray-900 text-center">{cat.nombre}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// --- Bloque: Banner editorial ---
export function Editorial({ bloque, colorHeader, colorMarca }: { bloque: BloqueEditorial; colorHeader: string; colorMarca: string }) {
  const img = bloque.imagen
    ? (bloque.imagen.startsWith("http") ? bloque.imagen : `${API_BASE}${bloque.imagen}`)
    : "";
  return (
    <section
      className="rounded-2xl overflow-hidden flex flex-col md:flex-row items-center gap-6 p-8 md:p-10"
      style={{ backgroundColor: colorHeader }}
    >
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-white">{bloque.titulo}</h2>
        {bloque.subtitulo && <p className="text-white/80 mt-2">{bloque.subtitulo}</p>}
        {bloque.enlace && (
          <Link
            href={bloque.enlace}
            className="inline-block mt-5 px-6 py-2.5 rounded-full font-medium text-white btn-pill"
            style={{ backgroundColor: colorMarca }}
          >
            {bloque.textoBoton || "Ver más"}
          </Link>
        )}
      </div>
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={bloque.titulo} className="w-full md:w-64 h-40 md:h-48 object-cover rounded-xl" />
      )}
    </section>
  );
}

// --- Bloque: Franja de descuento ---
export function FranjaDescuento({ bloque, colorMarca }: { bloque: BloqueDescuento; colorMarca: string }) {
  return (
    <section
      className="rounded-2xl px-8 py-6 text-center"
      style={{ backgroundColor: `${colorMarca}10` }}
    >
      <p className="text-lg font-medium text-gray-900">
        {bloque.texto}
        {bloque.codigo && (
          <span
            className="inline-block ml-2 px-3 py-0.5 rounded-full text-white text-base align-middle"
            style={{ backgroundColor: colorMarca }}
          >
            {bloque.codigo}
          </span>
        )}
      </p>
    </section>
  );
}

export { Icono };