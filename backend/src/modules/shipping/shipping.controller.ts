import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ShippingService } from './shipping.service';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shipping: ShippingService) {}

  // Prueba: traduce una comuna a su codigo. GET /shipping/comuna?nombre=Providencia
  @Get('comuna')
  async comuna(@Query('nombre') nombre: string) {
    const codigo = await this.shipping.codigoComuna(nombre ?? '');
    return { comuna: nombre, codigo };
  }

  // Cotiza un envio. POST /shipping/cotizar
  // body: { comunaDestino, codigoOrigen, pesoKg, altoCm, anchoCm, largoCm, valorDeclarado }
  // Cotiza a partir del carrito. POST /shipping/cotizar-carrito
  // body: { items: [{ productoId, cantidad }], comunaDestino }
  @Post('cotizar-carrito')
  async cotizarCarrito(@Body() body: any) {
    return this.shipping.cotizarCarrito(body.items ?? [], body.comunaDestino ?? '');
  }

  @Post('cotizar')
  async cotizar(@Body() body: any) {
    return this.shipping.cotizar({
      comunaDestino: body.comunaDestino,
      codigoOrigen: body.codigoOrigen ?? 'STGO',
      pesoKg: Number(body.pesoKg ?? 1),
      altoCm: Number(body.altoCm ?? 7),
      anchoCm: Number(body.anchoCm ?? 30),
      largoCm: Number(body.largoCm ?? 30),
      valorDeclarado: Number(body.valorDeclarado ?? 10000),
    });
  }
}
