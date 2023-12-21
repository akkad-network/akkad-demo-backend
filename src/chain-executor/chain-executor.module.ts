import { Module } from '@nestjs/common';
import { ChainExecutorService } from './chain-executor.service';
import { PriceModule } from 'src/price/price.module';

@Module({
  imports: [PriceModule],
  providers: [ChainExecutorService],
  exports: [ChainExecutorService],
})
export class ChainExecutorModule {}
