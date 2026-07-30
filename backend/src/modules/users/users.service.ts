import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { validarRut, formatearRut } from '../../shared/rut/rut.util';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  findByEmail(email: string) {
    return this.repo.findByEmail(email);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  async create(params: {
    email: string;
    password: string;
    nombre?: string;
    rut?: string;
  }) {
    const existe = await this.repo.findByEmail(params.email);
    if (existe) {
      throw new ConflictException('El email ya esta registrado');
    }

    let rutNormalizado: string | undefined;
    if (params.rut) {
      if (!validarRut(params.rut)) {
        throw new BadRequestException('RUT invalido');
      }
      rutNormalizado = formatearRut(params.rut);
    }

    const hash = await bcrypt.hash(params.password, 10);

    return this.repo.create({
      email: params.email,
      password: hash,
      nombre: params.nombre,
      rut: rutNormalizado,
    });
  }

  async actualizarAvatar(id: string, avatar: string) {
    return this.repo.actualizarAvatar(id, avatar);
  }

}