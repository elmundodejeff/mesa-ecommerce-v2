import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BannerRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.bannerSlide.findMany({ orderBy: { orden: 'asc' } });
  }

  create(data: Prisma.BannerSlideCreateInput) {
    return this.prisma.bannerSlide.create({ data });
  }

  update(id: number, data: Prisma.BannerSlideUpdateInput) {
    return this.prisma.bannerSlide.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.bannerSlide.delete({ where: { id } });
  }

  findOne(id: number) {
    return this.prisma.bannerSlide.findUnique({ where: { id } });
  }
}