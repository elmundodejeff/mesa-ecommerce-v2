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
  Legend,
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
interface RankingProducto {
  productoId: number;
  nombre: string;
  unidades: number;
}
interface Comprador {
  userId: string;
  nombre: string;
  email: string;
  totalGastado: number;
  pedidos: number;
}
interface PuntoProyeccion {
  label: string;
  real: number | null;
  proyeccion: number | null;
}
export default function Dashboard() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [porMes, setPorMes] = useState<Punto[]>([]);
  const [porDia, setPorDia] = useState<Punto[]>([]);
  const [dias, setDias] = useState(7);
  const [proyeccion, setProyeccion] = useState<PuntoProyeccion[]>([]);
  const [masVendidos, setMasVendidos] = useState<RankingProducto[]>([]);
  const [menosVendidos, setMenosVendidos] = useState<RankingProducto[]>([]);
  const [compradores, setCompradores] = useState<Comprador[]>([]);
  useEffect(() => {
    api<Resumen>("/stats/resumen", { auth: true }).then(setResumen).catch(() => {});
    api<Punto[]>("/stats/ventas-mes", { auth: true }).then(setPorMes).catch(() => {});
    api<PuntoProyeccion[]>("/stats/proyeccion?meses=6", { auth: true }).then(setProyeccion).catch(() => {});
    api<RankingProducto[]>("/stats/mas-vendidos?limite=5", { auth: true }).then(setMasVendidos).catch(() => {});
    api<RankingProducto[]>("/stats/menos-vendidos?limite=5", { auth: true }).then(setMenosVendidos).catch(() => {});
    api<Comprador[]>("/stats/top-compradores?limite=5", { auth: true }).then(setCompradores).catch(() => {});
  }, []);
  useEffect(() => {
    api<Punto[]>(`/stats/ventas-dia?dias=${dias}`, { auth: true })
      .then(setPorDia)
      .catch(() => {});
  }, [dias]);
  const fmt = (n: number) => `$${n.toLocaleString("es-CL")}`;
  const VINO = "var(--color-header)";
  const ROSA = "var(--color-marca)";
  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Dashboard</h1>
          <p className="admin-subtitle">Resumen de ventas y desempeño</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card titulo="Ventas totales" valor={resumen ? fmt(resumen.ventasTotales) : "..."} />
        <Card titulo="Pedidos" valor={resumen ? String(resumen.pedidos) : "..."} />
        <Card titulo="Usuarios" valor={resumen ? String(resumen.usuarios) : "..."} />
        <Card titulo="Ticket promedio" valor={resumen ? fmt(resumen.ticketPromedio) : "..."} />
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Ventas últimos 6 meses</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={porMes}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Bar dataKey="total" fill={VINO} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title mb-1">Proyección de ventas</h2>
        <p className="text-sm text-gray-500 mb-4">
          Histórico real (línea) y tendencia proyectada a 6 meses (línea punteada)
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={proyeccion}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Legend />
            <Line name="Real" type="monotone" dataKey="real" stroke={VINO} strokeWidth={2} dot={{ r: 4 }} connectNulls />
            <Line name="Proyección" type="monotone" dataKey="proyeccion" stroke={ROSA} strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="admin-card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="admin-card-title mb-0">Ventas por día</h2>
          <div className="flex gap-2">
            {[7, 15, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDias(d)}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  dias === d ? "text-white" : "border border-gray-300 text-gray-600"
                }`}
                style={dias === d ? { backgroundColor: "var(--color-marca)" } : {}}
              >
                {d} días
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
            <Line type="monotone" dataKey="total" stroke={VINO} strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <h2 className="admin-card-title">Más vendidos (unidades)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={masVendidos} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="nombre" fontSize={11} width={120} />
              <Tooltip formatter={(v: number) => `${v} u`} />
              <Bar dataKey="unidades" fill={VINO} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="admin-card">
          <h2 className="admin-card-title">Menos vendidos (unidades)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={menosVendidos} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="nombre" fontSize={11} width={120} />
              <Tooltip formatter={(v: number) => `${v} u`} />
              <Bar dataKey="unidades" fill={ROSA} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Top compradores</h2>
        {compradores.length === 0 ? (
          <p className="text-sm text-gray-400">Sin datos de compradores registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Email</th>
                  <th className="text-right">Pedidos</th>
                  <th className="text-right">Total gastado</th>
                </tr>
              </thead>
              <tbody>
                {compradores.map((c, i) => (
                  <tr key={c.userId}>
                    <td className="text-gray-400">{i + 1}</td>
                    <td className="font-medium text-gray-800">{c.nombre}</td>
                    <td className="text-gray-500">{c.email}</td>
                    <td className="text-right">{c.pedidos}</td>
                    <td className="text-right font-semibold" style={{ color: "var(--color-marca)" }}>
                      {fmt(c.totalGastado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
function Card({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="admin-card">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{valor}</p>
    </div>
  );
}