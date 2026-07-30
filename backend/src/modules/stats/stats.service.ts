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
}