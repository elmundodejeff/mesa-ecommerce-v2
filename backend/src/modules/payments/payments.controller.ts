import { Controller, Post, Param, ParseIntPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('preferencia/:ordenId')
  crearPreferencia(@Param('ordenId', ParseIntPipe) ordenId: number) {
    return this.payments.crearPreferencia(ordenId);
  }
}
