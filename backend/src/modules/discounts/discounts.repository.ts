import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DiscountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.codigoDescuento.findMany({
      orderBy: { id: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.codigoDescuento.findUnique({ where: { id } });
  }

  findByCodigo(codigo: string) {
    return this.prisma.codigoDescuento.findUnique({ where: { codigo } });
  }
  findPersonalesDeUsuario(userId: string) {
    return this.prisma.codigoDescuento.findMany({
      where: {
        userId,
        activo: true,
        vigencia: { gte: new Date() },
      },
    });
  }

  create(data: Prisma.CodigoDescuentoCreateInput) {
    return this.prisma.codigoDescuento.create({ data });
  }

  update(id: number, data: Prisma.CodigoDescuentoUpdateInput) {
    return this.prisma.codigoDescuento.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.codigoDescuento.delete({ where: { id } });
  }
}