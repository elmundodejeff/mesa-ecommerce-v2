import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  STORAGE_PROVIDER,
} from '../../platform/storage/storage.interface';
import type { StorageProvider } from '../../platform/storage/storage.interface';
import { ContentService } from './content.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('content')
export class ContentController {
  constructor(
    private readonly service: ContentService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  // --- Config ---
  @Get('config')
  obtenerConfig() {
    return this.service.obtenerConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('config')
  actualizarConfig(@Body() dto: UpdateConfigDto) {
    return this.service.actualizarConfig(dto);
  }

  // --- Banners ---
  @Get('banners')
  listarBanners() {
    return this.service.listarBanners();
  }

  @UseGuards(JwtAuthGuard)
  @Post('banners')
  crearBanner(@Body() dto: CreateBannerDto) {
    return this.service.crearBanner(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('banners/:id')
  actualizarBanner(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBannerDto,
  ) {
    return this.service.actualizarBanner(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('banners/:id')
  eliminarBanner(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminarBanner(id);
  }

  // --- Menu ---
  @Get('menu')
  listarMenu() {
    return this.service.listarMenu();
  }

  @UseGuards(JwtAuthGuard)
  @Post('menu')
  crearMenu(@Body() dto: CreateMenuDto) {
    return this.service.crearMenu(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('menu/:id')
  actualizarMenu(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuDto,
  ) {
    return this.service.actualizarMenu(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('menu/:id')
  eliminarMenu(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminarMenu(id);
  }

  // --- Subida de imagenes para contenido ---
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('imagen'))
  async subirImagen(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const url = await this.storage.save(file, 'contenido');
    return { url };
  }


  // --- Banco de avatares ---
  @Get('avatares')
  listarAvatares() {
    return this.service.listarAvatares();
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatares')
  @UseInterceptors(FileInterceptor('imagen'))
  async subirAvatarBanco(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const url = await this.storage.save(file, 'avatares-banco');
    return this.service.crearAvatar(url);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('avatares/:id')
  async eliminarAvatarBanco(@Param('id', ParseIntPipe) id: number) {
    const avatar = await this.service.obtenerAvatar(id);
    if (avatar) {
      await this.storage.delete(avatar.url);
    }
    return this.service.eliminarAvatar(id);
  }

}