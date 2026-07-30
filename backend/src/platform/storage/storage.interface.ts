export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

export interface StorageProvider {
  /**
   * Guarda un archivo y devuelve la URL publica para acceder a el.
   * @param file archivo recibido por Multer
   * @param folder subcarpeta logica (ej. "productos", "banners")
   */
  save(file: Express.Multer.File, folder: string): Promise<string>;

  /**
   * Elimina un archivo a partir de su URL publica.
   */
  delete(url: string): Promise<void>;
}