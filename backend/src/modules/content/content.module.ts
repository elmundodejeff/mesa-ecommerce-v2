import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ConfigRepository } from './repositories/config.repository';
import { BannerRepository } from './repositories/banner.repository';
import { MenuRepository } from './repositories/menu.repository';

@Module({
  controllers: [ContentController],
  providers: [
    ContentService,
    ConfigRepository,
    BannerRepository,
    MenuRepository,
  ],
})
export class ContentModule {}