import {
  IsString,
  IsInt,
  IsIn,
  IsBoolean,
  IsOptional,
  IsDateString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDescuentoDto {
  @IsString()
  @MinLength(1)
  codigo: string;

  @IsIn(['porcentaje', 'monto'])
  tipo: string;

  @IsInt()
  @Min(1)
  valor: number;

  @IsDateString()
  vigencia: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsos?: number;
  @IsOptional()
  @IsString()
  userId?: string;
}