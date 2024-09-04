import { Module } from '@nestjs/common';
import { SynchronizerService } from './synchronizer.service';
import { SynchronizerController } from './synchronizer.controller';

@Module({
  providers: [SynchronizerService],
  exports: [SynchronizerService],
  controllers: [SynchronizerController],
})
export class SynchronizerModule { }
