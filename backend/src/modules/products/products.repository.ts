import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.producto.findMany({
      include: { imagenes: true, categorias: true },
    });
  }

  findOne(id: number) {
    return this.prisma.producto.findUnique({
      where: { id },
      include: { imagenes: true, categorias: true },
    });
  }

  create(data: Prisma.ProductoCreateInput) {
    return this.prisma.producto.create({ data });
  }

  update(id: number, data: Prisma.ProductoUpdateInput) {
    return this.prisma.producto.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.producto.delete({ where: { id } });
  }
}