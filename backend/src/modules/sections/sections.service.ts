import { Injectable, NotFoundException } from '@nestjs/common';
import { SectionsRepository } from './sections.repository';
import { CreateSeccionDto } from './dto/create-seccion.dto';
import { UpdateSeccionDto } from './dto/update-seccion.dto';

@Injectable()
export class SectionsService {
  constructor(private readonly repo: SectionsRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  async findOne(id: number) {
    const sec = await this.repo.findOne(id);
    if (!sec) {
      throw new NotFoundException(`Seccion ${id} no encontrada`);
    }
    return sec;
  }

  create(dto: CreateSeccionDto) {
    return this.repo.create(dto);
  }

  async update(id: number, dto: UpdateSeccionDto) {
    await this.findOne(id);
    return this.repo.update(id, dto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.repo.remove(id);
  }
}