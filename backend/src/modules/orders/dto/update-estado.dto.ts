import { IsString, IsIn } from 'class-validator';

export class UpdateEstadoDto {
  @IsString()
  @IsIn(['nuevo', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado'])
  estado: string;
}