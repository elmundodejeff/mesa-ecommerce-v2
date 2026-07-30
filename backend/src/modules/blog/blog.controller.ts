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
  Req,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateEntradaDto } from './dto/create-entrada.dto';
import { UpdateEntradaDto } from './dto/update-entrada.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('blog')
export class BlogController {
  constructor(private readonly service: BlogService) {}

  // --- Entradas (publico leer) ---
  @Get('entradas')
  listar() {
    return this.service.listarEntradas();
  }

  @Get('entradas/:id')
  ver(@Param('id', ParseIntPipe) id: number) {
    return this.service.verEntrada(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('entradas')
  crear(@Body() dto: CreateEntradaDto) {
    return this.service.crearEntrada(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('entradas/:id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEntradaDto,
  ) {
    return this.service.actualizarEntrada(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('entradas/:id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminarEntrada(id);
  }

  // --- Comentarios ---
  // Crear comentario: requiere login (queda pendiente de aprobacion)
  @UseGuards(JwtAuthGuard)
  @Post('comentarios')
  comentar(@Body() dto: CreateComentarioDto, @Req() req: any) {
    return this.service.crearComentario(dto, req.user.id);
  }

  // Moderacion (admin)
  @UseGuards(JwtAuthGuard)
  @Get('comentarios/pendientes')
  pendientes() {
    return this.service.listarPendientes();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('comentarios/:id/aprobar')
  aprobar(@Param('id', ParseIntPipe) id: number) {
    return this.service.aprobarComentario(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comentarios/:id')
  eliminarComentario(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminarComentario(id);
  }
}