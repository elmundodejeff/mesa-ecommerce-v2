import { Injectable, NotFoundException } from '@nestjs/common';
import { EntradaRepository } from './repositories/entrada.repository';
import { ComentarioRepository } from './repositories/comentario.repository';
import { CreateEntradaDto } from './dto/create-entrada.dto';
import { UpdateEntradaDto } from './dto/update-entrada.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';

@Injectable()
export class BlogService {
  constructor(
    private readonly entradas: EntradaRepository,
    private readonly comentarios: ComentarioRepository,
  ) {}

  // --- Entradas ---
  listarEntradas() {
    return this.entradas.findAll();
  }

  async verEntrada(id: number) {
    const e = await this.entradas.findOne(id);
    if (!e) throw new NotFoundException(`Entrada ${id} no encontrada`);
    return e;
  }

  crearEntrada(dto: CreateEntradaDto) {
    return this.entradas.create(dto);
  }

  async actualizarEntrada(id: number, dto: UpdateEntradaDto) {
    await this.verEntrada(id);
    return this.entradas.update(id, dto);
  }

  async eliminarEntrada(id: number) {
    await this.verEntrada(id);
    return this.entradas.remove(id);
  }

  // --- Comentarios ---
  crearComentario(dto: CreateComentarioDto, userId: string) {
    return this.comentarios.create({
      contenido: dto.contenido,
      entradaId: dto.entradaId,
      userId,
    });
  }

  listarPendientes() {
    return this.comentarios.findPendientes();
  }

  async aprobarComentario(id: number) {
    const c = await this.comentarios.findOne(id);
    if (!c) throw new NotFoundException(`Comentario ${id} no encontrado`);
    return this.comentarios.aprobar(id);
  }

  async eliminarComentario(id: number) {
    const c = await this.comentarios.findOne(id);
    if (!c) throw new NotFoundException(`Comentario ${id} no encontrado`);
    return this.comentarios.remove(id);
  }
}