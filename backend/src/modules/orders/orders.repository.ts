import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { DiscountsService } from '../discounts/discounts.service';
import { LoyaltyService } from '../loyalty/loyalty.service';

interface ItemInput {
  productoId: number;
  cantidad: number;
}

interface CrearOrdenInput {
  items: ItemInput[];
  userId?: string;
  codigo?: string;
  puntosAUsar?: number;
  nombreEnvio?: string;
  direccionEnvio?: string;
  ciudadEnvio?: string;
  regionEnvio?: string;
  comunaEnvio?: string;
  telefonoEnvio?: string;
  rutEnvio?: string;
  codigoPostalEnvio?: string;
  notaEntrega?: string;
}

@Injectable()
export class OrdersRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly discounts: DiscountsService,
    private readonly loyalty: LoyaltyService,
  ) {}

  findAll() {
    return this.prisma.orden.findMany({
      orderBy: { id: 'desc' },
      include: { items: true },
    });
  }

  findOne(id: number) {
    return this.prisma.orden.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async crearOrden(input: CrearOrdenInput) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Productos
      const ids = input.items.map((i) => i.productoId);
      const productos = await tx.producto.findMany({
        where: { id: { in: ids } },
      });

      // 2. Stock, subtotal, items
      let subtotal = 0;
      const itemsData: {
        productoId: number;
        nombre: string;
        precio: number;
        cantidad: number;
      }[] = [];

      for (const item of input.items) {
        const prod = productos.find((p) => p.id === item.productoId);
        if (!prod) {
          throw new BadRequestException(
            `Producto ${item.productoId} no existe`,
          );
        }
        if (item.cantidad < 1) {
          throw new BadRequestException(
            `Cantidad invalida para ${prod.nombre}`,
          );
        }
        if (prod.stock < item.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para ${prod.nombre} (disponible: ${prod.stock})`,
          );
        }
        subtotal += prod.precio * item.cantidad;
        itemsData.push({
          productoId: prod.id,
          nombre: prod.nombre,
          precio: prod.precio,
          cantidad: item.cantidad,
        });
      }

      // 3. Descuento por codigo
      let descuentoMonto = 0;
      let descuentoCodigo: string | null = null;
      let avisoDescuento: string | null = null;

      if (input.codigo) {
        const v = await this.discounts.validar(input.codigo, input.userId);
        if (v.valido) {
          descuentoMonto =
            v.tipo === 'porcentaje'
              ? Math.round((subtotal * (v.valor ?? 0)) / 100)
              : (v.valor ?? 0);
          if (descuentoMonto > subtotal) descuentoMonto = subtotal;
          descuentoCodigo = input.codigo;
          await tx.codigoDescuento.update({
            where: { id: v.codigoId },
            data: { usos: { increment: 1 } },
          });
        } else {
          avisoDescuento = v.motivo ?? 'Codigo no valido';
        }
      }

      // total tras descuento
      let total = subtotal - descuentoMonto;

      // 4. Canje de puntos (solo logueados). 1 punto = $1.
      let puntosUsados = 0;
      let avisoPuntos: string | null = null;

      if (input.puntosAUsar && input.puntosAUsar > 0) {
        if (!input.userId) {
          avisoPuntos = 'Debes iniciar sesion para usar puntos';
        } else {
          const saldo = await this.loyalty.saldo(input.userId);
          if (input.puntosAUsar > saldo) {
            avisoPuntos = `Saldo insuficiente (tienes ${saldo} puntos)`;
          } else {
            // No canjear mas que el total
            puntosUsados = Math.min(input.puntosAUsar, total);
            total -= puntosUsados;
            // Registrar movimiento negativo
            await tx.movimientoPuntos.create({
              data: {
                userId: input.userId,
                cantidad: -puntosUsados,
                tipo: 'usado',
              },
            });
          }
        }
      }

      // 5. Descontar stock
      for (const item of input.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { decrement: item.cantidad } },
        });
      }

      // 6. Crear orden
      const orden = await tx.orden.create({
        data: {
          total,
          descuentoMonto,
          descuentoCodigo,
          puntosUsados,
          userId: input.userId,
          nombreEnvio: input.nombreEnvio,
          direccionEnvio: input.direccionEnvio,
          ciudadEnvio: input.ciudadEnvio,
          regionEnvio: input.regionEnvio,
          comunaEnvio: input.comunaEnvio,
          telefonoEnvio: input.telefonoEnvio,
          rutEnvio: input.rutEnvio,
          codigoPostalEnvio: input.codigoPostalEnvio,
          notaEntrega: input.notaEntrega,
          items: { create: itemsData },
        },
        include: { items: true },
      });

      // 7. Acumular puntos (solo logueados): % del total final
      let puntosGanados = 0;
      if (input.userId) {
        const config = await tx.config.findUnique({ where: { id: 1 } });
        const pct = config?.porcentajePuntosGlobal ?? 5;
        const dias = config?.diasVencimientoPuntos ?? 365;
        puntosGanados = Math.round((total * pct) / 100);

        if (puntosGanados > 0) {
          const vence = new Date();
          vence.setDate(vence.getDate() + dias);
          await tx.movimientoPuntos.create({
            data: {
              userId: input.userId,
              cantidad: puntosGanados,
              tipo: 'ganado',
              vence,
              ordenId: orden.id,
            },
          });
        }
      }

      return {
        ...orden,
        subtotal,
        avisoDescuento,
        avisoPuntos,
        puntosGanados,
      };
    });
  }

  updateEstado(id: number, estado: string) {
    return this.prisma.orden.update({
      where: { id },
      data: { estado },
    });
  }

  misOrdenes(userId: string) {
    return this.prisma.orden.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { fecha: "desc" },
    });
  }

}