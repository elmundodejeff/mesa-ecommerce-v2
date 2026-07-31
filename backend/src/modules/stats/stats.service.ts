import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}
  async resumen() {
    const [ventas, pedidos, usuarios] = await Promise.all([
      this.prisma.orden.aggregate({ _sum: { total: true } }),
      this.prisma.orden.count(),
      this.prisma.user.count(),
    ]);
    const ventasTotales = ventas._sum.total ?? 0;
    const ticketPromedio =
      pedidos > 0 ? Math.round(ventasTotales / pedidos) : 0;
    return {
      ventasTotales,
      pedidos,
      usuarios,
      ticketPromedio,
    };
  }
  // Ventas agrupadas por mes (ultimos 6 meses)
  async ventasPorMes() {
    const ordenes = await this.prisma.orden.findMany({
      select: { total: true, fecha: true },
    });
    const meses: { clave: string; label: string; total: number }[] = [];
    const ahora = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const clave = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleDateString('es-CL', {
        month: 'short',
        year: 'numeric',
      });
      meses.push({ clave, label, total: 0 });
    }
    for (const o of ordenes) {
      const f = new Date(o.fecha);
      const clave = `${f.getFullYear()}-${f.getMonth()}`;
      const mes = meses.find((m) => m.clave === clave);
      if (mes) mes.total += o.total;
    }
    return meses.map((m) => ({ label: m.label, total: m.total }));
  }
  // Ventas por dia en los ultimos N dias
  async ventasPorDia(dias: number) {
    const desde = new Date();
    desde.setDate(desde.getDate() - dias + 1);
    desde.setHours(0, 0, 0, 0);
    const ordenes = await this.prisma.orden.findMany({
      where: { fecha: { gte: desde } },
      select: { total: true, fecha: true },
    });
    const diasMap: { clave: string; label: string; total: number }[] = [];
    for (let i = 0; i < dias; i++) {
      const d = new Date(desde);
      d.setDate(desde.getDate() + i);
      const clave = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
      });
      diasMap.push({ clave, label, total: 0 });
    }
    for (const o of ordenes) {
      const clave = new Date(o.fecha).toISOString().slice(0, 10);
      const dia = diasMap.find((x) => x.clave === clave);
      if (dia) dia.total += o.total;
    }
    return diasMap.map((d) => ({ label: d.label, total: d.total }));
  }
  // Top productos mas vendidos (por unidades)
  async masVendidos(limite: number) {
    const grupos = await this.prisma.ordenItem.groupBy({
      by: ['productoId', 'nombre'],
      _sum: { cantidad: true, precio: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: limite,
    });
    return grupos.map((g) => ({
      productoId: g.productoId,
      nombre: g.nombre,
      unidades: g._sum.cantidad ?? 0,
    }));
  }
  // Productos menos vendidos (con al menos 1 venta)
  async menosVendidos(limite: number) {
    const grupos = await this.prisma.ordenItem.groupBy({
      by: ['productoId', 'nombre'],
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: 'asc' } },
      take: limite,
    });
    return grupos.map((g) => ({
      productoId: g.productoId,
      nombre: g.nombre,
      unidades: g._sum.cantidad ?? 0,
    }));
  }
  // Top compradores por gasto total
  async topCompradores(limite: number) {
    const grupos = await this.prisma.orden.groupBy({
      by: ['userId'],
      where: { userId: { not: null } },
      _sum: { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: 'desc' } },
      take: limite,
    });
    const ids = grupos
      .map((g) => g.userId)
      .filter((x): x is string => x !== null);
    const usuarios = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, nombre: true, email: true },
    });
    return grupos.map((g) => {
      const u = usuarios.find((x) => x.id === g.userId);
      return {
        userId: g.userId,
        nombre: u?.nombre ?? 'Sin nombre',
        email: u?.email ?? '',
        totalGastado: g._sum.total ?? 0,
        pedidos: g._count.id,
      };
    });
  }
  // Proyeccion de ventas: historico mensual + tendencia lineal a N meses
  async proyeccion(meses: number) {
    const ordenes = await this.prisma.orden.findMany({
      select: { total: true, fecha: true },
    });
    // Agrupar todo el historico por mes
    const mapa = new Map<string, number>();
    for (const o of ordenes) {
      const f = new Date(o.fecha);
      const clave = `${f.getFullYear()}-${String(f.getMonth()).padStart(2, '0')}`;
      mapa.set(clave, (mapa.get(clave) ?? 0) + o.total);
    }
    // Construir serie continua de los ultimos 6 meses con datos reales
    const ahora = new Date();
    const historico: { anio: number; mes: number; label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const clave = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      const label = d.toLocaleDateString('es-CL', {
        month: 'short',
        year: 'numeric',
      });
      historico.push({
        anio: d.getFullYear(),
        mes: d.getMonth(),
        label,
        total: mapa.get(clave) ?? 0,
      });
    }
    // Regresion lineal simple sobre el historico (x = indice del mes)
    const n = historico.length;
    const xs = historico.map((_, i) => i);
    const ys = historico.map((h) => h.total);
    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
    const sumXX = xs.reduce((a, x) => a + x * x, 0);
    const denom = n * sumXX - sumX * sumX;
    const pendiente = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
    const intercepto = (sumY - pendiente * sumX) / n;
    // Serie de salida: historico (real) + proyeccion (calculada)
    const salida = historico.map((h) => ({
      label: h.label,
      real: h.total,
      proyeccion: null as number | null,
    }));
    // Punto de union: la ultima barra real tambien marca inicio de la linea
    if (salida.length > 0) {
      const ultIdx = n - 1;
      salida[ultIdx].proyeccion = Math.max(
        0,
        Math.round(intercepto + pendiente * ultIdx),
      );
    }
    for (let k = 1; k <= meses; k++) {
      const idx = n - 1 + k;
      const d = new Date(ahora.getFullYear(), ahora.getMonth() + k, 1);
      const label = d.toLocaleDateString('es-CL', {
        month: 'short',
        year: 'numeric',
      });
      salida.push({
        label,
        real: null as any,
        proyeccion: Math.max(0, Math.round(intercepto + pendiente * idx)),
      });
    }
    return salida;
  }
}