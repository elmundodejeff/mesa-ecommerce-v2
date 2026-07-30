"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCarrito } from "@/lib/carrito";
import { obtenerUsuario, borrarToken } from "@/lib/auth";
import type { UsuarioSesion } from "@/lib/auth";
import { api } from "@/lib/api";
import type { Config } from "@/lib/config";
import type { Banner, MenuItem, Categoria } from "@/app/page";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  descripcion: string | null;
  idioma?: string | null;
  imagenes?: { id: number; url: string }[];
  categorias?: { id: number; nombre: string }[];
  secciones?: { id: number; nombre: string }[];
}

export default function TiendaCliente({
  config,
  productos,
  banners,
  menu,
  categorias,
}: {
  config: Config;
  productos: Producto[];
  banners: Banner[];
  menu: MenuItem[];
  categorias: Categoria[];
}) {
  const { agregar, cantidadTotal } = useCarrito();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  useEffect(() => {
    setUsuario(obtenerUsuario());
  }, []);
  function salir() {
    borrarToken();
    setUsuario(null);
    window.location.reload();
  }
  const [detalle, setDetalle] = useState<Producto | null>(null);
  const [lista, setLista] = useState<Producto[]>(productos);
  const [texto, setTexto] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [idioma, setIdioma] = useState("");
  const [orden, setOrden] = useState("");
  const [buscando, setBuscando] = useState(false);

  async function aplicarFiltros() {
    setBuscando(true);
    const params = new URLSearchParams();
    if (texto) params.set("texto", texto);
    if (categoriaId) params.set("categoriaId", categoriaId);
    if (idioma) params.set("idioma", idioma);
    if (orden) params.set("orden", orden);
    try {
      const res = await api<Producto[]>(`/products/buscar?${params.toString()}`);
      setLista(res);
    } catch {
      setLista([]);
    } finally {
      setBuscando(false);
    }
  }

  function limpiarFiltros() {
    setTexto("");
    setCategoriaId("");
    setIdioma("");
    setOrden("");
    setLista(productos);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="px-6 py-4 flex justify-between items-center relative z-30"
        style={{
          backgroundColor: config.colorHeader,
          color: config.colorHeaderTexto,
        }}
      >
        <h1 className="font-bold text-xl">{config.nombreSitio}</h1>
        <div className="flex items-center gap-5">
          <Link
            href="/checkout"
            className="px-4 py-2 rounded font-medium inline-flex items-center gap-2"
            style={{ backgroundColor: config.colorMarca, color: "#fff" }}
          >
            &#128722; Carrito ({cantidadTotal})
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

      {menu.length > 0 && (
        <nav
          className="px-6 flex gap-1 text-sm relative z-30 shadow-sm"
          style={{
            backgroundColor: config.colorHeader,
            color: config.colorHeaderTexto,
          }}
        >
          {menu.map((item) => (
            <div key={item.id} className="relative group">
              <Link
                href={item.enlace}
                className="px-4 py-3 hover:bg-black/20 inline-flex items-center gap-1"
              >
                {item.texto}
                {item.hijos.length > 0 && (
                  <span className="text-xs opacity-70">&#9662;</span>
                )}
              </Link>
              {item.hijos.length > 0 && (
                <div className="absolute left-0 top-full hidden group-hover:block bg-white text-gray-800 rounded-b shadow-xl min-w-44 z-40 overflow-hidden">
                  {item.hijos.map((h) => (
                    <Link
                      key={h.id}
                      href={h.enlace}
                      className="block px-4 py-2.5 hover:bg-gray-100 border-b last:border-0"
                    >
                      {h.texto}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}

      {banners.length > 0 && (
        <Carrusel banners={banners} colorMarca={config.colorMarca} />
      )}

      <main className="p-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-40">
            <label className="block text-xs text-gray-500 mb-1">Buscar</label>
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Nombre o descripcion"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Categoria</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">Todas</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Idioma</label>
            <select
              value={idioma}
              onChange={(e) => setIdioma(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="Español">Español</option>
              <option value="Inglés">Inglés</option>
              <option value="Japonés">Japonés</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Orden</label>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">Relevancia</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
              <option value="nombre">Nombre A-Z</option>
            </select>
          </div>
          <button
            onClick={aplicarFiltros}
            disabled={buscando}
            className="text-white px-5 py-2 rounded text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: config.colorMarca }}
          >
            {buscando ? "Buscando..." : "Filtrar"}
          </button>
          <button
            onClick={limpiarFiltros}
            className="border px-4 py-2 rounded text-sm text-gray-600"
          >
            Limpiar
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Productos ({lista.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {lista.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col border border-gray-100"
            >
              <button
                onClick={() => setDetalle(p)}
                className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
              >
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
                    style={{ background: `linear-gradient(135deg, ${config.colorMarca}, ${config.colorMarca}cc)` }}
                  >
                    {p.nombre.charAt(0)}
                  </div>
                )}
              </button>
              <button
                onClick={() => setDetalle(p)}
                className="text-left font-semibold text-lg text-gray-900 hover:underline"
              >
                {p.nombre}
              </button>
              <p className="text-gray-500 text-sm flex-1 mt-1 line-clamp-2">
                {p.descripcion || "Sin descripcion"}
              </p>
              <p
                className="font-bold text-2xl mt-4"
                style={{ color: config.colorMarca }}
              >
                ${p.precio.toLocaleString("es-CL")}
              </p>
              <p className="text-xs text-gray-400 mb-4">
                {p.stock > 0 ? `${p.stock} disponibles` : "Agotado"}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDetalle(p)}
                  className="flex-1 border py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Ver
                </button>
                <button
                  onClick={() =>
                    agregar({
                      productoId: p.id,
                      nombre: p.nombre,
                      precio: p.precio,
                    })
                  }
                  disabled={p.stock < 1}
                  className="flex-1 text-white py-2.5 rounded-lg font-medium disabled:opacity-40"
                  style={{ backgroundColor: config.colorMarca }}
                >
                  {p.stock < 1 ? "Sin stock" : "Agregar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {detalle && (
        <ModalDetalle
          producto={detalle}
          colorMarca={config.colorMarca}
          onCerrar={() => setDetalle(null)}
          onAgregar={() => {
            agregar({
              productoId: detalle.id,
              nombre: detalle.nombre,
              precio: detalle.precio,
            });
          }}
        />
      )}
    </div>
  );
}

function ModalDetalle({
  producto,
  colorMarca,
  onCerrar,
  onAgregar,
}: {
  producto: Producto;
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

  // Cerrar con Escape
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
          {/* Imagen + miniaturas */}
          <div className="bg-gray-100 flex flex-col">
            <div className="relative aspect-square flex items-center justify-center overflow-hidden">
              {imagenes.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${API_BASE}${imagenes[imgActual].url}`}
                  alt={producto.nombre}
                  className={`w-full h-full object-cover transition ${
                    agotado ? "grayscale opacity-60" : ""
                  }`}
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center text-white text-7xl font-bold ${
                    agotado ? "grayscale opacity-60" : ""
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${colorMarca}, ${colorMarca}cc)`,
                  }}
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
                  <button
                    onClick={prevImg}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full hover:bg-black/60 flex items-center justify-center"
                    aria-label="Imagen anterior"
                  >
                    &lt;
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full hover:bg-black/60 flex items-center justify-center"
                    aria-label="Imagen siguiente"
                  >
                    &gt;
                  </button>
                  <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                    {imgActual + 1} / {imagenes.length}
                  </span>
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
                    style={{
                      borderColor: i === imgActual ? colorMarca : "transparent",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${API_BASE}${img.url}`}
                      alt=""
                      className={`w-full h-full object-cover ${
                        agotado ? "grayscale opacity-60" : ""
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 relative">
            <button
              onClick={onCerrar}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl leading-none"
            >
              &times;
            </button>

            <div className="flex flex-wrap gap-2 mb-3 pr-8">
              {categorias.map((c) => (
                <span
                  key={c.id}
                  className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700"
                >
                  {c.nombre}
                </span>
              ))}
              {secciones.map((s) => (
                <span
                  key={`s-${s.id}`}
                  className="text-xs px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: colorMarca }}
                >
                  {s.nombre}
                </span>
              ))}
              {producto.idioma && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  {producto.idioma}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              {producto.nombre}
            </h2>
            <p
              className="text-3xl font-bold mt-3"
              style={{ color: colorMarca }}
            >
              ${producto.precio.toLocaleString("es-CL")}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {producto.stock > 0
                ? `${producto.stock} disponibles`
                : "Agotado"}
            </p>
            {producto.idioma && (
              <p className="text-sm text-gray-500 mt-1">
                Idioma: <span className="font-medium text-gray-700">{producto.idioma}</span>
              </p>
            )}
            <p className="text-gray-700 mt-4 whitespace-pre-wrap leading-relaxed">
              {producto.descripcion || "Sin descripcion."}
            </p>

            <button
              onClick={agregar}
              disabled={producto.stock < 1}
              className="w-full mt-6 text-white py-3 rounded-lg font-medium disabled:opacity-40"
              style={{ backgroundColor: colorMarca }}
            >
              {producto.stock < 1
                ? "Sin stock"
                : agregado
                  ? "Agregado al carrito!"
                  : "Agregar al carrito"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Carrusel({
  banners,
  colorMarca,
}: {
  banners: Banner[];
  colorMarca: string;
}) {
  const [actual, setActual] = useState(0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => {
      setActual((a) => (a + 1) % banners.length);
    }, 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const b = banners[actual];
  const sinImagen = imgError[b.id];

  return (
    <div className="relative w-full h-48 md:h-56 overflow-hidden">
      {sinImagen ? (
        <div
          className="w-full h-full"
          style={{
            background: `linear-gradient(135deg, ${colorMarca}, ${colorMarca}dd)`,
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${API_BASE}${b.imagen}`}
          alt={b.titulo || "banner"}
          className="w-full h-full object-cover"
          onError={() => setImgError((e) => ({ ...e, [b.id]: true }))}
        />
      )}
      {(b.titulo || b.subtitulo) && (
        <div className="absolute inset-0 bg-black/25 flex flex-col justify-center items-center text-white text-center px-4">
          {b.titulo && (
            <h2 className="text-2xl md:text-4xl font-bold drop-shadow">
              {b.titulo}
            </h2>
          )}
          {b.subtitulo && (
            <p className="mt-2 text-base md:text-lg drop-shadow">
              {b.subtitulo}
            </p>
          )}
        </div>
      )}
      {banners.length > 1 && (
        <>
          <button
            onClick={() =>
              setActual((a) => (a - 1 + banners.length) % banners.length)
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full hover:bg-black/60"
          >
            &lt;
          </button>
          <button
            onClick={() => setActual((a) => (a + 1) % banners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full hover:bg-black/60"
          >
            &gt;
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setActual(i)}
                className={`w-2 h-2 rounded-full ${
                  i === actual ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}