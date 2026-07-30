import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.users.create(dto);
    return this.firmarToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciales invalidas');
    }
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Credenciales invalidas');
    }
    return this.firmarToken(user);
  }

  private firmarToken(user: {
    id: string;
    email: string;
    rol: string;
    nombre?: string | null;
    avatar?: string | null;
  }) {
    const payload = { sub: user.id, email: user.email, rol: user.rol };
    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol,
        nombre: user.nombre ?? null,
        avatar: user.avatar ?? null,
      },
    };
  }
}