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
  // --- Suscriptores newsletter ---
  findSuscriptorByEmail(email: string) {
    return this.prisma.suscriptor.findUnique({ where: { email } });
  }
  createSuscriptor(data: Prisma.SuscriptorCreateInput) {
    return this.prisma.suscriptor.create({ data });
  }
  findAllSuscriptores() {
    return this.prisma.suscriptor.findMany({ orderBy: { createdAt: 'desc' } });
  }
}