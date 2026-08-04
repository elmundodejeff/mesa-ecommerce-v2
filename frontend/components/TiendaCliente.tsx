"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import CardProducto from "./CardProducto";
import type { ProductoCard } from "./CardProducto";
import ModalDetalle from "./ModalDetalle";
import CarritoLateral from "./CarritoLateral";
import CarritoMovil from "./CarritoMovil";
import type { Config } from "@/lib/config";
import type { Categoria } from "@/app/page";

export default function TiendaCliente({
  config,
  productos,
  categorias,
  titulo = "Tienda",
}: {
  config: Config;
  productos: ProductoCard[];
  categorias: Categoria[];
  titulo?: string;
}) {
  const [detalle, setDetalle] = useState<ProductoCard | null>(null);
  const [lista, setLista] = useState<ProductoCard[]>(productos);
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
      const res = await api<ProductoCard[]>(`/products/buscar?${params.toString()}`);
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
      <main className="p-6 max-w-7xl mx-auto py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{titulo}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div>
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
            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="">Todas</option>
              {categorias.map((c) => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Idioma</label>
            <select value={idioma} onChange={(e) => setIdioma(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="">Todos</option>
              <option value="Español">Español</option>
              <option value="Inglés">Inglés</option>
              <option value="Japonés">Japonés</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Orden</label>
            <select value={orden} onChange={(e) => setOrden(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="">Relevancia</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
              <option value="nombre">Nombre A-Z</option>
            </select>
          </div>
          <button onClick={aplicarFiltros} disabled={buscando} className="text-white px-5 py-2 text-sm font-medium btn-pill" style={{ backgroundColor: config.colorMarca }}>
            {buscando ? "Buscando..." : "Filtrar"}
          </button>
          <button onClick={limpiarFiltros} className="border px-4 py-2 rounded-full text-sm text-gray-600 btn-pill">
            Limpiar
          </button>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 mb-6">Productos ({lista.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {lista.map((p) => (
            <CardProducto key={p.id} producto={p} colorMarca={config.colorMarca} onVer={setDetalle} />
          ))}
        </div>
        </div>
        <div className="hidden lg:block">
          <CarritoLateral colorMarca={config.colorMarca} />
        </div>
        </div>
      </main>

      {detalle && (
        <ModalDetalle
          producto={detalle}
          colorMarca={config.colorMarca}
          onCerrar={() => setDetalle(null)}
        />
      )}
      <CarritoMovil colorMarca={config.colorMarca} />
      {/* Espacio para que la barra movil no tape contenido */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}