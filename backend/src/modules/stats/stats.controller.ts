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
  @Get('mas-vendidos')
  masVendidos(@Query('limite', new ParseIntPipe({ optional: true })) limite?: number) {
    return this.service.masVendidos(limite ?? 5);
  }
  @Get('menos-vendidos')
  menosVendidos(@Query('limite', new ParseIntPipe({ optional: true })) limite?: number) {
    return this.service.menosVendidos(limite ?? 5);
  }
  @Get('top-compradores')
  topCompradores(@Query('limite', new ParseIntPipe({ optional: true })) limite?: number) {
    return this.service.topCompradores(limite ?? 5);
  }
  @Get('proyeccion')
  proyeccion(@Query('meses', new ParseIntPipe({ optional: true })) meses?: number) {
    return this.service.proyeccion(meses ?? 6);
  }
}