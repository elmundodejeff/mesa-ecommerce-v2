"use client";
import { useState } from "react";
import { api, apiUpload } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const ICONOS_DISPONIBLES = [
  "truck", "shield-check", "gift", "message-heart", "cards",
  "dice-5", "puzzle", "users-group", "tools", "flame", "star", "tag",
];

interface TrustItem { icono: string; texto: string; }
interface CategoriaItem { nombre: string; icono: string; enlace: string; imagen?: string; }
interface BloquesData {
  trustBar?: { visible: boolean; orden: number; items: TrustItem[] };
  categorias?: { visible: boolean; orden: number; titulo: string; items: CategoriaItem[] };
  editorial?: { visible: boolean; orden: number; titulo: string; subtitulo: string; imagen: string; enlace: string; textoBoton: string };
  descuento?: { visible: boolean; orden: number; texto: string; codigo: string };
}

const VACIO: Required<BloquesData> = {
  trustBar: { visible: true, orden: -1, items: [] },
  categorias: { visible: true, orden: 0, titulo: "¿Qué quieres jugar hoy?", items: [] },
  editorial: { visible: true, orden: 1, titulo: "", subtitulo: "", imagen: "", enlace: "/tienda", textoBoton: "Ver más" },
  descuento: { visible: true, orden: 2, texto: "", codigo: "" },
};

export default function EditorBloquesHome({ inicial }: { inicial: BloquesData }) {
  const [data, setData] = useState<Required<BloquesData>>({
    trustBar: { ...VACIO.trustBar, ...inicial.trustBar },
    categorias: { ...VACIO.categorias, ...inicial.categorias },
    editorial: { ...VACIO.editorial, ...inicial.editorial },
    descuento: { ...VACIO.descuento, ...inicial.descuento },
  });
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [subiendoCat, setSubiendoCat] = useState<number | null>(null);

  function marcarCambio() { setGuardado(false); }

  async function guardar() {
    setError("");
    setCargando(true);
    try {
      await api("/content/config", {
        method: "PATCH",
        auth: true,
        body: { bloquesHome: data },
      });
      setGuardado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setCargando(false);
    }
  }

  async function subirImagenEditorial(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append("imagen", f);
      const res = await apiUpload<{ url: string }>("/content/upload", fd);
      setData((d) => ({ ...d, editorial: { ...d.editorial, imagen: res.url } }));
      marcarCambio();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  }

  async function subirImagenCategoria(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const f = e.target.files?.[0];
    if (!f) return;
    setSubiendoCat(idx);
    try {
      const fd = new FormData();
      fd.append("imagen", f);
      const res = await apiUpload<{ url: string }>("/content/upload", fd);
      const items = [...data.categorias.items];
      items[idx] = { ...items[idx], imagen: res.url };
      setData((d) => ({ ...d, categorias: { ...d.categorias, items } }));
      marcarCambio();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setSubiendoCat(null);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Bloques de la home. Cada uno tiene un número de orden: los bloques y las secciones de producto
        se intercalan de menor a mayor. Ej: usa -1 para que la franja de confianza vaya arriba de todo.
      </p>

      {/* TRUST BAR */}
      <BloqueWrap
        titulo="Franja de confianza"
        visible={data.trustBar.visible}
        orden={data.trustBar.orden}
        onVisible={(v) => { setData((d) => ({ ...d, trustBar: { ...d.trustBar, visible: v } })); marcarCambio(); }}
        onOrden={(o) => { setData((d) => ({ ...d, trustBar: { ...d.trustBar, orden: o } })); marcarCambio(); }}
      >
        <div className="space-y-3">
          {data.trustBar.items.map((it, i) => (
            <div key={i} className="flex flex-wrap gap-2 items-end border border-gray-100 rounded-lg p-3">
              <div className="w-40">
                <label className="admin-label">Ícono</label>
                <select
                  value={it.icono}
                  onChange={(e) => {
                    const items = [...data.trustBar.items];
                    items[i] = { ...items[i], icono: e.target.value };
                    setData((d) => ({ ...d, trustBar: { ...d.trustBar, items } })); marcarCambio();
                  }}
                  className="admin-input"
                >
                  {ICONOS_DISPONIBLES.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="admin-label">Texto</label>
                <input
                  value={it.texto}
                  onChange={(e) => {
                    const items = [...data.trustBar.items];
                    items[i] = { ...items[i], texto: e.target.value };
                    setData((d) => ({ ...d, trustBar: { ...d.trustBar, items } })); marcarCambio();
                  }}
                  placeholder="Ej: Envío a todo Chile"
                  className="admin-input"
                />
              </div>
              <button
                onClick={() => {
                  const items = data.trustBar.items.filter((_, x) => x !== i);
                  setData((d) => ({ ...d, trustBar: { ...d.trustBar, items } })); marcarCambio();
                }}
                className="link-peligro pb-2 shrink-0"
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const items = [...data.trustBar.items, { icono: "star", texto: "" }];
              setData((d) => ({ ...d, trustBar: { ...d.trustBar, items } })); marcarCambio();
            }}
            className="btn-secundario text-sm"
          >
            + Agregar item
          </button>
        </div>
      </BloqueWrap>

      {/* CATEGORIAS */}
      <BloqueWrap
        titulo="Círculos de categoría"
        visible={data.categorias.visible}
        orden={data.categorias.orden}
        onVisible={(v) => { setData((d) => ({ ...d, categorias: { ...d.categorias, visible: v } })); marcarCambio(); }}
        onOrden={(o) => { setData((d) => ({ ...d, categorias: { ...d.categorias, orden: o } })); marcarCambio(); }}
      >
        <div className="space-y-3">
          <div>
            <label className="admin-label">Título de la sección</label>
            <input
              value={data.categorias.titulo}
              onChange={(e) => { setData((d) => ({ ...d, categorias: { ...d.categorias, titulo: e.target.value } })); marcarCambio(); }}
              className="admin-input"
            />
          </div>
          {data.categorias.items.map((cat, i) => {
            const preview = cat.imagen
              ? (cat.imagen.startsWith("http") ? cat.imagen : `${API_BASE}${cat.imagen}`)
              : "";
            return (
              <div key={i} className="flex flex-wrap gap-3 items-end border border-gray-100 rounded-lg p-3">
                <div className="shrink-0">
                  <label className="admin-label">Vista</label>
                  <div className="w-12 h-12 rounded-full border-2 overflow-hidden flex items-center justify-center bg-gray-50" style={{ borderColor: "var(--color-marca)" }}>
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-400">ícono</span>
                    )}
                  </div>
                </div>
                <div className="w-28">
                  <label className="admin-label">Ícono</label>
                  <select
                    value={cat.icono}
                    onChange={(e) => {
                      const items = [...data.categorias.items];
                      items[i] = { ...items[i], icono: e.target.value };
                      setData((d) => ({ ...d, categorias: { ...d.categorias, items } })); marcarCambio();
                    }}
                    className="admin-input"
                    disabled={!!cat.imagen}
                  >
                    {ICONOS_DISPONIBLES.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                </div>
                <div className="w-32">
                  <label className="admin-label">Nombre</label>
                  <input
                    value={cat.nombre}
                    onChange={(e) => {
                      const items = [...data.categorias.items];
                      items[i] = { ...items[i], nombre: e.target.value };
                      setData((d) => ({ ...d, categorias: { ...d.categorias, items } })); marcarCambio();
                    }}
                    placeholder="TCG"
                    className="admin-input"
                  />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className="admin-label">Enlace</label>
                  <input
                    value={cat.enlace}
                    onChange={(e) => {
                      const items = [...data.categorias.items];
                      items[i] = { ...items[i], enlace: e.target.value };
                      setData((d) => ({ ...d, categorias: { ...d.categorias, items } })); marcarCambio();
                    }}
                    placeholder="/tienda/categoria/TCG"
                    className="admin-input"
                  />
                </div>
                <label className="btn-secundario cursor-pointer shrink-0">
                  {subiendoCat === i ? "..." : cat.imagen ? "Cambiar" : "Subir img"}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => subirImagenCategoria(e, i)} disabled={subiendoCat === i} className="hidden" />
                </label>
                {cat.imagen && (
                  <button
                    onClick={() => {
                      const items = [...data.categorias.items];
                      items[i] = { ...items[i], imagen: "" };
                      setData((d) => ({ ...d, categorias: { ...d.categorias, items } })); marcarCambio();
                    }}
                    className="link-peligro pb-2 shrink-0"
                  >
                    Quitar img
                  </button>
                )}
                <button
                  onClick={() => {
                    const items = data.categorias.items.filter((_, x) => x !== i);
                    setData((d) => ({ ...d, categorias: { ...d.categorias, items } })); marcarCambio();
                  }}
                  className="link-peligro pb-2 shrink-0"
                >
                  Quitar
                </button>
              </div>
            );
          })}
          <button
            onClick={() => {
              const items = [...data.categorias.items, { nombre: "", icono: "cards", enlace: "/tienda/categoria/" }];
              setData((d) => ({ ...d, categorias: { ...d.categorias, items } })); marcarCambio();
            }}
            className="btn-secundario text-sm"
          >
            + Agregar categoría
          </button>
        </div>
      </BloqueWrap>

      {/* EDITORIAL */}
      <BloqueWrap
        titulo="Banner editorial"
        visible={data.editorial.visible}
        orden={data.editorial.orden}
        onVisible={(v) => { setData((d) => ({ ...d, editorial: { ...d.editorial, visible: v } })); marcarCambio(); }}
        onOrden={(o) => { setData((d) => ({ ...d, editorial: { ...d.editorial, orden: o } })); marcarCambio(); }}
      >
        <div className="space-y-3">
          <div>
            <label className="admin-label">Título</label>
            <input value={data.editorial.titulo} onChange={(e) => { setData((d) => ({ ...d, editorial: { ...d.editorial, titulo: e.target.value } })); marcarCambio(); }} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Subtítulo</label>
            <input value={data.editorial.subtitulo} onChange={(e) => { setData((d) => ({ ...d, editorial: { ...d.editorial, subtitulo: e.target.value } })); marcarCambio(); }} className="admin-input" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="admin-label">Enlace del botón</label>
              <input value={data.editorial.enlace} onChange={(e) => { setData((d) => ({ ...d, editorial: { ...d.editorial, enlace: e.target.value } })); marcarCambio(); }} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Texto del botón</label>
              <input value={data.editorial.textoBoton} onChange={(e) => { setData((d) => ({ ...d, editorial: { ...d.editorial, textoBoton: e.target.value } })); marcarCambio(); }} className="admin-input" />
            </div>
          </div>
          <div>
            <label className="admin-label">Imagen</label>
            <div className="flex items-center gap-4">
              {data.editorial.imagen ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.editorial.imagen.startsWith("http") ? data.editorial.imagen : `${API_BASE}${data.editorial.imagen}`} alt="" className="h-16 w-24 object-cover rounded border" />
              ) : (
                <div className="h-16 w-24 rounded border border-dashed flex items-center justify-center text-gray-300 text-xs">Sin imagen</div>
              )}
              <label className="btn-secundario cursor-pointer">
                {subiendo ? "Subiendo..." : "Subir imagen"}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={subirImagenEditorial} disabled={subiendo} className="hidden" />
              </label>
              {data.editorial.imagen && (
                <button onClick={() => { setData((d) => ({ ...d, editorial: { ...d.editorial, imagen: "" } })); marcarCambio(); }} className="link-peligro">Quitar</button>
              )}
            </div>
          </div>
        </div>
      </BloqueWrap>

      {/* DESCUENTO */}
      <BloqueWrap
        titulo="Franja de descuento"
        visible={data.descuento.visible}
        orden={data.descuento.orden}
        onVisible={(v) => { setData((d) => ({ ...d, descuento: { ...d.descuento, visible: v } })); marcarCambio(); }}
        onOrden={(o) => { setData((d) => ({ ...d, descuento: { ...d.descuento, orden: o } })); marcarCambio(); }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="admin-label">Texto</label>
            <input value={data.descuento.texto} onChange={(e) => { setData((d) => ({ ...d, descuento: { ...d.descuento, texto: e.target.value } })); marcarCambio(); }} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Código</label>
            <input value={data.descuento.codigo} onChange={(e) => { setData((d) => ({ ...d, descuento: { ...d.descuento, codigo: e.target.value.toUpperCase() } })); marcarCambio(); }} className="admin-input" />
          </div>
        </div>
      </BloqueWrap>

      <div className="flex items-center gap-4 pt-2">
        <button onClick={guardar} disabled={cargando} className="btn-primario">
          {cargando ? "Guardando..." : "Guardar bloques"}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {guardado && <p className="text-sm" style={{ color: "var(--color-marca)" }}>Guardado. Recarga la home para ver los cambios.</p>}
      </div>
    </div>
  );
}

function BloqueWrap({
  titulo,
  visible,
  orden,
  onVisible,
  onOrden,
  children,
}: {
  titulo: string;
  visible: boolean;
  orden: number;
  onVisible: (v: boolean) => void;
  onOrden: (o: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl p-4" style={{ border: "1px solid #eef0f2" }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h4 className="font-semibold text-gray-800">{titulo}</h4>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Orden
            <input
              type="number"
              value={orden}
              onChange={(e) => onOrden(Number(e.target.value))}
              className="admin-input w-16 py-1"
            />
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={visible} onChange={(e) => onVisible(e.target.checked)} className="w-4 h-4 accent-[var(--color-marca)]" />
            Visible
          </label>
        </div>
      </div>
      {children}
    </div>
  );
}