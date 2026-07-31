import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConfigRepository } from './repositories/config.repository';
import { BannerRepository } from './repositories/banner.repository';
import { MenuRepository } from './repositories/menu.repository';
import { AvatarRepository } from './repositories/avatar.repository';
import { UpdateConfigDto } from './dto/update-config.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class ContentService {
  constructor(
    private readonly config: ConfigRepository,
    private readonly banner: BannerRepository,
    private readonly menu: MenuRepository,
    private readonly avatar: AvatarRepository,
  ) {}

  // --- Config (singleton) ---
  obtenerConfig() {
    return this.config.obtener();
  }

  actualizarConfig(dto: UpdateConfigDto) {
    return this.config.actualizar(dto as Prisma.ConfigUpdateInput);
  }

  // --- Banners ---
  listarBanners() {
    return this.banner.findAll();
  }

  crearBanner(dto: CreateBannerDto) {
    return this.banner.create(dto);
  }

  async actualizarBanner(id: number, dto: UpdateBannerDto) {
    const existe = await this.banner.findOne(id);
    if (!existe) throw new NotFoundException(`Banner ${id} no encontrado`);
    return this.banner.update(id, dto);
  }

  async eliminarBanner(id: number) {
    const existe = await this.banner.findOne(id);
    if (!existe) throw new NotFoundException(`Banner ${id} no encontrado`);
    return this.banner.remove(id);
  }

  // --- Menu ---
  listarMenu() {
    return this.menu.findAll();
  }

  crearMenu(dto: CreateMenuDto) {
    const { padreId, ...resto } = dto;
    const data: any = { ...resto };
    if (padreId) {
      data.padre = { connect: { id: padreId } };
    }
    return this.menu.create(data);
  }

  async actualizarMenu(id: number, dto: UpdateMenuDto) {
    const existe = await this.menu.findOne(id);
    if (!existe) throw new NotFoundException(`Item ${id} no encontrado`);
    const { padreId, ...resto } = dto;
    const data: any = { ...resto };
    if (padreId !== undefined) {
      data.padre = padreId
        ? { connect: { id: padreId } }
        : { disconnect: true };
    }
    return this.menu.update(id, data);
  }

  async eliminarMenu(id: number) {
    const existe = await this.menu.findOne(id);
    if (!existe) throw new NotFoundException(`Item ${id} no encontrado`);
    return this.menu.remove(id);
  }

  // --- Banco de avatares ---
  listarAvatares() {
    return this.avatar.findAll();
  }

  crearAvatar(url: string) {
    return this.avatar.create(url);
  }

  async eliminarAvatar(id: number) {
    const existe = await this.avatar.findOne(id);
    if (!existe) throw new NotFoundException(`Avatar ${id} no encontrado`);
    return this.avatar.remove(id);
  }

  obtenerAvatar(id: number) {
    return this.avatar.findOne(id);
  }

}