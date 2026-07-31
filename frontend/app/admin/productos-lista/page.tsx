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
  preventa?: boolean;
  fechaLanzamiento?: string | null;
  textoPreventa?: string | null;
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
  const [preventa, setPreventa] = useState(false);
  const [fechaLanzamiento, setFechaLanzamiento] = useState("");
  const [textoPreventa, setTextoPreventa] = useState("");
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
          preventa,
          fechaLanzamiento: preventa && fechaLanzamiento ? fechaLanzamiento : undefined,
          textoPreventa: preventa && textoPreventa ? textoPreventa : undefined,
        },
      });
      setNombre("");
      setPrecio("");
      setStock("");
      setDescripcion("");
      setIdioma("");
      setPreventa(false);
      setFechaLanzamiento("");
      setTextoPreventa("");
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
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Productos</h1>
          <p className="admin-subtitle">Gestiona el catálogo de la tienda</p>
        </div>
      </div>

      <section className="admin-card">
        <h2 className="admin-card-title">Nuevo producto</h2>
        <form onSubmit={crear} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Nombre</label>
            <input placeholder="Ej: Catan" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Precio</label>
            <input placeholder="0" type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} required className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Stock</label>
            <input placeholder="0" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Idioma (opcional)</label>
            <select value={idioma} onChange={(e) => setIdioma(e.target.value)} className="admin-input">
              <option value="">Sin especificar</option>
              {IDIOMAS.map((i) => (<option key={i} value={i}>{i}</option>))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Descripción (opcional)</label>
            <input placeholder="Breve descripción del producto" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="admin-input" />
          </div>
          <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={preventa} onChange={(e) => setPreventa(e.target.checked)} className="w-4 h-4 accent-[var(--color-marca)]" />
              <span className="text-sm font-medium text-gray-700">Es preventa</span>
            </label>
            {preventa && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="admin-label">Fecha de lanzamiento</label>
                  <input type="date" value={fechaLanzamiento} onChange={(e) => setFechaLanzamiento(e.target.value)} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Texto de preventa</label>
                  <input placeholder="Reserva ahora, llega el..." value={textoPreventa} onChange={(e) => setTextoPreventa(e.target.value)} className="admin-input" />
                </div>
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            <button type="submit" disabled={cargando} className="btn-primario">
              {cargando ? "Guardando..." : "Crear producto"}
            </button>
          </div>
        </form>
      </section>

      <section className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="admin-card-title mb-0">Productos</h2>
          <span className="admin-badge">{productos.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Idioma</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td className="text-gray-400">{p.id}</td>
                  <td className="font-medium text-gray-800">{p.nombre}</td>
                  <td>${p.precio.toLocaleString("es-CL")}</td>
                  <td>{p.stock}</td>
                  <td>{p.idioma || "-"}</td>
                  <td className="text-right space-x-4 whitespace-nowrap">
                    <button onClick={() => setEditando(p)} className="link-accion">Editar</button>
                    <button onClick={() => eliminar(p.id)} className="link-peligro">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    </>
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
  const [preventa, setPreventa] = useState(producto.preventa || false);
  const [fechaLanzamiento, setFechaLanzamiento] = useState(
    producto.fechaLanzamiento ? producto.fechaLanzamiento.slice(0, 10) : ""
  );
  const [textoPreventa, setTextoPreventa] = useState(producto.textoPreventa || "");
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
          preventa,
          fechaLanzamiento: preventa && fechaLanzamiento ? fechaLanzamiento : undefined,
          textoPreventa: preventa && textoPreventa ? textoPreventa : undefined,
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
        <h2 className="admin-card-title">Editar: {producto.nombre}</h2>
        <div className="space-y-3">
          <div>
            <label className="admin-label">Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className="admin-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="admin-label">Precio</label>
              <input value={precio} onChange={(e) => setPrecio(e.target.value)} type="number" placeholder="Precio" className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Stock</label>
              <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" placeholder="Stock" className="admin-input" />
            </div>
          </div>
          <div>
            <label className="admin-label">Idioma</label>
            <select value={idioma} onChange={(e) => setIdioma(e.target.value)} className="admin-input">
              <option value="">Sin especificar</option>
              {IDIOMAS.map((i) => (<option key={i} value={i}>{i}</option>))}
            </select>
          </div>
          <div>
            <label className="admin-label">Descripción</label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción" rows={3} className="admin-input" />
          </div>

          <div>
            <p className="admin-label">Categorías</p>
            <div className="flex flex-wrap gap-2">
              {categorias.map((c) => (
                <button key={c.id} type="button" onClick={() => toggle(catIds, setCatIds, c.id)} className={`text-sm px-3 py-1 rounded-full border transition ${catIds.includes(c.id) ? "text-white bg-marca border-marca" : "text-gray-600 border-gray-300"}`}>
                  {c.nombre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="admin-label">Secciones</p>
            <div className="flex flex-wrap gap-2">
              {secciones.map((s) => (
                <button key={s.id} type="button" onClick={() => toggle(secIds, setSecIds, s.id)} className={`text-sm px-3 py-1 rounded-full border transition ${secIds.includes(s.id) ? "text-white bg-marca border-marca" : "text-gray-600 border-gray-300"}`}>
                  {s.nombre}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={preventa} onChange={(e) => setPreventa(e.target.checked)} className="w-4 h-4 accent-[var(--color-marca)]" />
              <span className="text-sm font-medium text-gray-700">Es preventa</span>
            </label>
            {preventa && (
              <div className="space-y-3 mt-3">
                <div>
                  <label className="admin-label">Fecha de lanzamiento</label>
                  <input type="date" value={fechaLanzamiento} onChange={(e) => setFechaLanzamiento(e.target.value)} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Texto de preventa</label>
                  <input placeholder="Reserva ahora, llega el..." value={textoPreventa} onChange={(e) => setTextoPreventa(e.target.value)} className="admin-input" />
                </div>
              </div>
            )}
          </div>

          <SeccionImagenes producto={producto} onCambio={() => {}} />

          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={guardar} disabled={guardando} className="btn-primario flex-1">
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
            <button onClick={onCerrar} className="btn-secundario">Cancelar</button>
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
      // silencioso
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
      <p className="admin-label">Imágenes</p>
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
        <p className="text-sm text-gray-400 mb-3">Sin imágenes aun.</p>
      )}
      <label className="btn-secundario cursor-pointer">
        {subiendo ? "Subiendo..." : "+ Agregar imágenes"}
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