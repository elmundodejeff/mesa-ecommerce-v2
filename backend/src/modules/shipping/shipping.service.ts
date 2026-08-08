import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { ChilexpressProvider } from './chilexpress.provider';
import { CourierProvider, OpcionEnvio, GeoItem } from './courier.interface';

// Codigos de servicio que se ofrecen a la venta (se descartan devoluciones, etc.).
// Nota: hoy son los de Chilexpress. Al integrar mas couriers, esto se movera
// a la config de cada provider.
const SERVICIOS_VENTA = [2, 3]; // 2 = PRIORITARIO, 3 = EXPRESS

@Injectable()
export class ShippingService {
  // Lista de couriers activos. Hoy solo Chilexpress; al agregar Bluexpress/Starken
  // se suman aqui y cotizarCarrito los consultara a todos.
  private readonly couriers: CourierProvider[];

  constructor(
    private readonly prisma: PrismaService,
    private readonly chilexpress: ChilexpressProvider,
  ) {
    this.couriers = [this.chilexpress];
  }

  // Provider por defecto (para regiones/comunas/validacion, que hoy usan Chilexpress).
  private get principal(): CourierProvider {
    return this.chilexpress;
  }

  // --- Metodos usados por selectores y validacion (delegan en el provider principal) ---

  regiones(): Promise<GeoItem[]> {
    return this.principal.regiones();
  }

  comunasPorRegion(regionCode: string): Promise<GeoItem[]> {
    return this.principal.comunasPorRegion(regionCode);
  }

  codigoComuna(nombreComuna: string): Promise<string | null> {
    return this.principal.codigoComuna(nombreComuna);
  }

  // --- Cotizacion del carrito ---

  async cotizarCarrito(
    items: { productoId: number; cantidad: number }[],
    comunaDestino: string,
  ): Promise<OpcionEnvio[]> {
    if (!items || items.length === 0) {
      throw new BadRequestException('El carrito esta vacio');
    }

    const ids = items.map((i) => i.productoId);
    const productos = await this.prisma.producto.findMany({ where: { id: { in: ids } } });

    // Calcular el paquete: peso total, alto sumado, ancho/largo maximo, valor total.
    let pesoTotal = 0;
    let altoTotal = 0;
    let anchoMax = 0;
    let largoMax = 0;
    let valorTotal = 0;

    for (const item of items) {
      const prod = productos.find((p) => p.id === item.productoId);
      if (!prod) continue;
      pesoTotal += prod.pesoKg * item.cantidad;
      altoTotal += prod.altoCm * item.cantidad;
      anchoMax = Math.max(anchoMax, prod.anchoCm);
      largoMax = Math.max(largoMax, prod.largoCm);
      valorTotal += prod.precio * item.cantidad;
    }

    const config = await this.prisma.config.findUnique({ where: { id: 1 } });
    const comunaOrigen = config?.envioComunaOrigen ?? 'Providencia';

    const params = {
      comunaDestino,
      comunaOrigen,
      pesoKg: Math.max(0.1, Math.round(pesoTotal * 100) / 100),
      altoCm: Math.max(1, Math.round(altoTotal)),
      anchoCm: Math.max(1, Math.round(anchoMax)),
      largoCm: Math.max(1, Math.round(largoMax)),
      valorDeclarado: valorTotal,
    };

    // Cotizar con todos los couriers activos y juntar las opciones.
    const todas: OpcionEnvio[] = [];
    for (const courier of this.couriers) {
      try {
        const ops = await courier.cotizar(params);
        todas.push(...ops);
      } catch (e) {
        // Si un courier falla, se ignora y se sigue con los demas.
      }
    }

    // Filtrar solo servicios de venta y ordenar por precio (mas barato primero).
    return todas
      .filter((o) => SERVICIOS_VENTA.includes(o.codigo))
      .sort((a, b) => a.precio - b.precio);
  }
}
