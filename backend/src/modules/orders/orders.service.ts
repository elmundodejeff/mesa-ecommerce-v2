import { Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrdenDto } from './dto/create-orden.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly repo: OrdersRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  async findOne(id: number) {
    const orden = await this.repo.findOne(id);
    if (!orden) {
      throw new NotFoundException(`Orden ${id} no encontrada`);
    }
    return orden;
  }

  checkout(dto: CreateOrdenDto, userId?: string) {
    return this.repo.crearOrden({ ...dto, userId });
  }

  async cambiarEstado(id: number, estado: string) {
    await this.findOne(id);
    return this.repo.updateEstado(id, estado);
  }
}