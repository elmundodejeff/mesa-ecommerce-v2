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
  idioma?: string;
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

  buscar(filtros: {
    texto?: string;
    categoriaId?: number;
    idioma?: string;
    precioMin?: number;
    precioMax?: number;
    orden?: string;
  }) {
    const where: any = {};

    if (filtros.texto) {
      where.OR = [
        { nombre: { contains: filtros.texto, mode: "insensitive" } },
        { descripcion: { contains: filtros.texto, mode: "insensitive" } },
      ];
    }
    if (filtros.categoriaId) {
      where.categorias = { some: { id: filtros.categoriaId } };
    }
    if (filtros.idioma) {
      where.idioma = filtros.idioma;
    }
    if (filtros.precioMin !== undefined || filtros.precioMax !== undefined) {
      where.precio = {};
      if (filtros.precioMin !== undefined) where.precio.gte = filtros.precioMin;
      if (filtros.precioMax !== undefined) where.precio.lte = filtros.precioMax;
    }

    let orderBy: any = { id: "desc" };
    if (filtros.orden === "precio_asc") orderBy = { precio: "asc" };
    else if (filtros.orden === "precio_desc") orderBy = { precio: "desc" };
    else if (filtros.orden === "nombre") orderBy = { nombre: "asc" };

    return this.prisma.producto.findMany({
      where,
      orderBy,
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