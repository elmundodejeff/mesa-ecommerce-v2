"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Descuento {
  id: number;
  codigo: string;
  tipo: string;
  valor: number;
  vigencia: string;
  activo: boolean;
  usos: number;
  maxUsos: number | null;
}

export default function AdminDescuentos() {
  const [items, setItems] = useState<Descuento[]>([]);
  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState("porcentaje");
  const [valor, setValor] = useState("");
  const [vigencia, setVigencia] = useState("");
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setItems(await api<Descuento[]>("/discounts", { auth: true }));
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
        },
      });
      setCodigo("");
      setValor("");
      setVigencia("");
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

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Códigos de descuento</h1>
          <p className="admin-subtitle">Cupones para el checkout</p>
        </div>
      </div>

      <form onSubmit={crear} className="admin-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
            <label className="admin-label">Vigencia</label>
            <input type="date" value={vigencia} onChange={(e) => setVigencia(e.target.value)} required className="admin-input" />
          </div>
        </div>
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
                  <td className="text-right pr-6">
                    <button onClick={() => eliminar(d.id)} className="link-peligro">Eliminar</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="pl-6 text-gray-400">Sin códigos aún.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}