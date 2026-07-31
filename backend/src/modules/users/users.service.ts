import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
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

  async actualizarDatos(
    id: string,
    data: { nombre?: string; telefono?: string; rut?: string },
  ) {
    let rutNormalizado: string | undefined;
    if (data.rut) {
      if (!validarRut(data.rut)) {
        throw new BadRequestException("RUT invalido");
      }
      rutNormalizado = formatearRut(data.rut);
    }
    return this.repo.actualizarDatos(id, {
      nombre: data.nombre,
      telefono: data.telefono,
      rut: rutNormalizado,
    });
  }


  // --- Direcciones ---
  listarDirecciones(userId: string) {
    return this.repo.listarDirecciones(userId);
  }

  desactivar(id: string) {
    return this.repo.desactivar(id);
  }

  async crearDireccion(userId: string, data: {
    alias: string; calle: string; ciudad: string; region: string; esPrincipal?: boolean;
  }) {
    if (data.esPrincipal) {
      await this.repo.desmarcarPrincipales(userId);
    }
    return this.repo.crearDireccion(userId, data);
  }

  async actualizarDireccion(userId: string, id: string, data: {
    alias?: string; calle?: string; ciudad?: string; region?: string; esPrincipal?: boolean;
  }) {
    const dir = await this.repo.buscarDireccion(id);
    if (!dir) throw new NotFoundException("Direccion no encontrada");
    if (dir.userId !== userId) throw new ForbiddenException("No autorizado");
    if (data.esPrincipal) {
      await this.repo.desmarcarPrincipales(userId);
    }
    return this.repo.actualizarDireccion(id, data);
  }

  async borrarDireccion(userId: string, id: string) {
    const dir = await this.repo.buscarDireccion(id);
    if (!dir) throw new NotFoundException("Direccion no encontrada");
    if (dir.userId !== userId) throw new ForbiddenException("No autorizado");
    return this.repo.borrarDireccion(id);
  }

}