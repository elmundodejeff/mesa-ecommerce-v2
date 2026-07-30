import { Module } from '@nestjs/common';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyRepository } from './loyalty.repository';

@Module({
  controllers: [LoyaltyController],
  providers: [LoyaltyService, LoyaltyRepository],
  exports: [LoyaltyService, LoyaltyRepository],
})
export class LoyaltyModule {}