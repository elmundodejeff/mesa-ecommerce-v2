import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsArray,
  IsIn,
  Min,
} from 'class-validator';

export class CreateProductoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsInt()
  @Min(0)
  precio: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsBoolean()
  destacado?: boolean;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsBoolean()
  preventa?: boolean;

  @IsOptional()
  @IsIn(["Español", "Inglés", "Japonés", "Otro"])
  idioma?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categoriaIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  seccionIds?: number[];
}