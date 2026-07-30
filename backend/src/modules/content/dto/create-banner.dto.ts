import { IsString, IsInt, IsOptional, MinLength } from 'class-validator';

export class CreateBannerDto {
  @IsString() @MinLength(1) imagen: string;
  @IsOptional() @IsString() titulo?: string;
  @IsOptional() @IsString() subtitulo?: string;
  @IsOptional() @IsString() enlace?: string;
  @IsOptional() @IsInt() orden?: number;
}