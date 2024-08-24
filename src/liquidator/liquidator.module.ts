import { Module } from '@nestjs/common';
import { LiquidatorService } from './liquidator.service';

@Module({
  providers: [LiquidatorService],
  exports: [LiquidatorService]
})
export class LiquidatorModule { }
