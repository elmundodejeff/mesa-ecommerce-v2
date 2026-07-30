import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ContactoCreateInput) {
    return this.prisma.contacto.create({ data });
  }

  findAll() {
    return this.prisma.contacto.findMany({ orderBy: { fecha: 'desc' } });
  }

  findOne(id: number) {
    return this.prisma.contacto.findUnique({ where: { id } });
  }

  marcarLeido(id: number) {
    return this.prisma.contacto.update({
      where: { id },
      data: { leido: true },
    });
  }

  remove(id: number) {
    return this.prisma.contacto.delete({ where: { id } });
  }
}