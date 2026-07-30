import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class LoyaltyRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Movimientos no vencidos de un usuario
  movimientosVigentes(userId: string) {
    return this.prisma.movimientoPuntos.findMany({
      where: {
        userId,
        OR: [{ vence: null }, { vence: { gte: new Date() } }],
      },
      orderBy: { creado: 'desc' },
    });
  }

  todosLosMovimientos(userId: string) {
    return this.prisma.movimientoPuntos.findMany({
      where: { userId },
      orderBy: { creado: 'desc' },
    });
  }
}