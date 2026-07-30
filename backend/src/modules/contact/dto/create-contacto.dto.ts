import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateContactoDto {
  @IsString() @MinLength(1) nombre: string;
  @IsEmail() email: string;
  @IsString() @MinLength(1) mensaje: string;
}