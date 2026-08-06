import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrdersService } from './orders.service';

@Injectable()
export class OrdersExpirationService {
  private readonly logger = new Logger('OrdersExpiration');

  constructor(private readonly orders: OrdersService) {}

  // Cada 5 minutos: cancela ordenes pendiente_pago ya expiradas y libera la reserva.
  @Cron(CronExpression.EVERY_5_MINUTES)
  async expirarOrdenes() {
    const vencidas = await this.orders.ordenesExpiradas();
    if (vencidas.length === 0) return;

    for (const o of vencidas) {
      await this.orders.cancelarOrden(o.id);
    }
    this.logger.log(`Ordenes expiradas canceladas: ${vencidas.length}`);
  }
}
