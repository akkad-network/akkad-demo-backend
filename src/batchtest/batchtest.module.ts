import { Module } from '@nestjs/common';
import { SynchronizerModule } from 'src/synchronizer/synchronizer.module';

@Module({
    imports: [SynchronizerModule]
})
export class BatchtestModule { }
