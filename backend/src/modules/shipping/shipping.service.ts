import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

export interface OpcionEnvio {
  servicio: string;
  codigo: number;
  precio: number;
  pesoFinal: string;
}

const SERVICIOS_VENTA = [2, 3]; // 2 = PRIORITARIO, 3 = EXPRESS

@Injectable()
export class ShippingService {
  private readonly logger = new Logger('Shipping');
  private readonly baseUrl = process.env.CHILEXPRESS_BASE_URL ?? 'https://testservices.wschilexpress.com';
  private readonly keyCobertura = process.env.CHILEXPRESS_KEY_COBERTURA ?? '';
  private readonly keyCotizador = process.env.CHILEXPRESS_KEY_COTIZADOR ?? '';

  private readonly REGION_TODAS = '99';

  private cacheComunas: Map<string, string> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  private async cargarComunas(regionCode: string): Promise<Map<string, string>> {
    if (this.cacheComunas) return this.cacheComunas;

    const url = `${this.baseUrl}/georeference/api/v1.0/coverage-areas?RegionCode=${regionCode}&type=1`;
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': this.keyCobertura,
        'Cache-Control': 'no-cache',
      },
    });

    if (!resp.ok) {
      this.logger.error(`Cobertura fallo: ${resp.status}`);
      throw new BadRequestException('No se pudo consultar cobertura de Chilexpress');
    }

    const data: any = await resp.json();
    const areas: any[] = data?.coverageAreas ?? [];
    const mapa = new Map<string, string>();
    for (const a of areas) {
      if (a?.countyName && a?.countyCode) {
        mapa.set(String(a.countyName).trim().toUpperCase(), a.countyCode);
      }
    }
    this.cacheComunas = mapa;
    return mapa;
  }

  async codigoComuna(nombreComuna: string): Promise<string | null> {
    const mapa = await this.cargarComunas(this.REGION_TODAS);
    const clave = nombreComuna.trim().toUpperCase();
    return mapa.get(clave) ?? null;
  }

  // Lista de regiones de Chile (para el selector).
  async regiones(): Promise<{ codigo: string; nombre: string }[]> {
    const url = `${this.baseUrl}/georeference/api/v1.0/regions`;
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': this.keyCobertura,
        'Cache-Control': 'no-cache',
      },
    });
    if (!resp.ok) {
      this.logger.error(`Regiones fallo: ${resp.status}`);
      throw new BadRequestException('No se pudieron cargar las regiones');
    }
    const data: any = await resp.json();
    const regs: any[] = data?.regions ?? [];
    return regs.map((r) => ({
      codigo: r.regionId ?? r.regionCode,
      nombre: r.regionName,
    }));
  }

  // Comunas de una region especifica (para el selector dependiente).
  async comunasPorRegion(regionCode: string): Promise<{ codigo: string; nombre: string }[]> {
    const url = `${this.baseUrl}/georeference/api/v1.0/coverage-areas?RegionCode=${regionCode}&type=1`;
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': this.keyCobertura,
        'Cache-Control': 'no-cache',
      },
    });
    if (!resp.ok) {
      this.logger.error(`Comunas fallo: ${resp.status}`);
      throw new BadRequestException('No se pudieron cargar las comunas');
    }
    const data: any = await resp.json();
    const areas: any[] = data?.coverageAreas ?? [];
    const vistos = new Set<string>();
    const comunas: { codigo: string; nombre: string }[] = [];
    for (const a of areas) {
      const nombre = a?.countyName;
      if (nombre && !vistos.has(nombre)) {
        vistos.add(nombre);
        comunas.push({ codigo: a.countyCode, nombre });
      }
    }
    comunas.sort((x, y) => x.nombre.localeCompare(y.nombre));
    return comunas;
  }

  async cotizar(params: {
    comunaDestino: string;
    codigoOrigen: string;
    pesoKg: number;
    altoCm: number;
    anchoCm: number;
    largoCm: number;
    valorDeclarado: number;
  }): Promise<OpcionEnvio[]> {
    const codigoDestino = await this.codigoComuna(params.comunaDestino);
    if (!codigoDestino) {
      throw new BadRequestException(`No hay cobertura para la comuna: ${params.comunaDestino}`);
    }

    const url = `${this.baseUrl}/rating/api/v1.0/rates/courier`;
    const body = {
      originCountyCode: params.codigoOrigen,
      destinationCountyCode: codigoDestino,
      package: {
        weight: String(params.pesoKg),
        height: String(params.altoCm),
        width: String(params.anchoCm),
        length: String(params.largoCm),
      },
      productType: 3,
      contentType: 1,
      declaredWorth: String(params.valorDeclarado),
      deliveryTime: 0,
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.keyCotizador,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      this.logger.error(`Cotizador fallo: ${resp.status} ${txt}`);
      throw new BadRequestException('No se pudo cotizar el envio');
    }

    const data: any = await resp.json();
    const opciones: any[] = data?.data?.courierServiceOptions ?? [];
    return opciones.map((o) => ({
      servicio: o.serviceDescription,
      codigo: o.serviceTypeCode,
      precio: Number(o.serviceValue),
      pesoFinal: o.finalWeight,
    }));
  }

  async cotizarCarrito(items: { productoId: number; cantidad: number }[], comunaDestino: string): Promise<OpcionEnvio[]> {
    if (!items || items.length === 0) {
      throw new BadRequestException('El carrito esta vacio');
    }

    const ids = items.map((i) => i.productoId);
    const productos = await this.prisma.producto.findMany({ where: { id: { in: ids } } });

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
    const codigoOrigen = await this.codigoComuna(comunaOrigen);
    if (!codigoOrigen) {
      throw new BadRequestException(`Origen sin cobertura: ${comunaOrigen}`);
    }

    const opciones = await this.cotizar({
      comunaDestino,
      codigoOrigen,
      pesoKg: Math.max(0.1, Math.round(pesoTotal * 100) / 100),
      altoCm: Math.max(1, Math.round(altoTotal)),
      anchoCm: Math.max(1, Math.round(anchoMax)),
      largoCm: Math.max(1, Math.round(largoMax)),
      valorDeclarado: valorTotal,
    });

    return opciones.filter((o) => SERVICIOS_VENTA.includes(o.codigo));
  }
}
