import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SectionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.seccion.findMany({
      orderBy: { orden: 'asc' },
      include: { _count: { select: { productos: true } } },
    });
  }

  activasConProductos() {
    return this.prisma.seccion.findMany({
      where: { activa: true },
      orderBy: { orden: "asc" },
      include: {
        productos: {
          include: { imagenes: true, categorias: true, secciones: true },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.seccion.findUnique({
      where: { id },
      include: { productos: true },
    });
  }

  create(data: Prisma.SeccionCreateInput) {
    return this.prisma.seccion.create({ data });
  }

  update(id: number, data: Prisma.SeccionUpdateInput) {
    return this.prisma.seccion.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.seccion.delete({ where: { id } });
  }
}