import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.service';

@Injectable()
export class ComentarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Todos (para moderacion en admin)
  findPendientes() {
    return this.prisma.comentario.findMany({
      where: { aprobado: false },
      orderBy: { creado: 'desc' },
      include: {
        user: { select: { nombre: true } },
        entrada: { select: { titulo: true } },
      },
    });
  }

  create(data: {
    contenido: string;
    entradaId: number;
    userId: string;
  }) {
    return this.prisma.comentario.create({
      data: {
        contenido: data.contenido,
        entrada: { connect: { id: data.entradaId } },
        user: { connect: { id: data.userId } },
      },
    });
  }

  aprobar(id: number) {
    return this.prisma.comentario.update({
      where: { id },
      data: { aprobado: true },
    });
  }

  remove(id: number) {
    return this.prisma.comentario.delete({ where: { id } });
  }

  findOne(id: number) {
    return this.prisma.comentario.findUnique({ where: { id } });
  }
}