import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { EntradaRepository } from './repositories/entrada.repository';
import { ComentarioRepository } from './repositories/comentario.repository';

@Module({
  controllers: [BlogController],
  providers: [BlogService, EntradaRepository, ComentarioRepository],
})
export class BlogModule {}