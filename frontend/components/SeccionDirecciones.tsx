"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Direccion {
  id: string;
  alias: string;
  calle: string;
  ciudad: string;
  region: string;
  comuna?: string | null;
  esPrincipal: boolean;
}

interface GeoItem { codigo: string; nombre: string; }

const inp = "border border-gray-200 rounded-xl px-3 py-2 text-sm w-full";

export default function SeccionDirecciones() {
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [nueva, setNueva] = useState({ alias: "", calle: "", ciudad: "", region: "", comuna: "" });
  const [regionCodigo, setRegionCodigo] = useState("");
  const [regiones, setRegiones] = useState<GeoItem[]>([]);
  const [comunasDisp, setComunasDisp] = useState<GeoItem[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  function cargar() {
    api<Direccion[]>("/users/me/direcciones", { auth: true })
      .then(setDirecciones)
      .catch(() => {});
  }

  useEffect(() => {
    cargar();
    api<GeoItem[]>("/shipping/regiones").then(setRegiones).catch(() => {});
  }, []);

  async function elegirRegion(codigo: string) {
    const r = regiones.find((x) => x.codigo === codigo);
    setRegionCodigo(codigo);
    setNueva((n) => ({ ...n, region: r?.nombre || "", comuna: "" }));
    setComunasDisp([]);
    if (!codigo) return;
    try {
      const cs = await api<GeoItem[]>(`/shipping/comunas?region=${codigo}`);
      setComunasDisp(cs);
    } catch {
      setComunasDisp([]);
    }
  }

  async function agregar() {
    setError("");
    if (!nueva.alias || !nueva.calle || !nueva.ciudad || !nueva.region) {
      setError("Completa alias, calle, ciudad y region");
      return;
    }
    setCargando(true);
    try {
      await api("/users/me/direcciones", {
        method: "POST",
        auth: true,
        body: nueva,
      });
      setNueva({ alias: "", calle: "", ciudad: "", region: "", comuna: "" });
      setRegionCodigo("");
      setComunasDisp([]);
      cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo agregar");
    } finally {
      setCargando(false);
    }
  }

  async function borrar(id: string) {
    if (!confirm("Eliminar esta direccion?")) return;
    try {
      await api(`/users/me/direcciones/${id}`, { method: "DELETE", auth: true });
      cargar();
    } catch {}
  }

  async function marcarPrincipal(id: string) {
    try {
      await api(`/users/me/direcciones/${id}`, {
        method: "PATCH",
        auth: true,
        body: { esPrincipal: true },
      });
      cargar();
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Mis direcciones</h3>
        {direcciones.length === 0 ? (
          <p className="text-gray-500 text-sm">No tienes direcciones guardadas.</p>
        ) : (
          <div className="space-y-2">
            {direcciones.map((d) => (
              <div key={d.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {d.alias}
                    {d.esPrincipal && <span className="text-xs ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-marca) 15%, transparent)", color: "var(--color-marca)" }}>Principal</span>}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">{d.calle}, {d.ciudad}, {d.region}{d.comuna ? `, ${d.comuna}` : ""}</p>
                </div>
                <div className="flex gap-2">
                  {!d.esPrincipal && (
                    <button onClick={() => marcarPrincipal(d.id)} className="text-xs text-gray-500 hover:text-gray-800">Hacer principal</button>
                  )}
                  <button onClick={() => borrar(d.id)} className="text-xs text-red-500 hover:text-red-700">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="font-semibold text-gray-900 mb-3">Agregar direccion</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input className={inp} placeholder="Alias (ej: Casa)" value={nueva.alias} onChange={(e) => setNueva({ ...nueva, alias: e.target.value })} />
          <input className={inp} placeholder="Calle y numero" value={nueva.calle} onChange={(e) => setNueva({ ...nueva, calle: e.target.value })} />
          <input className={inp} placeholder="Ciudad" value={nueva.ciudad} onChange={(e) => setNueva({ ...nueva, ciudad: e.target.value })} />
          <select className={`${inp} bg-white`} value={regionCodigo} onChange={(e) => elegirRegion(e.target.value)}>
            <option value="">Selecciona region</option>
            {regiones.map((r) => <option key={r.codigo} value={r.codigo}>{r.nombre}</option>)}
          </select>
          <select className={`${inp} bg-white disabled:opacity-50`} value={nueva.comuna} onChange={(e) => setNueva({ ...nueva, comuna: e.target.value })} disabled={comunasDisp.length === 0}>
            <option value="">{comunasDisp.length === 0 ? "Elige region primero" : "Selecciona comuna"}</option>
            {comunasDisp.map((c) => <option key={c.codigo} value={c.nombre}>{c.nombre}</option>)}
          </select>
        </div>
        {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
        <button onClick={agregar} disabled={cargando} className="mt-3 text-white px-5 py-2 text-sm btn-pill disabled:opacity-50" style={{ backgroundColor: "var(--color-marca)" }}>
          {cargando ? "Agregando..." : "Agregar direccion"}
        </button>
      </div>
    </div>
  );
}
