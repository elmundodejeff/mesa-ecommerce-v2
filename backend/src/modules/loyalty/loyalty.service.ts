import { Injectable } from '@nestjs/common';
import { LoyaltyRepository } from './loyalty.repository';

@Injectable()
export class LoyaltyService {
  constructor(private readonly repo: LoyaltyRepository) {}

  async saldo(userId: string): Promise<number> {
    const movs = await this.repo.movimientosVigentes(userId);
    return movs.reduce((s, m) => s + m.cantidad, 0);
  }

  async resumen(userId: string) {
    const [saldoActual, movimientos] = await Promise.all([
      this.saldo(userId),
      this.repo.todosLosMovimientos(userId),
    ]);
    return { saldo: saldoActual, movimientos };
  }
}