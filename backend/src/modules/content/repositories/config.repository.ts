import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  // upsert: crea con defaults si no existe (id=1), o devuelve la existente
  obtener() {
    return this.prisma.config.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
  }

  actualizar(data: Prisma.ConfigUpdateInput) {
    return this.prisma.config.update({
      where: { id: 1 },
      data,
    });
  }
}