"use client";

import { useEffect, useState } from "react";
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

interface Seccion { id: number; nombre: string; orden: number; activa: boolean; }

type TipoBloque = "trustBar" | "categorias" | "editorial" | "descuento";

interface ItemLista {
  key: string;
  tipo: "seccion" | TipoBloque;
  nombre: string;
  orden: number;
  visible: boolean;
  seccionId?: number;
}

const ETIQUETA_BLOQUE: Record<TipoBloque, string> = {
  trustBar: "Franja de confianza",
  categorias: "Círculos de categoría",
  editorial: "Banner editorial",
  descuento: "Franja de descuento",
};

export default function AdminHome() {
  const [items, setItems] = useState<ItemLista[]>([]);
  const [bloques, setBloques] = useState<Required<BloquesData>>(VACIO);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [arrastrando, setArrastrando] = useState<number | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);

  async function cargar() {
    try {
      const [cfg, secs] = await Promise.all([
        api<{ bloquesHome?: BloquesData }>("/content/config"),
        api<Seccion[]>("/sections"),
      ]);
      const bh = cfg.bloquesHome || {};
      const merged: Required<BloquesData> = {
        trustBar: { ...VACIO.trustBar, ...bh.trustBar },
        categorias: { ...VACIO.categorias, ...bh.categorias },
        editorial: { ...VACIO.editorial, ...bh.editorial },
        descuento: { ...VACIO.descuento, ...bh.descuento },
      };
      setBloques(merged);
      construirLista(merged, secs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    }
  }

  function construirLista(bh: Required<BloquesData>, secs: Seccion[]) {
    const lista: ItemLista[] = [];
    secs.forEach((s) => {
      lista.push({ key: `sec-${s.id}`, tipo: "seccion", nombre: s.nombre, orden: s.orden, visible: s.activa, seccionId: s.id });
    });
    (["trustBar", "categorias", "editorial", "descuento"] as TipoBloque[]).forEach((t) => {
      lista.push({ key: t, tipo: t, nombre: ETIQUETA_BLOQUE[t], orden: bh[t].orden, visible: bh[t].visible });
    });
    lista.sort((a, b) => a.orden - b.orden);
    setItems(lista);
  }

  useEffect(() => { cargar(); }, []);

  function marcarCambio() { setGuardado(false); }

  // --- Drag ---
  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (arrastrando === null || arrastrando === idx) return;
    const nuevos = [...items];
    const [movido] = nuevos.splice(arrastrando, 1);
    nuevos.splice(idx, 0, movido);
    setArrastrando(idx);
    setItems(nuevos);
    marcarCambio();
  }

  function toggleVisible(idx: number) {
    const nuevos = [...items];
    nuevos[idx] = { ...nuevos[idx], visible: !nuevos[idx].visible };
    setItems(nuevos);
    marcarCambio();
  }

  async function crearSeccion(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    setError("");
    try {
      await api("/sections", { method: "POST", auth: true, body: { nombre: nuevoNombre.trim(), orden: items.length } });
      setNuevoNombre("");
      await cargar();
    } catch (e) { setError(e instanceof Error ? e.message : "Error"); }
  }

  async function renombrarSeccion(seccionId: number, nombreActual: string) {
    const nuevo = prompt("Nuevo nombre de la sección:", nombreActual);
    if (!nuevo || !nuevo.trim() || nuevo === nombreActual) return;
    try {
      await api(`/sections/${seccionId}`, { method: "PATCH", auth: true, body: { nombre: nuevo.trim() } });
      await cargar();
    } catch (e) { setError(e instanceof Error ? e.message : "Error"); }
  }

  async function eliminarSeccion(seccionId: number) {
    if (!confirm("Eliminar esta sección? Los productos no se borran.")) return;
    try {
      await api(`/sections/${seccionId}`, { method: "DELETE", auth: true });
      await cargar();
    } catch (e) { setError(e instanceof Error ? e.message : "Error"); }
  }

  // --- Editores de bloques (actualizan el estado bloques) ---
  function setBloque<T extends TipoBloque>(t: T, patch: Partial<Required<BloquesData>[T]>) {
    setBloques((b) => ({ ...b, [t]: { ...b[t], ...patch } }));
    marcarCambio();
  }

  async function subirImg(cb: (url: string) => void, e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const fd = new FormData();
      fd.append("imagen", f);
      const res = await apiUpload<{ url: string }>("/content/upload", fd);
      cb(res.url);
      marcarCambio();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      e.target.value = "";
    }
  }

  // --- Guardar ---
  async function guardar() {
    setError("");
    setCargando(true);
    try {
      const nuevoBloques: Required<BloquesData> = JSON.parse(JSON.stringify(bloques));
      const patches: Promise<unknown>[] = [];
      items.forEach((item, idx) => {
        if (item.tipo === "seccion" && item.seccionId != null) {
          patches.push(api(`/sections/${item.seccionId}`, { method: "PATCH", auth: true, body: { orden: idx, activa: item.visible } }));
        } else {
          const t = item.tipo as TipoBloque;
          nuevoBloques[t].orden = idx;
          nuevoBloques[t].visible = item.visible;
        }
      });
      await Promise.all([...patches, api("/content/config", { method: "PATCH", auth: true, body: { bloquesHome: nuevoBloques } })]);
      setBloques(nuevoBloques);
      setGuardado(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Home</h1>
          <p className="admin-subtitle">Ordena y configura todo lo que se muestra en la página de inicio</p>
        </div>
      </div>

      <div className="admin-card">
        <p className="text-sm text-gray-500 mb-4">
          Arrastra para reordenar. El orden de arriba hacia abajo es el orden real en la home.
        </p>

        <div className="space-y-2">
          {items.map((item, idx) => {
            const esSeccion = item.tipo === "seccion";
            const abierto = expandido === item.key;
            return (
              <div key={item.key} className="border rounded-xl bg-white" style={{ borderColor: "#eef0f2" }}>
                <div
                  draggable
                  onDragStart={() => setArrastrando(idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDragEnd={() => setArrastrando(null)}
                  className={`flex items-center gap-3 p-3 transition ${arrastrando === idx ? "opacity-50" : ""} ${!item.visible ? "opacity-60" : ""}`}
                  style={{ cursor: "grab" }}
                >
                  <span className="text-gray-300 select-none" title="Arrastrar">⠿</span>
                  <span className="text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap"
                    style={esSeccion ? { background: "#f3f4f6", color: "#374151" } : { background: "color-mix(in srgb, var(--color-marca) 12%, transparent)", color: "var(--color-marca)" }}>
                    {esSeccion ? "Productos" : "Bloque"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.nombre}</p>
                  </div>
                  {esSeccion ? (
                    <div className="flex gap-3 shrink-0">
                      <button onClick={() => renombrarSeccion(item.seccionId!, item.nombre)} className="link-accion text-xs">Renombrar</button>
                      <button onClick={() => eliminarSeccion(item.seccionId!)} className="link-peligro text-xs">Eliminar</button>
                    </div>
                  ) : (
                    <button onClick={() => setExpandido(abierto ? null : item.key)} className="link-accion text-xs shrink-0">
                      {abierto ? "Cerrar" : "Editar"}
                    </button>
                  )}
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer shrink-0 ml-1">
                    <input type="checkbox" checked={item.visible} onChange={() => toggleVisible(idx)} className="w-4 h-4 accent-[var(--color-marca)]" />
                    Visible
                  </label>
                </div>

                {/* Editor inline */}
                {abierto && !esSeccion && (
                  <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                    {item.tipo === "trustBar" && (
                      <div className="space-y-2">
                        {bloques.trustBar.items.map((it, i) => (
                          <div key={i} className="flex flex-wrap gap-2 items-end border border-gray-100 rounded-lg p-2">
                            <div className="w-36">
                              <label className="admin-label">Ícono</label>
                              <select value={it.icono} onChange={(e) => { const arr = [...bloques.trustBar.items]; arr[i] = { ...arr[i], icono: e.target.value }; setBloque("trustBar", { items: arr }); }} className="admin-input">
                                {ICONOS_DISPONIBLES.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                              </select>
                            </div>
                            <div className="flex-1 min-w-[160px]">
                              <label className="admin-label">Texto</label>
                              <input value={it.texto} onChange={(e) => { const arr = [...bloques.trustBar.items]; arr[i] = { ...arr[i], texto: e.target.value }; setBloque("trustBar", { items: arr }); }} className="admin-input" />
                            </div>
                            <button onClick={() => setBloque("trustBar", { items: bloques.trustBar.items.filter((_, x) => x !== i) })} className="link-peligro pb-2">Quitar</button>
                          </div>
                        ))}
                        <button onClick={() => setBloque("trustBar", { items: [...bloques.trustBar.items, { icono: "star", texto: "" }] })} className="btn-secundario text-sm">+ Agregar item</button>
                      </div>
                    )}

                    {item.tipo === "categorias" && (
                      <div className="space-y-3">
                        <div>
                          <label className="admin-label">Título de la sección</label>
                          <input value={bloques.categorias.titulo} onChange={(e) => setBloque("categorias", { titulo: e.target.value })} className="admin-input" />
                        </div>
                        {bloques.categorias.items.map((cat, i) => {
                          const preview = cat.imagen ? (cat.imagen.startsWith("http") ? cat.imagen : `${API_BASE}${cat.imagen}`) : "";
                          return (
                            <div key={i} className="flex flex-wrap gap-2 items-end border border-gray-100 rounded-lg p-2">
                              <div className="shrink-0">
                                <label className="admin-label">Vista</label>
                                <div className="w-10 h-10 rounded-full border-2 overflow-hidden flex items-center justify-center bg-gray-50" style={{ borderColor: "var(--color-marca)" }}>
                                  {preview ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={preview} alt="" className="w-full h-full object-cover" />
                                  ) : <span className="text-[9px] text-gray-400">icono</span>}
                                </div>
                              </div>
                              <div className="w-24">
                                <label className="admin-label">Ícono</label>
                                <select value={cat.icono} disabled={!!cat.imagen} onChange={(e) => { const arr = [...bloques.categorias.items]; arr[i] = { ...arr[i], icono: e.target.value }; setBloque("categorias", { items: arr }); }} className="admin-input">
                                  {ICONOS_DISPONIBLES.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                                </select>
                              </div>
                              <div className="w-28">
                                <label className="admin-label">Nombre</label>
                                <input value={cat.nombre} onChange={(e) => { const arr = [...bloques.categorias.items]; arr[i] = { ...arr[i], nombre: e.target.value }; setBloque("categorias", { items: arr }); }} className="admin-input" />
                              </div>
                              <div className="flex-1 min-w-[140px]">
                                <label className="admin-label">Enlace</label>
                                <input value={cat.enlace} onChange={(e) => { const arr = [...bloques.categorias.items]; arr[i] = { ...arr[i], enlace: e.target.value }; setBloque("categorias", { items: arr }); }} className="admin-input" />
                              </div>
                              <label className="btn-secundario cursor-pointer shrink-0">
                                {cat.imagen ? "Cambiar" : "Subir"}
                                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => subirImg((url) => { const arr = [...bloques.categorias.items]; arr[i] = { ...arr[i], imagen: url }; setBloque("categorias", { items: arr }); }, e)} className="hidden" />
                              </label>
                              {cat.imagen && <button onClick={() => { const arr = [...bloques.categorias.items]; arr[i] = { ...arr[i], imagen: "" }; setBloque("categorias", { items: arr }); }} className="link-peligro pb-2">Quitar img</button>}
                              <button onClick={() => setBloque("categorias", { items: bloques.categorias.items.filter((_, x) => x !== i) })} className="link-peligro pb-2">Quitar</button>
                            </div>
                          );
                        })}
                        <button onClick={() => setBloque("categorias", { items: [...bloques.categorias.items, { nombre: "", icono: "cards", enlace: "/tienda/categoria/" }] })} className="btn-secundario text-sm">+ Agregar categoría</button>
                      </div>
                    )}

                    {item.tipo === "editorial" && (
                      <div className="space-y-3">
                        <div><label className="admin-label">Título</label><input value={bloques.editorial.titulo} onChange={(e) => setBloque("editorial", { titulo: e.target.value })} className="admin-input" /></div>
                        <div><label className="admin-label">Subtítulo</label><input value={bloques.editorial.subtitulo} onChange={(e) => setBloque("editorial", { subtitulo: e.target.value })} className="admin-input" /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div><label className="admin-label">Enlace del botón</label><input value={bloques.editorial.enlace} onChange={(e) => setBloque("editorial", { enlace: e.target.value })} className="admin-input" /></div>
                          <div><label className="admin-label">Texto del botón</label><input value={bloques.editorial.textoBoton} onChange={(e) => setBloque("editorial", { textoBoton: e.target.value })} className="admin-input" /></div>
                        </div>
                        <div>
                          <label className="admin-label">Imagen</label>
                          <div className="flex items-center gap-4">
                            {bloques.editorial.imagen ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={bloques.editorial.imagen.startsWith("http") ? bloques.editorial.imagen : `${API_BASE}${bloques.editorial.imagen}`} alt="" className="h-14 w-20 object-cover rounded border" />
                            ) : <div className="h-14 w-20 rounded border border-dashed flex items-center justify-center text-gray-300 text-xs">Sin imagen</div>}
                            <label className="btn-secundario cursor-pointer">Subir imagen<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => subirImg((url) => setBloque("editorial", { imagen: url }), e)} className="hidden" /></label>
                            {bloques.editorial.imagen && <button onClick={() => setBloque("editorial", { imagen: "" })} className="link-peligro">Quitar</button>}
                          </div>
                        </div>
                      </div>
                    )}

                    {item.tipo === "descuento" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2"><label className="admin-label">Texto</label><input value={bloques.descuento.texto} onChange={(e) => setBloque("descuento", { texto: e.target.value })} className="admin-input" /></div>
                        <div><label className="admin-label">Código</label><input value={bloques.descuento.codigo} onChange={(e) => setBloque("descuento", { codigo: e.target.value.toUpperCase() })} className="admin-input" /></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={crearSeccion} className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Nombre de nueva sección de productos" className="admin-input flex-1" />
          <button className="btn-secundario shrink-0">+ Crear sección</button>
        </form>

        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-100">
          <button onClick={guardar} disabled={cargando} className="btn-primario">{cargando ? "Guardando..." : "Guardar todo"}</button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {guardado && <p className="text-sm" style={{ color: "var(--color-marca)" }}>Guardado. Recarga la home para ver los cambios.</p>}
        </div>
      </div>
    </>
  );
}