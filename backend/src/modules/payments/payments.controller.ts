import { Controller, Post, Get, Param, Query, Body, ParseIntPipe, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('preferencia/:ordenId')
  crearPreferencia(@Param('ordenId', ParseIntPipe) ordenId: number) {
    return this.payments.crearPreferencia(ordenId);
  }

  // MercadoPago llama aqui al cambiar el estado de un pago.
  // Responde 200 rapido; MP reintenta si no recibe 200.
  @Post('webhook')
  @HttpCode(200)
  webhook(@Query() query: any, @Body() body: any) {
    return this.payments.procesarWebhook(query, body);
  }

  // Algunas configuraciones de MP mandan GET de verificacion.
  @Get('webhook')
  @HttpCode(200)
  webhookGet(@Query() query: any) {
    return this.payments.procesarWebhook(query, {});
  }
}
