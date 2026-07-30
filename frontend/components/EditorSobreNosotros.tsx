"use client";

import { useState } from "react";
import { api, apiUpload } from "@/lib/api";
import type { SobreNosotrosData } from "@/components/SobreNosotrosContenido";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function subirImg(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("imagen", file);
  const r = await apiUpload<{ url: string }>("/content/upload", fd);
  return r.url;
}

function ImgUploader({ valor, onChange }: { valor?: string; onChange: (url: string) => void }) {
  const [subiendo, setSubiendo] = useState(false);
  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setSubiendo(true);
    try {
      const url = await subirImg(f);
      onChange(url);
    } catch {
      alert("Error al subir imagen");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  }
  return (
    <div className="flex items-center gap-3">
      {valor && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={valor.startsWith("http") ? valor : `${API_BASE}${valor}`} alt="" className="w-16 h-16 object-cover rounded border" />
      )}
      <label className="cursor-pointer text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded border">
        {subiendo ? "Subiendo..." : valor ? "Cambiar" : "Subir imagen"}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handle} disabled={subiendo} className="hidden" />
      </label>
    </div>
  );
}

const inp = "w-full border rounded px-3 py-2 text-sm";
const lbl = "block text-xs text-gray-500 mb-1";

export default function EditorSobreNosotros({ inicial }: { inicial: SobreNosotrosData }) {
  const [data, setData] = useState<SobreNosotrosData>(inicial || {});
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  function upd(patch: Partial<SobreNosotrosData>) {
    setData((d) => ({ ...d, ...patch }));
    setOk(false);
  }

  async function guardar() {
    setError(""); setGuardando(true); setOk(false);
    try {
      await api("/content/config", { method: "PATCH", auth: true, body: { sobreNosotros: data } });
      setOk(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setGuardando(false);
    }
  }

  const hero = data.hero || {};
  const historia = data.historia || [];
  const valores = data.valores || [];
  const stats = data.stats || [];
  const galeria = data.galeria || [];
  const video = data.video || {};
  const cta = data.cta || {};

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">Hero (portada)</h4>
        <div className="space-y-2">
          <div><label className={lbl}>Titulo</label><input className={inp} value={hero.titulo || ""} onChange={(e) => upd({ hero: { ...hero, titulo: e.target.value } })} /></div>
          <div><label className={lbl}>Subtitulo</label><input className={inp} value={hero.subtitulo || ""} onChange={(e) => upd({ hero: { ...hero, subtitulo: e.target.value } })} /></div>
          <div><label className={lbl}>Imagen de fondo</label><ImgUploader valor={hero.imagen} onChange={(url) => upd({ hero: { ...hero, imagen: url } })} /></div>
        </div>
      </div>

      {/* HISTORIA */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-800">Historia (bloques texto + imagen)</h4>
          <button onClick={() => upd({ historia: [...historia, { lado: "izq" }] })} className="text-sm text-marca hover:underline">+ Agregar bloque</button>
        </div>
        <div className="space-y-4">
          {historia.map((h, i) => (
            <div key={i} className="bg-gray-50 rounded p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Bloque {i + 1}</span>
                <button onClick={() => upd({ historia: historia.filter((_, j) => j !== i) })} className="text-xs text-red-600">Quitar</button>
              </div>
              <input className={inp} placeholder="Titulo" value={h.titulo || ""} onChange={(e) => { const n = [...historia]; n[i] = { ...h, titulo: e.target.value }; upd({ historia: n }); }} />
              <textarea className={inp} placeholder="Texto" rows={3} value={h.texto || ""} onChange={(e) => { const n = [...historia]; n[i] = { ...h, texto: e.target.value }; upd({ historia: n }); }} />
              <div className="flex items-center gap-3">
                <ImgUploader valor={h.imagen} onChange={(url) => { const n = [...historia]; n[i] = { ...h, imagen: url }; upd({ historia: n }); }} />
                <select className="border rounded px-2 py-1 text-sm" value={h.lado || "izq"} onChange={(e) => { const n = [...historia]; n[i] = { ...h, lado: e.target.value as "izq" | "der" }; upd({ historia: n }); }}>
                  <option value="izq">Imagen derecha</option>
                  <option value="der">Imagen izquierda</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VALORES */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-800">Valores (tarjetas)</h4>
          <button onClick={() => upd({ valores: [...valores, {}] })} className="text-sm text-marca hover:underline">+ Agregar</button>
        </div>
        <div className="space-y-3">
          {valores.map((v, i) => (
            <div key={i} className="bg-gray-50 rounded p-3 flex gap-2 items-start">
              <input className="w-16 border rounded px-2 py-2 text-sm text-center" placeholder="emoji" value={v.icono || ""} onChange={(e) => { const n = [...valores]; n[i] = { ...v, icono: e.target.value }; upd({ valores: n }); }} />
              <div className="flex-1 space-y-2">
                <input className={inp} placeholder="Titulo" value={v.titulo || ""} onChange={(e) => { const n = [...valores]; n[i] = { ...v, titulo: e.target.value }; upd({ valores: n }); }} />
                <input className={inp} placeholder="Texto" value={v.texto || ""} onChange={(e) => { const n = [...valores]; n[i] = { ...v, texto: e.target.value }; upd({ valores: n }); }} />
              </div>
              <button onClick={() => upd({ valores: valores.filter((_, j) => j !== i) })} className="text-xs text-red-600 pt-2">Quitar</button>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-800">Numeros / stats</h4>
          <button onClick={() => upd({ stats: [...stats, {}] })} className="text-sm text-marca hover:underline">+ Agregar</button>
        </div>
        <div className="space-y-2">
          {stats.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input className="w-32 border rounded px-2 py-2 text-sm" placeholder="500+" value={s.numero || ""} onChange={(e) => { const n = [...stats]; n[i] = { ...s, numero: e.target.value }; upd({ stats: n }); }} />
              <input className={inp} placeholder="Juegos disponibles" value={s.label || ""} onChange={(e) => { const n = [...stats]; n[i] = { ...s, label: e.target.value }; upd({ stats: n }); }} />
              <button onClick={() => upd({ stats: stats.filter((_, j) => j !== i) })} className="text-xs text-red-600">Quitar</button>
            </div>
          ))}
        </div>
      </div>

      {/* VIDEO */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">Video (YouTube / Vimeo)</h4>
        <div className="space-y-2">
          <div><label className={lbl}>Titulo</label><input className={inp} value={video.titulo || ""} onChange={(e) => upd({ video: { ...video, titulo: e.target.value } })} /></div>
          <div><label className={lbl}>URL del video</label><input className={inp} placeholder="https://youtube.com/watch?v=..." value={video.url || ""} onChange={(e) => upd({ video: { ...video, url: e.target.value } })} /></div>
        </div>
      </div>

      {/* GALERIA */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-800">Galeria de fotos</h4>
          <label className="cursor-pointer text-sm text-marca hover:underline">
            + Subir foto
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { const url = await subirImg(f); upd({ galeria: [...galeria, url] }); } catch { alert("Error"); } e.target.value = ""; }} />
          </label>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {galeria.map((g, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.startsWith("http") ? g : `${API_BASE}${g}`} alt="" className="w-full h-20 object-cover rounded border" />
              <button onClick={() => upd({ galeria: galeria.filter((_, j) => j !== i) })} className="absolute top-1 right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full opacity-0 group-hover:opacity-100">x</button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">Llamado final (CTA)</h4>
        <div className="space-y-2">
          <div><label className={lbl}>Titulo</label><input className={inp} value={cta.titulo || ""} onChange={(e) => upd({ cta: { ...cta, titulo: e.target.value } })} /></div>
          <div><label className={lbl}>Texto</label><input className={inp} value={cta.texto || ""} onChange={(e) => upd({ cta: { ...cta, texto: e.target.value } })} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={lbl}>Texto del boton</label><input className={inp} value={cta.botonTexto || ""} onChange={(e) => upd({ cta: { ...cta, botonTexto: e.target.value } })} /></div>
            <div><label className={lbl}>Enlace del boton</label><input className={inp} placeholder="/tienda" value={cta.botonEnlace || ""} onChange={(e) => upd({ cta: { ...cta, botonEnlace: e.target.value } })} /></div>
          </div>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {ok && <p className="text-sm" style={{ color: "var(--color-marca)" }}>Guardado. Recarga /sobre-nosotros para ver los cambios.</p>}
      <button onClick={guardar} disabled={guardando} className="text-white px-6 py-2 btn-pill bg-marca">
        {guardando ? "Guardando..." : "Guardar Sobre nosotros"}
      </button>
    </div>
  );
}