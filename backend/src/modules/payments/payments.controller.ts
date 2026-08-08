import { Controller, Post, Get, Param, Query, Body, ParseIntPipe, HttpCode, ForbiddenException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly orders: OrdersService,
  ) {}
  @Post('preferencia/:ordenId')
  crearPreferencia(@Param('ordenId', ParseIntPipe) ordenId: number) {
    return this.payments.crearPreferencia(ordenId);
  }
  // MercadoPago llama aqui al cambiar el estado de un pago.
  @Post('webhook')
  @HttpCode(200)
  webhook(@Query() query: any, @Body() body: any) {
    return this.payments.procesarWebhook(query, body);
  }
  @Get('webhook')
  @HttpCode(200)
  webhookGet(@Query() query: any) {
    return this.payments.procesarWebhook(query, {});
  }
  // ENDPOINT DE PRUEBA (solo desarrollo): simula la respuesta de MercadoPago.
  // POST /payments/simular/:ordenId?estado=approved (o rejected)
  @Post('simular/:ordenId')
  async simular(
    @Param('ordenId', ParseIntPipe) ordenId: number,
    @Query('estado') estado: string,
  ) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('No disponible en produccion');
    }
    const e = estado ?? 'approved';
    if (e === 'approved') {
      const orden = await this.orders.confirmarPago(ordenId, 'SIMULADO');
      return { simulado: true, estado: 'approved', orden };
    }
    if (e === 'rejected' || e === 'cancelled') {
      const orden = await this.orders.cancelarOrden(ordenId);
      return { simulado: true, estado: e, orden };
    }
    return { simulado: true, estado: e, nota: 'sin accion' };
  }
}
