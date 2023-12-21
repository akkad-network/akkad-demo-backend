import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { PriceModule } from 'src/price/price.module';
import { ChainExecutorModule } from 'src/chain-executor/chain-executor.module';

@Module({
  imports: [PriceModule, ChainExecutorModule],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
