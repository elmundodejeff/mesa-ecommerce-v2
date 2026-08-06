import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { OrdersExpirationService } from './orders.expiration';
import { DiscountsModule } from '../discounts/discounts.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { ShippingModule } from '../shipping/shipping.module';
@Module({
  imports: [DiscountsModule, LoyaltyModule, ShippingModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, OrdersExpirationService],
  exports: [OrdersService],
})
export class OrdersModule {}
