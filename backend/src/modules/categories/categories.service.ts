import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly repo: CategoriesRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  async findOne(id: number) {
    const cat = await this.repo.findOne(id);
    if (!cat) {
      throw new NotFoundException(`Categoria ${id} no encontrada`);
    }
    return cat;
  }

  async create(dto: CreateCategoriaDto) {
    try {
      return await this.repo.create(dto);
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('Ya existe una categoria con ese nombre');
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateCategoriaDto) {
    await this.findOne(id);
    try {
      return await this.repo.update(id, dto);
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('Ya existe una categoria con ese nombre');
      }
      throw e;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.repo.remove(id);
  }
}