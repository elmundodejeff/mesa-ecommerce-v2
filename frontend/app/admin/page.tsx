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
  const VINO = "#4B1528";
  const ROSA = "#D4537E";
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
            <Bar dataKey="total" fill={VINO} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-1">Proyeccion de ventas</h2>
        <p className="text-sm text-gray-500 mb-4">
          Historico real (barra) y tendencia proyectada a 6 meses (linea punteada)
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={proyeccion}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Legend />
            <Line
              name="Real"
              type="monotone"
              dataKey="real"
              stroke={VINO}
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls
            />
            <Line
              name="Proyeccion"
              type="monotone"
              dataKey="proyeccion"
              stroke={ROSA}
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ r: 3 }}
              connectNulls
            />
          </LineChart>
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
                  dias === d ? "text-white" : "border text-gray-600"
                }`}
                style={dias === d ? { backgroundColor: VINO } : {}}
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
            <Line type="monotone" dataKey="total" stroke={VINO} strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Mas vendidos (unidades)</h2>
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
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Menos vendidos (unidades)</h2>
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
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">Top compradores</h2>
        {compradores.length === 0 ? (
          <p className="text-sm text-gray-400">Sin datos de compradores registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Cliente</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4 text-right">Pedidos</th>
                  <th className="py-2 text-right">Total gastado</th>
                </tr>
              </thead>
              <tbody>
                {compradores.map((c, i) => (
                  <tr key={c.userId} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                    <td className="py-2 pr-4 font-medium text-gray-800">{c.nombre}</td>
                    <td className="py-2 pr-4 text-gray-500">{c.email}</td>
                    <td className="py-2 pr-4 text-right text-gray-600">{c.pedidos}</td>
                    <td className="py-2 text-right font-semibold" style={{ color: VINO }}>
                      {fmt(c.totalGastado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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