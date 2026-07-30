import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  // No lanza si no hay token: devuelve el user si existe, o undefined
  handleRequest(err: any, user: any) {
    return user || undefined;
  }
}