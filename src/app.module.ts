import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsService } from './jobs/jobs.service';
import { JobsModule } from './jobs/jobs.module';
import { ConfigModule } from '@nestjs/config';
import { ChainExecutorService } from './chain-executor/chain-executor.service';
import { ChainExecutorController } from './chain-executor/chain-executor.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsService } from './jobs/jobs.service';

@Module({
  controllers: [AppController, ChainExecutorController],
  providers: [AppService, JobsService, ChainExecutorService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    JobsModule,
  ],
})
export class AppModule {}
