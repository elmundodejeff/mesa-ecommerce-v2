import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto, AvatarBancoDto } from './dto/update-user.dto';
import { STORAGE_PROVIDER } from '../../platform/storage/storage.interface';
import type { StorageProvider } from '../../platform/storage/storage.interface';
import { Inject } from '@nestjs/common';

// Forma del usuario que passport-jwt inyecta en req.user
interface ReqConUsuario {
  user: { id: string; email: string; rol: string };
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly service: UsersService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: ReqConUsuario) {
    const user = await this.service.findById(req.user.id);
    if (!user) return null;
    // No exponer el password
    const { password, ...resto } = user;
    void password;
    return resto;
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async subirAvatar(
    @Req() req: ReqConUsuario,
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
    // Borra el avatar anterior si existia
    const actual = await this.service.findById(req.user.id);
    if (actual?.avatar) {
      await this.storage.delete(actual.avatar);
    }

    const url = await this.storage.save(file, 'avatares');
    const user = await this.service.actualizarAvatar(req.user.id, url);
    return { avatar: user.avatar };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async actualizarDatos(
    @Req() req: ReqConUsuario,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.service.actualizarDatos(req.user.id, dto);
    const { password, ...resto } = user;
    void password;
    return resto;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/avatar-banco')
  async elegirAvatarBanco(
    @Req() req: ReqConUsuario,
    @Body() dto: AvatarBancoDto,
  ) {
    const user = await this.service.actualizarAvatar(req.user.id, dto.url);
    return { avatar: user.avatar };
  }

}