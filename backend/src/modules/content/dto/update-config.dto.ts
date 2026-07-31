import { IsString, IsInt, IsBoolean, IsOptional, IsObject } from 'class-validator';

export class UpdateConfigDto {
  @IsOptional() @IsString() colorMarca?: string;
  @IsOptional() @IsString() nombreSitio?: string;
  @IsOptional() @IsString() logo?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() colorHeader?: string;
  @IsOptional() @IsString() colorHeaderTexto?: string;
  @IsOptional() @IsString() fuente?: string;
  @IsOptional() @IsString() contactoCorreo?: string;
  @IsOptional() @IsString() contactoHorario?: string;
  @IsOptional() @IsString() contactoInstagram?: string;
  @IsOptional() @IsString() contactoTiktok?: string;
  @IsOptional() @IsString() contactoTelefono?: string;
  @IsOptional() @IsString() contactoDireccion?: string;
  @IsOptional() @IsBoolean() preventaActiva?: boolean;
  @IsOptional() @IsString() tituloPreventa?: string;
  @IsOptional() @IsInt() ordenDestacados?: number;
  @IsOptional() @IsInt() ordenPreventa?: number;
  @IsOptional() @IsInt() porcentajePuntosGlobal?: number;
  @IsOptional() @IsInt() diasVencimientoPuntos?: number;
  @IsOptional() @IsObject() sobreNosotros?: Record<string, unknown>;
}