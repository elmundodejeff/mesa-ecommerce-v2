"use client";

import { useCarrito } from "@/lib/carrito";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ProductoCard {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  descripcion: string | null;
  idioma?: string | null;
  preventa?: boolean;
  fechaLanzamiento?: string | null;
  textoPreventa?: string | null;
  imagenes?: { id: number; url: string }[];
  categorias?: { id: number; nombre: string }[];
  secciones?: { id: number; nombre: string }[];
}

export default function CardProducto({
  producto: p,
  colorMarca,
  onVer,
}: {
  producto: ProductoCard;
  colorMarca: string;
  onVer: (p: ProductoCard) => void;
}) {
  const { agregar } = useCarrito();

  return (
    <div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col border-2"
      style={{ borderColor: p.preventa ? colorMarca : "#f3f4f6" }}
    >
      <button
        onClick={() => onVer(p)}
        className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
      >
        {p.preventa && (
          <span
            className="absolute top-2 left-2 z-10 text-xs font-medium text-white px-3 py-1 rounded-full"
            style={{ backgroundColor: colorMarca }}
          >
            Preventa
          </span>
        )}
        {p.imagenes && p.imagenes.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${API_BASE}${p.imagenes[0].url}`}
            alt={p.nombre}
            className={`w-full h-full object-cover hover:scale-105 transition-transform ${
              p.stock < 1 ? "grayscale opacity-60" : ""
            }`}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white text-5xl font-bold"
            style={{ background: `linear-gradient(135deg, ${colorMarca}, ${colorMarca}cc)` }}
          >
            {p.nombre.charAt(0)}
          </div>
        )}
      </button>
      <button
        onClick={() => onVer(p)}
        className="text-left font-semibold text-lg text-gray-900 hover:underline"
      >
        {p.nombre}
      </button>
      <p className="text-gray-500 text-sm flex-1 mt-1 line-clamp-2">
        {p.descripcion || "Sin descripcion"}
      </p>
      <p className="font-bold text-2xl mt-4" style={{ color: colorMarca }}>
        ${p.precio.toLocaleString("es-CL")}
      </p>
      <p className="text-xs text-gray-400 mb-4">
        {p.preventa && p.fechaLanzamiento
          ? `Lanzamiento: ${new Date(p.fechaLanzamiento).toLocaleDateString("es-CL", { day: "numeric", month: "long" })}`
          : p.stock > 0
            ? `${p.stock} disponibles`
            : "Agotado"}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onVer(p)}
          className="flex-1 border py-2.5 rounded-full font-medium text-gray-700 hover:bg-gray-50 btn-pill"
        >
          Ver
        </button>
        <button
          onClick={() =>
            agregar({ productoId: p.id, nombre: p.nombre, precio: p.precio, stock: p.stock })
          }
          disabled={p.stock < 1}
          className="flex-1 text-white py-2.5 font-medium btn-pill"
          style={{ backgroundColor: colorMarca }}
        >
          {p.stock < 1 ? "Sin stock" : p.preventa ? "Reservar" : "Agregar"}
        </button>
      </div>
    </div>
  );
}