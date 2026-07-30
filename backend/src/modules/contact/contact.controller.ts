import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('contact')
export class ContactController {
  constructor(private readonly service: ContactService) {}

  // Publico: enviar mensaje desde la tienda
  @Post()
  crear(@Body() dto: CreateContactoDto) {
    return this.service.crear(dto);
  }

  // Admin: bandeja de mensajes
  @UseGuards(JwtAuthGuard)
  @Get()
  listar() {
    return this.service.listar();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/leido')
  marcarLeido(@Param('id', ParseIntPipe) id: number) {
    return this.service.marcarLeido(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}