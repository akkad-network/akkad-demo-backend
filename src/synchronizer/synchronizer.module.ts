import { Module } from '@nestjs/common';
import { SynchronizerService } from './synchronizer.service';

@Module({
  providers: [SynchronizerService],
})
export class SynchronizerModule { }
