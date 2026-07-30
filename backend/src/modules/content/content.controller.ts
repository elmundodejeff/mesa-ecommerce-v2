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
} from '@nestjs/common';
import { ContentService } from './content.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('content')
export class ContentController {
  constructor(private readonly service: ContentService) {}

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
}