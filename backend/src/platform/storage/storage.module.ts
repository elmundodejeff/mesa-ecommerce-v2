import { Module } from '@nestjs/common';
import { STORAGE_PROVIDER } from './storage.interface';
import { LocalStorageProvider } from './local-storage.provider';

@Module({
  providers: [
    {
      provide: STORAGE_PROVIDER,
      // Fase 2: cambiar LocalStorageProvider por GcsStorageProvider aqui
      useClass: LocalStorageProvider,
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}