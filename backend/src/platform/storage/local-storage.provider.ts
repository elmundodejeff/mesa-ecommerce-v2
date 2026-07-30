import { Injectable } from '@nestjs/common';
import { StorageProvider } from './storage.interface';
import { promises as fs } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  // Raiz fisica donde se escriben los archivos: backend/uploads
  private readonly uploadsRoot = join(process.cwd(), 'uploads');

  async save(file: Express.Multer.File, folder: string): Promise<string> {
    const ext = extname(file.originalname).toLowerCase();
    const filename = `${randomUUID()}${ext}`;
    const folderPath = join(this.uploadsRoot, folder);

    // Crea la subcarpeta si no existe
    await fs.mkdir(folderPath, { recursive: true });

    // Escribe el archivo a disco
    await fs.writeFile(join(folderPath, filename), file.buffer);

    // Devuelve la URL publica relativa (el front la resuelve contra el host)
    return `/uploads/${folder}/${filename}`;
  }

  async delete(url: string): Promise<void> {
    // url viene como /uploads/productos/xxx.jpg -> quitamos el prefijo /uploads/
    const relative = url.replace(/^\/uploads\//, '');
    const filePath = join(this.uploadsRoot, relative);
    try {
      await fs.unlink(filePath);
    } catch {
      // Si el archivo ya no existe, no es error fatal
    }
  }
}