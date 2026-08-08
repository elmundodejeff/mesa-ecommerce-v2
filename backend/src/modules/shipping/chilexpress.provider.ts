import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CourierProvider, OpcionEnvio, GeoItem, CotizarParams } from './courier.interface';

@Injectable()
export class ChilexpressProvider implements CourierProvider {
  readonly nombre = 'chilexpress';

  private readonly logger = new Logger('Chilexpress');
  private readonly baseUrl = process.env.CHILEXPRESS_BASE_URL ?? 'https://testservices.wschilexpress.com';
  private readonly keyCobertura = process.env.CHILEXPRESS_KEY_COBERTURA ?? '';
  private readonly keyCotizador = process.env.CHILEXPRESS_KEY_COTIZADOR ?? '';

  private readonly REGION_TODAS = '99';
  private cacheComunas: Map<string, string> | null = null;

  private headersCobertura() {
    return {
      'Ocp-Apim-Subscription-Key': this.keyCobertura,
      'Cache-Control': 'no-cache',
    };
  }

  private async cargarComunas(regionCode: string): Promise<Map<string, string>> {
    if (this.cacheComunas) return this.cacheComunas;
    const url = `${this.baseUrl}/georeference/api/v1.0/coverage-areas?RegionCode=${regionCode}&type=1`;
    const resp = await fetch(url, { method: 'GET', headers: this.headersCobertura() });
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
    return mapa.get(nombreComuna.trim().toUpperCase()) ?? null;
  }

  async regiones(): Promise<GeoItem[]> {
    const url = `${this.baseUrl}/georeference/api/v1.0/regions`;
    const resp = await fetch(url, { method: 'GET', headers: this.headersCobertura() });
    if (!resp.ok) {
      this.logger.error(`Regiones fallo: ${resp.status}`);
      throw new BadRequestException('No se pudieron cargar las regiones');
    }
    const data: any = await resp.json();
    const regs: any[] = data?.regions ?? [];
    return regs.map((r) => ({ codigo: r.regionId ?? r.regionCode, nombre: r.regionName }));
  }

  async comunasPorRegion(regionCode: string): Promise<GeoItem[]> {
    const url = `${this.baseUrl}/georeference/api/v1.0/coverage-areas?RegionCode=${regionCode}&type=1`;
    const resp = await fetch(url, { method: 'GET', headers: this.headersCobertura() });
    if (!resp.ok) {
      this.logger.error(`Comunas fallo: ${resp.status}`);
      throw new BadRequestException('No se pudieron cargar las comunas');
    }
    const data: any = await resp.json();
    const areas: any[] = data?.coverageAreas ?? [];
    const vistos = new Set<string>();
    const comunas: GeoItem[] = [];
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

  async cotizar(params: CotizarParams): Promise<OpcionEnvio[]> {
    const codigoDestino = await this.codigoComuna(params.comunaDestino);
    if (!codigoDestino) {
      throw new BadRequestException(`No hay cobertura para la comuna: ${params.comunaDestino}`);
    }
    const codigoOrigen = await this.codigoComuna(params.comunaOrigen);
    if (!codigoOrigen) {
      throw new BadRequestException(`Origen sin cobertura: ${params.comunaOrigen}`);
    }

    const url = `${this.baseUrl}/rating/api/v1.0/rates/courier`;
    const body = {
      originCountyCode: codigoOrigen,
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
      courier: this.nombre,
      servicio: o.serviceDescription,
      codigo: o.serviceTypeCode,
      precio: Number(o.serviceValue),
      pesoFinal: o.finalWeight,
    }));
  }
}
