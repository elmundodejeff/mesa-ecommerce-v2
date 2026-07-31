import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { Prisma } from '@prisma/client';
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}
  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }
  actualizarAvatar(id: string, avatar: string) {
    return this.prisma.user.update({
      where: { id },
      data: { avatar },
    });
  }

  actualizarDatos(
    id: string,
    data: { nombre?: string; telefono?: string; rut?: string },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  desactivar(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { activo: false },
    });
  }

  // --- Direcciones ---
  listarDirecciones(userId: string) {
    return this.prisma.direccion.findMany({
      where: { userId },
      orderBy: { esPrincipal: "desc" },
    });
  }

  buscarDireccion(id: string) {
    return this.prisma.direccion.findUnique({ where: { id } });
  }

  crearDireccion(userId: string, data: {
    alias: string; calle: string; ciudad: string; region: string; esPrincipal?: boolean;
  }) {
    return this.prisma.direccion.create({
      data: { ...data, userId },
    });
  }

  actualizarDireccion(id: string, data: {
    alias?: string; calle?: string; ciudad?: string; region?: string; esPrincipal?: boolean;
  }) {
    return this.prisma.direccion.update({ where: { id }, data });
  }

  borrarDireccion(id: string) {
    return this.prisma.direccion.delete({ where: { id } });
  }

  // Desmarca todas las principales del usuario (para dejar solo una)
  desmarcarPrincipales(userId: string) {
    return this.prisma.direccion.updateMany({
      where: { userId, esPrincipal: true },
      data: { esPrincipal: false },
    });
  }
}