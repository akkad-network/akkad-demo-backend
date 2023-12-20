import { Module } from '@nestjs/common';
import { PriceService } from './price.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [PriceService],
  exports: [PriceService],
})
export class PriceModule {}
