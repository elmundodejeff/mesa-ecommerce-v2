import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EntradaRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.entrada.findMany({
      orderBy: { fecha: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.entrada.findUnique({
      where: { id },
      include: {
        comentarios: {
          where: { aprobado: true },
          orderBy: { creado: 'desc' },
          include: { user: { select: { nombre: true } } },
        },
      },
    });
  }

  create(data: Prisma.EntradaCreateInput) {
    return this.prisma.entrada.create({ data });
  }

  update(id: number, data: Prisma.EntradaUpdateInput) {
    return this.prisma.entrada.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.entrada.delete({ where: { id } });
  }
}