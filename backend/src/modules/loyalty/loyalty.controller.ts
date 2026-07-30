import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly service: LoyaltyService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  miResumen(@Req() req: any) {
    return this.service.resumen(req.user.id);
  }
}