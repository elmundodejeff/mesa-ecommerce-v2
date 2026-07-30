"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Resumen {
  ventasTotales: number;
  pedidos: number;
  usuarios: number;
  ticketPromedio: number;
}

interface Punto {
  label: string;
  total: number;
}

export default function Dashboard() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [porMes, setPorMes] = useState<Punto[]>([]);
  const [porDia, setPorDia] = useState<Punto[]>([]);
  const [dias, setDias] = useState(7);

  useEffect(() => {
    api<Resumen>("/stats/resumen", { auth: true }).then(setResumen).catch(() => {});
    api<Punto[]>("/stats/ventas-mes", { auth: true }).then(setPorMes).catch(() => {});
  }, []);

  useEffect(() => {
    api<Punto[]>(`/stats/ventas-dia?dias=${dias}`, { auth: true })
      .then(setPorDia)
      .catch(() => {});
  }, [dias]);

  const fmt = (n: number) => `$${n.toLocaleString("es-CL")}`;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card titulo="Ventas totales" valor={resumen ? fmt(resumen.ventasTotales) : "..."} />
        <Card titulo="Pedidos" valor={resumen ? String(resumen.pedidos) : "..."} />
        <Card titulo="Usuarios" valor={resumen ? String(resumen.usuarios) : "..."} />
        <Card titulo="Ticket promedio" valor={resumen ? fmt(resumen.ticketPromedio) : "..."} />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">Ventas ultimos 6 meses</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={porMes}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-800">Ventas por dia</h2>
          <div className="flex gap-2 text-sm">
            {[7, 15, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDias(d)}
                className={`px-3 py-1 rounded-full ${
                  dias === d ? "bg-purple-600 text-white" : "border text-gray-600"
                }`}
              >
                {d} dias
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={porDia}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Line type="monotone" dataKey="total" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Card({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{valor}</p>
    </div>
  );
}