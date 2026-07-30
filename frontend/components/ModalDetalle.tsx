"use client";

import { useState, useEffect } from "react";
import type { ProductoCard } from "./CardProducto";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function ModalDetalle({
  producto,
  colorMarca,
  onCerrar,
  onAgregar,
}: {
  producto: ProductoCard;
  colorMarca: string;
  onCerrar: () => void;
  onAgregar: () => void;
}) {
  const [agregado, setAgregado] = useState(false);
  const [imgActual, setImgActual] = useState(0);
  const imagenes = producto.imagenes || [];
  const categorias = producto.categorias || [];
  const secciones = producto.secciones || [];
  const agotado = producto.stock < 1;

  const prevImg = () =>
    setImgActual((i) => (i - 1 + imagenes.length) % imagenes.length);
  const nextImg = () => setImgActual((i) => (i + 1) % imagenes.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
      if (imagenes.length > 1) {
        if (e.key === "ArrowLeft") prevImg();
        if (e.key === "ArrowRight") nextImg();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onCerrar]);

  function agregar() {
    onAgregar();
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-gray-100 flex flex-col">
            <div className="relative aspect-square flex items-center justify-center overflow-hidden">
              {imagenes.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${API_BASE}${imagenes[imgActual].url}`}
                  alt={producto.nombre}
                  className={`w-full h-full object-cover transition ${agotado ? "grayscale opacity-60" : ""}`}
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center text-white text-7xl font-bold ${agotado ? "grayscale opacity-60" : ""}`}
                  style={{ background: `linear-gradient(135deg, ${colorMarca}, ${colorMarca}cc)` }}
                >
                  {producto.nombre.charAt(0)}
                </div>
              )}
              {agotado && (
                <span className="absolute top-3 left-3 bg-gray-900/80 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Agotado
                </span>
              )}
              {imagenes.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full hover:bg-black/60 flex items-center justify-center" aria-label="Anterior">&lt;</button>
                  <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full hover:bg-black/60 flex items-center justify-center" aria-label="Siguiente">&gt;</button>
                  <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">{imgActual + 1} / {imagenes.length}</span>
                </>
              )}
            </div>
            {imagenes.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-white">
                {imagenes.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setImgActual(i)}
                    className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition"
                    style={{ borderColor: i === imgActual ? colorMarca : "transparent" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${API_BASE}${img.url}`} alt="" className={`w-full h-full object-cover ${agotado ? "grayscale opacity-60" : ""}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 relative">
            <button onClick={onCerrar} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>

            <div className="flex flex-wrap gap-2 mb-3 pr-8">
              {categorias.map((c) => (
                <span key={c.id} className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">{c.nombre}</span>
              ))}
              {secciones.map((s) => (
                <span key={`s-${s.id}`} className="text-xs px-2 py-1 rounded-full text-white" style={{ backgroundColor: colorMarca }}>{s.nombre}</span>
              ))}
              {producto.idioma && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{producto.idioma}</span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900">{producto.nombre}</h2>
            <p className="text-3xl font-bold mt-3" style={{ color: colorMarca }}>${producto.precio.toLocaleString("es-CL")}</p>
            <p className="text-sm text-gray-500 mt-1">{producto.stock > 0 ? `${producto.stock} disponibles` : "Agotado"}</p>
            {producto.idioma && (
              <p className="text-sm text-gray-500 mt-1">Idioma: <span className="font-medium text-gray-700">{producto.idioma}</span></p>
            )}
            <p className="text-gray-700 mt-4 whitespace-pre-wrap leading-relaxed">{producto.descripcion || "Sin descripcion."}</p>

            {producto.preventa && producto.fechaLanzamiento && (
              <p className="text-sm mt-3 font-medium" style={{ color: colorMarca }}>
                Lanzamiento: {new Date(producto.fechaLanzamiento).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
            {producto.textoPreventa && (
              <p className="text-sm text-gray-500 mt-1">{producto.textoPreventa}</p>
            )}

            <button
              onClick={agregar}
              disabled={producto.stock < 1}
              className="w-full mt-6 text-white py-3 font-medium btn-pill"
              style={{ backgroundColor: colorMarca }}
            >
              {producto.stock < 1 ? "Sin stock" : agregado ? (producto.preventa ? "Reservado!" : "Agregado al carrito!") : (producto.preventa ? "Reservar" : "Agregar al carrito")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}