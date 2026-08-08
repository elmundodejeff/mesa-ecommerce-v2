import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ShippingService } from './shipping.service';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shipping: ShippingService) {}

  // Lista de regiones. GET /shipping/regiones
  @Get('regiones')
  regiones() {
    return this.shipping.regiones();
  }

  // Comunas de una region. GET /shipping/comunas?region=R13
  @Get('comunas')
  comunas(@Query('region') region: string) {
    return this.shipping.comunasPorRegion(region ?? '');
  }

  // Valida una comuna y devuelve su codigo. GET /shipping/comuna?nombre=Providencia
  @Get('comuna')
  async comuna(@Query('nombre') nombre: string) {
    const codigo = await this.shipping.codigoComuna(nombre ?? '');
    return { comuna: nombre, codigo };
  }

  // Cotiza a partir del carrito. POST /shipping/cotizar-carrito
  // body: { items: [{ productoId, cantidad }], comunaDestino }
  @Post('cotizar-carrito')
  async cotizarCarrito(@Body() body: any) {
    return this.shipping.cotizarCarrito(body.items ?? [], body.comunaDestino ?? '');
  }
}
