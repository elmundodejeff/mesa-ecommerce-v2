import { IsString, IsInt, MinLength } from 'class-validator';

export class CreateComentarioDto {
  @IsString() @MinLength(1) contenido: string;
  @IsInt() entradaId: number;
}