import { IsString, IsInt, IsOptional, MinLength } from 'class-validator';

export class CreateMenuDto {
  @IsString() @MinLength(1) texto: string;
  @IsString() @MinLength(1) enlace: string;
  @IsOptional() @IsInt() orden?: number;
  @IsOptional() @IsInt() padreId?: number;
}