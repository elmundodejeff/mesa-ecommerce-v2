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
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Codigos de descuento
      </h2>

      <form
        onSubmit={crear}
        className="bg-white rounded-lg shadow p-6 grid grid-cols-4 gap-3"
      >
        <input
          placeholder="Codigo"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          required
          className="border rounded px-3 py-2"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="porcentaje">Porcentaje</option>
          <option value="monto">Monto fijo</option>
        </select>
        <input
          placeholder={tipo === "porcentaje" ? "% (ej 30)" : "$ (ej 5000)"}
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
        <input
          type="date"
          value={vigencia}
          onChange={(e) => setVigencia(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
        <button className="col-span-4 bg-emerald-700 text-white px-6 py-2 rounded hover:bg-emerald-800">
          Crear codigo
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Codigo</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Vigencia</th>
              <th className="p-3">Usos</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id} className="border-b text-gray-800">
                <td className="p-3 font-medium">{d.codigo}</td>
                <td className="p-3">{d.tipo}</td>
                <td className="p-3">
                  {d.tipo === "porcentaje"
                    ? `${d.valor}%`
                    : `$${d.valor.toLocaleString("es-CL")}`}
                </td>
                <td className="p-3">
                  {new Date(d.vigencia).toLocaleDateString("es-CL")}
                </td>
                <td className="p-3">
                  {d.usos}
                  {d.maxUsos ? `/${d.maxUsos}` : ""}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => eliminar(d.id)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}