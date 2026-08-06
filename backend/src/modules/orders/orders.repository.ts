import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { DiscountsService } from '../discounts/discounts.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { ShippingService } from '../shipping/shipping.service';

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
  servicioEnvioCodigo?: number;
}

// Minutos que una orden pendiente_pago mantiene la reserva antes de expirar.
const MINUTOS_EXPIRACION = 30;

@Injectable()
export class OrdersRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly discounts: DiscountsService,
    private readonly loyalty: LoyaltyService,
    private readonly shipping: ShippingService,
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

      // 3. Descuento: compara codigo manual vs mejor descuento personal (automatico)
      let descuentoMonto = 0;
      let descuentoCodigo: string | null = null;
      let descuentoCodigoId: number | null = null;
      let avisoDescuento: string | null = null;

      if (input.codigo) {
        const v = await this.discounts.validar(input.codigo, input.userId);
        if (v.valido) {
          let monto =
            v.tipo === 'porcentaje'
              ? Math.round((subtotal * (v.valor ?? 0)) / 100)
              : (v.valor ?? 0);
          if (monto > subtotal) monto = subtotal;
          descuentoMonto = monto;
          descuentoCodigo = input.codigo;
          descuentoCodigoId = v.codigoId ?? null;
        } else {
          avisoDescuento = v.motivo ?? 'Codigo no valido';
        }
      }

      if (input.userId) {
        const personal = await this.discounts.mejorDescuentoPersonal(
          input.userId,
          subtotal,
        );
        if (personal && personal.monto > descuentoMonto) {
          descuentoMonto = personal.monto;
          descuentoCodigo = personal.codigo;
          descuentoCodigoId = personal.codigoId;
          avisoDescuento = null;
        }
      }

      if (descuentoCodigoId !== null) {
        await tx.codigoDescuento.update({
          where: { id: descuentoCodigoId },
          data: { usos: { increment: 1 } },
        });
        if (input.userId) {
          await tx.usoCodigoDescuento.create({
            data: { codigoId: descuentoCodigoId, userId: input.userId },
          });
        }
      }

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
            puntosUsados = Math.min(input.puntosAUsar, total);
            total -= puntosUsados;
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

      // 5. Descontar stock (RESERVA)
      for (const item of input.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { decrement: item.cantidad } },
        });
      }

      // 6. Crear orden en estado pendiente_pago con expiracion
      const expira = new Date();
      expira.setMinutes(expira.getMinutes() + MINUTOS_EXPIRACION);

      // Envio: re-cotizar en backend (no confiar en precio del cliente).
      let costoEnvio = 0;
      let servicioEnvio: string | null = null;
      if (input.servicioEnvioCodigo && input.comunaEnvio) {
        try {
          const opciones = await this.shipping.cotizarCarrito(
            input.items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
            input.comunaEnvio,
          );
          const elegida = opciones.find((o) => o.codigo === input.servicioEnvioCodigo);
          if (elegida) {
            costoEnvio = elegida.precio;
            servicioEnvio = elegida.servicio;
            total += costoEnvio;
          }
        } catch {
          // Si falla la cotizacion, la orden se crea sin envio.
        }
      }

      const orden = await tx.orden.create({
        data: {
          total,
          descuentoMonto,
          descuentoCodigo,
          puntosUsados,
          costoEnvio,
          servicioEnvio,
          estado: 'pendiente_pago',
          fechaExpiracion: expira,
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

  // Confirma el pago de una orden pendiente. Idempotente: solo actua si esta pendiente_pago.
  async confirmarPago(ordenId: number, mpPaymentId?: string) {
    const orden = await this.prisma.orden.findUnique({ where: { id: ordenId } });
    if (!orden) return null;
    if (orden.estado !== 'pendiente_pago') return orden; // ya procesada, no hacer nada

    return this.prisma.orden.update({
      where: { id: ordenId },
      data: {
        estado: 'pagado',
        fechaExpiracion: null,
        mpPaymentId: mpPaymentId ?? orden.mpPaymentId,
      },
    });
  }

  // Cancela una orden pendiente y REVIERTE la reserva (stock, puntos, codigo).
  // Idempotente: solo actua si esta pendiente_pago.
  async cancelarOrden(ordenId: number) {
    return this.prisma.$transaction(async (tx) => {
      const orden = await tx.orden.findUnique({
        where: { id: ordenId },
        include: { items: true },
      });
      if (!orden) return null;
      if (orden.estado !== 'pendiente_pago') return orden; // no cancelar pagadas ni recancelar

      // 1. Devolver stock
      for (const item of orden.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { increment: item.cantidad } },
        });
      }

      // 2. Devolver puntos usados (movimiento positivo tipo devuelto)
      if (orden.userId && orden.puntosUsados > 0) {
        await tx.movimientoPuntos.create({
          data: {
            userId: orden.userId,
            cantidad: orden.puntosUsados,
            tipo: 'devuelto',
            ordenId: orden.id,
          },
        });
      }

      // 3. Anular puntos ganados de esta orden (se ubican por ordenId)
      await tx.movimientoPuntos.deleteMany({
        where: { ordenId: orden.id, tipo: 'ganado' },
      });

      // 4. Liberar codigo de descuento (decrementar usos + borrar uso del usuario)
      if (orden.descuentoCodigo) {
        const cod = await tx.codigoDescuento.findUnique({
          where: { codigo: orden.descuentoCodigo },
        });
        if (cod) {
          if (cod.usos > 0) {
            await tx.codigoDescuento.update({
              where: { id: cod.id },
              data: { usos: { decrement: 1 } },
            });
          }
          if (orden.userId) {
            await tx.usoCodigoDescuento.deleteMany({
              where: { codigoId: cod.id, userId: orden.userId },
            });
          }
        }
      }

      // 5. Marcar orden como cancelada
      return tx.orden.update({
        where: { id: ordenId },
        data: {
          estado: 'cancelado',
          fechaExpiracion: null,
          fechaCancelacion: new Date(),
        },
      });
    });
  }

  // Busca ordenes pendientes ya expiradas (para el proceso automatico).
  ordenesExpiradas() {
    return this.prisma.orden.findMany({
      where: {
        estado: 'pendiente_pago',
        fechaExpiracion: { lt: new Date() },
      },
      select: { id: true },
    });
  }

  updateEstado(id: number, estado: string) {
    const data: any = { estado };
    const ahora = new Date();
    if (estado === "enviado") data.fechaEnvio = ahora;
    if (estado === "entregado") data.fechaEntrega = ahora;
    if (estado === "cancelado") data.fechaCancelacion = ahora;
    return this.prisma.orden.update({
      where: { id },
      data,
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
