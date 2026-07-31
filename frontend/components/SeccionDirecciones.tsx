"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Direccion {
  id: string;
  alias: string;
  calle: string;
  ciudad: string;
  region: string;
  esPrincipal: boolean;
}

const inp = "border rounded px-3 py-2 text-sm";

export default function SeccionDirecciones() {
  const [lista, setLista] = useState<Direccion[]>([]);
  const [error, setError] = useState("");
  const [nueva, setNueva] = useState({ alias: "", calle: "", ciudad: "", region: "" });

  async function cargar() {
    try {
      setLista(await api<Direccion[]>("/users/me/direcciones", { auth: true }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  useEffect(() => { cargar(); }, []);

  async function agregar() {
    if (!nueva.alias || !nueva.calle || !nueva.ciudad || !nueva.region) {
      setError("Completa todos los campos");
      return;
    }
    setError("");
    try {
      await api("/users/me/direcciones", { method: "POST", auth: true, body: nueva });
      setNueva({ alias: "", calle: "", ciudad: "", region: "" });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function borrar(id: string) {
    if (!confirm("Eliminar esta direccion?")) return;
    try {
      await api(`/users/me/direcciones/${id}`, { method: "DELETE", auth: true });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function marcarPrincipal(id: string) {
    try {
      await api(`/users/me/direcciones/${id}`, { method: "PATCH", auth: true, body: { esPrincipal: true } });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-800 mb-4">Mis direcciones</h2>

      <div className="space-y-2 mb-4">
        {lista.length === 0 && <p className="text-sm text-gray-400">Sin direcciones aun.</p>}
        {lista.map((d) => (
          <div key={d.id} className="flex items-center justify-between border rounded-lg px-4 py-3 text-sm">
            <div>
              <span className="font-medium text-gray-800">{d.alias}</span>
              {d.esPrincipal && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "var(--color-marca)" }}>Principal</span>
              )}
              <p className="text-gray-500 text-xs mt-0.5">{d.calle}, {d.ciudad}, {d.region}</p>
            </div>
            <div className="flex gap-3 text-xs">
              {!d.esPrincipal && (
                <button onClick={() => marcarPrincipal(d.id)} className="hover:underline" style={{ color: "var(--color-marca)" }}>Hacer principal</button>
              )}
              <button onClick={() => borrar(d.id)} className="text-red-600 hover:underline">Borrar</button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <input className={inp} placeholder="Alias (casa)" value={nueva.alias} onChange={(e) => setNueva({ ...nueva, alias: e.target.value })} />
        <input className={inp} placeholder="Calle" value={nueva.calle} onChange={(e) => setNueva({ ...nueva, calle: e.target.value })} />
        <input className={inp} placeholder="Ciudad" value={nueva.ciudad} onChange={(e) => setNueva({ ...nueva, ciudad: e.target.value })} />
        <input className={inp} placeholder="Region" value={nueva.region} onChange={(e) => setNueva({ ...nueva, region: e.target.value })} />
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <button onClick={agregar} className="mt-3 text-white px-6 py-2 btn-pill" style={{ backgroundColor: "var(--color-marca)" }}>
        Agregar direccion
      </button>
    </section>
  );
}