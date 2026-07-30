import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.categoria.findMany({
      include: { _count: { select: { productos: true } } },
    });
  }

  findOne(id: number) {
    return this.prisma.categoria.findUnique({
      where: { id },
      include: { productos: true },
    });
  }

  create(data: Prisma.CategoriaCreateInput) {
    return this.prisma.categoria.create({ data });
  }

  update(id: number, data: Prisma.CategoriaUpdateInput) {
    return this.prisma.categoria.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.categoria.delete({ where: { id } });
  }
}