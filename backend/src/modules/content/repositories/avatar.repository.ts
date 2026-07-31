import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.service';

@Injectable()
export class AvatarRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.avatar.findMany({ orderBy: { creado: 'desc' } });
  }

  findOne(id: number) {
    return this.prisma.avatar.findUnique({ where: { id } });
  }

  create(url: string) {
    return this.prisma.avatar.create({ data: { url } });
  }

  remove(id: number) {
    return this.prisma.avatar.delete({ where: { id } });
  }
}