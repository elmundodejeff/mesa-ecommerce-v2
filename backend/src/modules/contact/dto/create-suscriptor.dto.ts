import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSuscriptorDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string;
}