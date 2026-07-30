import {
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsOptional,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrdenItemDto {
  @IsInt()
  productoId: number;

  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CreateOrdenDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrdenItemDto)
  items: OrdenItemDto[];

  @IsOptional()
  @IsString()
  nombreEnvio?: string;

  @IsOptional()
  @IsString()
  direccionEnvio?: string;

  @IsOptional()
  @IsString()
  ciudadEnvio?: string;

  @IsOptional()
  @IsString()
  regionEnvio?: string;

  @IsOptional()
  @IsString()
  comunaEnvio?: string;

  @IsOptional()
  @IsString()
  telefonoEnvio?: string;

  @IsOptional()
  @IsString()
  rutEnvio?: string;

  @IsOptional()
  @IsString()
  codigoPostalEnvio?: string;

  @IsOptional()
  @IsString()
  notaEntrega?: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  puntosAUsar?: number;
}