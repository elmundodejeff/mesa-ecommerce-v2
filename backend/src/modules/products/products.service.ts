import {
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { STORAGE_PROVIDER } from '../../platform/storage/storage.interface';
import type { StorageProvider } from '../../platform/storage/storage.interface';

@Injectable()
export class ProductsService {
  constructor(
    private readonly repo: ProductsRepository,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  findAll() {
    return this.repo.findAll();
  }

  buscar(filtros: {
    texto?: string;
    categoriaId?: number;
    idioma?: string;
    precioMin?: number;
    precioMax?: number;
    orden?: string;
  }) {
    return this.repo.buscar(filtros);
  }

  async findOne(id: number) {
    const producto = await this.repo.findOne(id);
    if (!producto) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }
    return producto;
  }

  create(dto: CreateProductoDto) {
    return this.repo.create(dto);
  }

  async update(id: number, dto: UpdateProductoDto) {
    await this.findOne(id);
    return this.repo.update(id, dto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.repo.remove(id);
  }

  // ===== Imagenes =====

  async subirImagenes(productoId: number, files: Express.Multer.File[]) {
    // Verifica que el producto exista (lanza 404 si no)
    await this.findOne(productoId);

    // Continua la numeracion de orden desde la ultima imagen
    let orden = (await this.repo.maxOrdenImagen(productoId)) + 1;

    const creadas: Awaited<ReturnType<typeof this.repo.crearImagen>>[] = [];
    for (const file of files) {
      const url = await this.storage.save(file, 'productos');
      const imagen = await this.repo.crearImagen(productoId, url, orden);
      creadas.push(imagen);
      orden++;
    }
    return creadas;
  }

  async borrarImagen(imagenId: number) {
    const imagen = await this.repo.findImagen(imagenId);
    if (!imagen) {
      throw new NotFoundException(`Imagen ${imagenId} no encontrada`);
    }
    // Borra primero el archivo fisico, luego el registro
    await this.storage.delete(imagen.url);
    return this.repo.borrarImagen(imagenId);
  }
}