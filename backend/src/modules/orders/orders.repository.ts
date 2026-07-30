import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { DiscountsService } from '../discounts/discounts.service';

interface ItemInput {
  productoId: number;
  cantidad: number;
}

interface CrearOrdenInput {
  items: ItemInput[];
  userId?: string;
  codigo?: string;
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
      // 1. Traer productos
      const ids = input.items.map((i) => i.productoId);
      const productos = await tx.producto.findMany({
        where: { id: { in: ids } },
      });

      // 2. Validar stock, calcular subtotal, armar items
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

      // 3. Aplicar codigo de descuento (si viene). Invalido -> se ignora con aviso.
      let descuentoMonto = 0;
      let descuentoCodigo: string | null = null;
      let avisoDescuento: string | null = null;

      if (input.codigo) {
        const v = await this.discounts.validar(input.codigo, input.userId);
        if (v.valido) {
          if (v.tipo === 'porcentaje') {
            descuentoMonto = Math.round((subtotal * (v.valor ?? 0)) / 100);
          } else {
            descuentoMonto = v.valor ?? 0;
          }
          // No dejar el total negativo
          if (descuentoMonto > subtotal) {
            descuentoMonto = subtotal;
          }
          descuentoCodigo = input.codigo;

          // Incrementar usos DENTRO de la transaccion (evita carrera)
          await tx.codigoDescuento.update({
            where: { id: v.codigoId },
            data: { usos: { increment: 1 } },
          });
        } else {
          avisoDescuento = v.motivo ?? 'Codigo no valido';
        }
      }

      const total = subtotal - descuentoMonto;

      // 4. Descontar stock
      for (const item of input.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { decrement: item.cantidad } },
        });
      }

      // 5. Crear orden
      const orden = await tx.orden.create({
        data: {
          total,
          descuentoMonto,
          descuentoCodigo,
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

      // Adjuntar aviso (no se persiste, solo va en la respuesta)
      return { ...orden, subtotal, avisoDescuento };
    });
  }

  updateEstado(id: number, estado: string) {
    return this.prisma.orden.update({
      where: { id },
      data: { estado },
    });
  }
}