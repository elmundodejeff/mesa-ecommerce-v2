import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

interface ProductoData {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  destacado?: boolean;
  sku?: string;
  preventa?: boolean;
  categoriaIds?: number[];
  seccionIds?: number[];
}

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.producto.findMany({
      include: { imagenes: true, categorias: true, secciones: true },
    });
  }

  findOne(id: number) {
    return this.prisma.producto.findUnique({
      where: { id },
      include: { imagenes: true, categorias: true, secciones: true },
    });
  }

  create(data: ProductoData) {
    const { categoriaIds, seccionIds, ...resto } = data;
    return this.prisma.producto.create({
      data: {
        ...resto,
        nombre: resto.nombre!,
        precio: resto.precio!,
        stock: resto.stock!,
        categorias: categoriaIds
          ? { connect: categoriaIds.map((id) => ({ id })) }
          : undefined,
        secciones: seccionIds
          ? { connect: seccionIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { categorias: true, secciones: true },
    });
  }

  update(id: number, data: ProductoData) {
    const { categoriaIds, seccionIds, ...resto } = data;
    return this.prisma.producto.update({
      where: { id },
      data: {
        ...resto,
        // set reemplaza todas las relaciones por las nuevas
        categorias: categoriaIds
          ? { set: categoriaIds.map((id) => ({ id })) }
          : undefined,
        secciones: seccionIds
          ? { set: seccionIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { categorias: true, secciones: true },
    });
  }

  remove(id: number) {
    return this.prisma.producto.delete({ where: { id } });
  }
}