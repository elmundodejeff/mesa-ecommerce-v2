"use client";

import { useEffect, useState } from "react";
import { api, apiUpload } from "@/lib/api";

interface Rel { id: number; nombre: string; }

interface Imagen { id: number; url: string; orden: number; }

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  descripcion: string | null;
  idioma?: string | null;
  categorias?: Rel[];
  secciones?: Rel[];
  imagenes?: Imagen[];
}

const IDIOMAS = ["Español", "Inglés", "Japonés", "Otro"];

export default function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Rel[]>([]);
  const [secciones, setSecciones] = useState<Rel[]>([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [idioma, setIdioma] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);

  async function cargar() {
    try {
      const [prods, cats, secs] = await Promise.all([
        api<Producto[]>("/products"),
        api<Rel[]>("/categories"),
        api<Rel[]>("/sections"),
      ]);
      setProductos(prods);
      setCategorias(cats);
      setSecciones(secs);
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
          <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="border rounded px-3 py-2" />
          <input placeholder="Precio" type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} required className="border rounded px-3 py-2" />
          <input placeholder="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required className="border rounded px-3 py-2" />
          <select value={idioma} onChange={(e) => setIdioma(e.target.value)} className="border rounded px-3 py-2">
            <option value="">Idioma (opcional)</option>
            {IDIOMAS.map((i) => (<option key={i} value={i}>{i}</option>))}
          </select>
          <input placeholder="Descripcion (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="border rounded px-3 py-2 col-span-2" />
          <div className="col-span-2">
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            <button type="submit" disabled={cargando} className="bg-emerald-700 text-white px-6 py-2 rounded hover:bg-emerald-800 disabled:opacity-50">
              {cargando ? "Guardando..." : "Crear producto"}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Productos ({productos.length})</h2>
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
                <td className="py-2 text-right space-x-3">
                  <button onClick={() => setEditando(p)} className="text-emerald-700 hover:underline">Editar</button>
                  <button onClick={() => eliminar(p.id)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {editando && (
        <ModalEditar
          producto={editando}
          categorias={categorias}
          secciones={secciones}
          onCerrar={() => setEditando(null)}
          onGuardado={async () => { setEditando(null); await cargar(); }}
        />
      )}
    </div>
  );
}

function ModalEditar({
  producto,
  categorias,
  secciones,
  onCerrar,
  onGuardado,
}: {
  producto: Producto;
  categorias: Rel[];
  secciones: Rel[];
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [nombre, setNombre] = useState(producto.nombre);
  const [precio, setPrecio] = useState(String(producto.precio));
  const [stock, setStock] = useState(String(producto.stock));
  const [descripcion, setDescripcion] = useState(producto.descripcion || "");
  const [idioma, setIdioma] = useState(producto.idioma || "");
  const [catIds, setCatIds] = useState<number[]>((producto.categorias || []).map((c) => c.id));
  const [secIds, setSecIds] = useState<number[]>((producto.secciones || []).map((s) => s.id));
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  function toggle(arr: number[], set: (v: number[]) => void, id: number) {
    if (arr.includes(id)) set(arr.filter((x) => x !== id));
    else set([...arr, id]);
  }

  async function guardar() {
    setError("");
    setGuardando(true);
    try {
      await api(`/products/${producto.id}`, {
        method: "PATCH",
        auth: true,
        body: {
          nombre,
          precio: Number(precio),
          stock: Number(stock),
          descripcion: descripcion || undefined,
          idioma: idioma || undefined,
          categoriaIds: catIds,
          seccionIds: secIds,
        },
      });
      onGuardado();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onCerrar}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Editar: {producto.nombre}</h2>
        <div className="space-y-3">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className="w-full border rounded px-3 py-2" />
          <div className="grid grid-cols-2 gap-3">
            <input value={precio} onChange={(e) => setPrecio(e.target.value)} type="number" placeholder="Precio" className="border rounded px-3 py-2" />
            <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" placeholder="Stock" className="border rounded px-3 py-2" />
          </div>
          <select value={idioma} onChange={(e) => setIdioma(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="">Idioma (opcional)</option>
            {IDIOMAS.map((i) => (<option key={i} value={i}>{i}</option>))}
          </select>
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripcion" rows={3} className="w-full border rounded px-3 py-2" />

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Categorias</p>
            <div className="flex flex-wrap gap-2">
              {categorias.map((c) => (
                <button key={c.id} type="button" onClick={() => toggle(catIds, setCatIds, c.id)} className={`text-sm px-3 py-1 rounded-full border ${catIds.includes(c.id) ? "bg-emerald-700 text-white border-emerald-700" : "text-gray-600"}`}>
                  {c.nombre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Secciones</p>
            <div className="flex flex-wrap gap-2">
              {secciones.map((s) => (
                <button key={s.id} type="button" onClick={() => toggle(secIds, setSecIds, s.id)} className={`text-sm px-3 py-1 rounded-full border ${secIds.includes(s.id) ? "bg-emerald-700 text-white border-emerald-700" : "text-gray-600"}`}>
                  {s.nombre}
                </button>
              ))}
            </div>
          </div>

          <SeccionImagenes producto={producto} onCambio={() => {}} />

          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={guardar} disabled={guardando} className="flex-1 bg-emerald-700 text-white py-2 rounded hover:bg-emerald-800 disabled:opacity-50">
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
            <button onClick={onCerrar} className="px-6 border rounded text-gray-600">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function SeccionImagenes({
  producto,
  onCambio,
}: {
  producto: Producto;
  onCambio: () => void;
}) {
  const [imagenes, setImagenes] = useState<Imagen[]>(producto.imagenes || []);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  async function refrescar() {
    try {
      const actualizado = await api<Producto>(`/products/${producto.id}`);
      setImagenes(actualizado.imagenes || []);
      onCambio();
    } catch {
      // silencioso: el listado principal se recarga igual al cerrar
    }
  }

  async function subir(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError("");
    setSubiendo(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("imagenes", f));
      await apiUpload(`/products/${producto.id}/imagenes`, fd);
      await refrescar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  }

  async function borrar(imagenId: number) {
    if (!confirm("Eliminar esta imagen?")) return;
    setError("");
    try {
      await api(`/products/imagenes/${imagenId}`, { method: "DELETE", auth: true });
      await refrescar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al borrar");
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Imagenes</p>
      {imagenes.length > 0 ? (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {imagenes.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={`${API_BASE}${img.url}`}
                alt=""
                className="w-full h-20 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => borrar(img.id)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                title="Eliminar"
              >
                x
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 mb-3">Sin imagenes aun.</p>
      )}
      <label className="inline-block cursor-pointer text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded border">
        {subiendo ? "Subiendo..." : "+ Agregar imagenes"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={subir}
          disabled={subiendo}
          className="hidden"
        />
      </label>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}