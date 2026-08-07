import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateDireccionDto {
  @IsString() @MinLength(1) alias: string;
  @IsString() @MinLength(1) calle: string;
  @IsString() @MinLength(1) ciudad: string;
  @IsString() @MinLength(1) region: string;
  @IsOptional() @IsString() comuna?: string;
  @IsOptional() @IsBoolean() esPrincipal?: boolean;
}

export class UpdateDireccionDto {
  @IsOptional() @IsString() alias?: string;
  @IsOptional() @IsString() calle?: string;
  @IsOptional() @IsString() ciudad?: string;
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() comuna?: string;
  @IsOptional() @IsBoolean() esPrincipal?: boolean;
}