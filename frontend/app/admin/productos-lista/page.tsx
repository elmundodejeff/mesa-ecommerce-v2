"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  descripcion: string | null;
  idioma?: string | null;
}

const IDIOMAS = ["Español", "Inglés", "Japonés", "Otro"];

export default function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [idioma, setIdioma] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function cargar() {
    try {
      const data = await api<Producto[]>("/products");
      setProductos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await api("/products", {
        method: "POST",
        auth: true,
        body: {
          nombre,
          precio: Number(precio),
          stock: Number(stock),
          descripcion: descripcion || undefined,
          idioma: idioma || undefined,
        },
      });
      setNombre("");
      setPrecio("");
      setStock("");
      setDescripcion("");
      setIdioma("");
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear");
    } finally {
      setCargando(false);
    }
  }

  async function eliminar(id: number) {
    if (!confirm("Eliminar este producto?")) return;
    try {
      await api(`/products/${id}`, { method: "DELETE", auth: true });
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Productos</h1>

      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Nuevo producto</h2>
        <form onSubmit={crear} className="grid grid-cols-2 gap-4">
          <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="Precio"
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="Stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
          <select
            value={idioma}
            onChange={(e) => setIdioma(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">Idioma (opcional)</option>
            {IDIOMAS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <input
            placeholder="Descripcion (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="border rounded px-3 py-2 col-span-2"
          />
          <div className="col-span-2">
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            <button
              type="submit"
              disabled={cargando}
              className="bg-emerald-700 text-white px-6 py-2 rounded hover:bg-emerald-800 disabled:opacity-50"
            >
              {cargando ? "Guardando..." : "Crear producto"}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Productos ({productos.length})
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">ID</th>
              <th className="py-2">Nombre</th>
              <th className="py-2">Precio</th>
              <th className="py-2">Stock</th>
              <th className="py-2">Idioma</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="py-2">{p.id}</td>
                <td className="py-2">{p.nombre}</td>
                <td className="py-2">${p.precio.toLocaleString("es-CL")}</td>
                <td className="py-2">{p.stock}</td>
                <td className="py-2">{p.idioma || "-"}</td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => eliminar(p.id)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}