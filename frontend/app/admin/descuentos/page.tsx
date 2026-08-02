"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Usuario {
  id: string;
  nombre: string | null;
  email: string;
}

interface Descuento {
  id: number;
  codigo: string;
  tipo: string;
  valor: number;
  vigencia: string;
  activo: boolean;
  usos: number;
  maxUsos: number | null;
  maxUsosPorUsuario: number | null;
  userId: string | null;
}

export default function AdminDescuentos() {
  const [items, setItems] = useState<Descuento[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState("porcentaje");
  const [valor, setValor] = useState("");
  const [vigencia, setVigencia] = useState("");
  const [maxUsos, setMaxUsos] = useState("");
  const [maxPorUsuario, setMaxPorUsuario] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  async function cargar() {
    try {
      const [descuentos, users] = await Promise.all([
        api<Descuento[]>("/discounts", { auth: true }),
        api<Usuario[]>("/users", { auth: true }).catch(() => []),
      ]);
      setItems(descuentos);
      setUsuarios(users);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/discounts", {
        method: "POST",
        auth: true,
        body: {
          codigo,
          tipo,
          valor: Number(valor),
          vigencia,
          maxUsos: maxUsos ? Number(maxUsos) : undefined,
          maxUsosPorUsuario: maxPorUsuario ? Number(maxPorUsuario) : undefined,
          userId: userId || undefined,
        },
      });
      setCodigo("");
      setValor("");
      setVigencia("");
      setMaxUsos("");
      setMaxPorUsuario("");
      setUserId("");
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function eliminar(id: number) {
    if (!confirm("Eliminar codigo?")) return;
    try {
      await api(`/discounts/${id}`, { method: "DELETE", auth: true });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  function nombreUsuario(uid: string | null) {
    if (!uid) return "Todos";
    const u = usuarios.find((x) => x.id === uid);
    return u ? (u.nombre || u.email) : "Usuario específico";
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Códigos de descuento</h1>
          <p className="admin-subtitle">Cupones con vigencia, límite de usos y asignación</p>
        </div>
      </div>

      <form onSubmit={crear} className="admin-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="admin-label">Código</label>
            <input
              placeholder="VERANO30"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              required
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="admin-input">
              <option value="porcentaje">Porcentaje</option>
              <option value="monto">Monto fijo</option>
            </select>
          </div>
          <div>
            <label className="admin-label">Valor</label>
            <input
              placeholder={tipo === "porcentaje" ? "% (ej 30)" : "$ (ej 5000)"}
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Vigencia (expira)</label>
            <input type="date" value={vigencia} onChange={(e) => setVigencia(e.target.value)} required className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Máximo de usos (global)</label>
            <input
              type="number"
              min="1"
              placeholder="Sin límite"
              value={maxUsos}
              onChange={(e) => setMaxUsos(e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Máximo por usuario</label>
            <input
              type="number"
              min="1"
              placeholder="Sin límite (ej: 1 = una vez c/u)"
              value={maxPorUsuario}
              onChange={(e) => setMaxPorUsuario(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Asignar a</label>
            <select value={userId} onChange={(e) => setUserId(e.target.value)} className="admin-input">
              <option value="">Todos los usuarios</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre || u.email}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Tip: para un cupón de bienvenida de un solo uso por persona, pon &quot;Máximo por usuario&quot; en 1 y déjalo asignado a &quot;Todos&quot;.
        </p>
        <button className="btn-primario mt-4">Crear código</button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-tabla">
            <thead>
              <tr>
                <th className="pl-6">Código</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Vigencia</th>
                <th>Usos</th>
                <th>Por usuario</th>
                <th>Asignado a</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id}>
                  <td className="pl-6 font-medium text-gray-800">{d.codigo}</td>
                  <td>{d.tipo}</td>
                  <td>
                    {d.tipo === "porcentaje"
                      ? `${d.valor}%`
                      : `$${d.valor.toLocaleString("es-CL")}`}
                  </td>
                  <td>{new Date(d.vigencia).toLocaleDateString("es-CL")}</td>
                  <td>
                    {d.usos}
                    {d.maxUsos ? `/${d.maxUsos}` : ""}
                  </td>
                  <td>{d.maxUsosPorUsuario ? `${d.maxUsosPorUsuario}x` : "—"}</td>
                  <td>
                    {d.userId ? (
                      <span className="admin-badge">{nombreUsuario(d.userId)}</span>
                    ) : (
                      <span className="text-gray-400">Todos</span>
                    )}
                  </td>
                  <td className="text-right pr-6">
                    <button onClick={() => eliminar(d.id)} className="link-peligro">Eliminar</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} className="pl-6 text-gray-400">Sin códigos aún.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}