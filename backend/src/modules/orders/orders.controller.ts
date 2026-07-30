import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtGuard } from '../auth/optional-jwt.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  // Checkout: guard opcional. Si viene token, asocia userId y activa puntos.
  @UseGuards(OptionalJwtGuard)
  @Post('checkout')
  checkout(@Body() dto: CreateOrdenDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.checkout(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoDto,
  ) {
    return this.service.cambiarEstado(id, dto.estado);
  }
}