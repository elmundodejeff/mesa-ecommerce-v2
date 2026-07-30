import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MenuRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Solo items raiz (sin padre), con sus hijos anidados
  findAll() {
    return this.prisma.menuItem.findMany({
      where: { padreId: null },
      orderBy: { orden: 'asc' },
      include: {
        hijos: { orderBy: { orden: 'asc' } },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.menuItem.findUnique({ where: { id } });
  }

  create(data: Prisma.MenuItemCreateInput) {
    return this.prisma.menuItem.create({ data });
  }

  update(id: number, data: Prisma.MenuItemUpdateInput) {
    return this.prisma.menuItem.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.menuItem.delete({ where: { id } });
  }
}