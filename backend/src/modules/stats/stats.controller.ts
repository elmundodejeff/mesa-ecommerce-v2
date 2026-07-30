import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Get('resumen')
  resumen() {
    return this.service.resumen();
  }

  @Get('ventas-mes')
  ventasPorMes() {
    return this.service.ventasPorMes();
  }

  @Get('ventas-dia')
  ventasPorDia(@Query('dias', new ParseIntPipe({ optional: true })) dias?: number) {
    return this.service.ventasPorDia(dias ?? 7);
  }
}