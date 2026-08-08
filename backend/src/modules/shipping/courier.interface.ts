// Contrato que todo courier debe implementar. Permite agregar Bluexpress, Starken, etc.
// sin tocar la logica de negocio del ShippingService.

export interface OpcionEnvio {
  courier: string;      // identificador del courier (ej. "chilexpress")
  servicio: string;     // nombre del servicio (ej. "EXPRESS")
  codigo: number;       // codigo del servicio dentro del courier
  precio: number;
  pesoFinal: string;
}

export interface GeoItem {
  codigo: string;
  nombre: string;
}

export interface CotizarParams {
  comunaDestino: string;
  comunaOrigen: string;
  pesoKg: number;
  altoCm: number;
  anchoCm: number;
  largoCm: number;
  valorDeclarado: number;
}

export interface CourierProvider {
  // Identificador unico del courier.
  readonly nombre: string;

  // Lista de regiones (para selectores).
  regiones(): Promise<GeoItem[]>;

  // Comunas de una region.
  comunasPorRegion(regionCode: string): Promise<GeoItem[]>;

  // Valida que una comuna exista en la cobertura del courier. Devuelve su codigo o null.
  codigoComuna(nombreComuna: string): Promise<string | null>;

  // Cotiza un envio. Devuelve las opciones de servicio con precios.
  cotizar(params: CotizarParams): Promise<OpcionEnvio[]>;
}
