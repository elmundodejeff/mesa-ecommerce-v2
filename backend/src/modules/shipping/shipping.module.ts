import { Module } from '@nestjs/common';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { ChilexpressProvider } from './chilexpress.provider';
import { PrismaService } from '../../shared/prisma.service';

@Module({
  controllers: [ShippingController],
  providers: [ShippingService, ChilexpressProvider, PrismaService],
  exports: [ShippingService],
})
export class ShippingModule {}
