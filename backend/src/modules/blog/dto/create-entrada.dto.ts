import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateEntradaDto {
  @IsString() @MinLength(1) titulo: string;
  @IsString() @MinLength(1) contenido: string;
  @IsOptional() @IsString() imagen?: string;
}