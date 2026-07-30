import { IsString, IsInt, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class CreateSeccionDto {
  @IsString()
  @MinLength(1)
  nombre: string;

  @IsOptional()
  @IsInt()
  orden?: number;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}