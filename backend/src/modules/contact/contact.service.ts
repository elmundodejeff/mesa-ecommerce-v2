import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactRepository } from './contact.repository';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { CreateSuscriptorDto } from './dto/create-suscriptor.dto';
@Injectable()
export class ContactService {
  constructor(private readonly repo: ContactRepository) {}
  crear(dto: CreateContactoDto) {
    return this.repo.create(dto);
  }
  listar() {
    return this.repo.findAll();
  }
  async marcarLeido(id: number) {
    const c = await this.repo.findOne(id);
    if (!c) throw new NotFoundException(`Mensaje ${id} no encontrado`);
    return this.repo.marcarLeido(id);
  }
  async eliminar(id: number) {
    const c = await this.repo.findOne(id);
    if (!c) throw new NotFoundException(`Mensaje ${id} no encontrado`);
    return this.repo.remove(id);
  }
  // --- Newsletter ---
  async suscribir(dto: CreateSuscriptorDto) {
    const email = dto.email.trim().toLowerCase();
    const existente = await this.repo.findSuscriptorByEmail(email);
    if (existente) {
      return { ok: true, yaExistia: true };
    }
    await this.repo.createSuscriptor({ email, nombre: dto.nombre?.trim() });
    return { ok: true, yaExistia: false };
  }
  listarSuscriptores() {
    return this.repo.findAllSuscriptores();
  }
}