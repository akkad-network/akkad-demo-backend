import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { JobsService } from './jobs/jobs.service';
// import { JobsModule } from './jobs/jobs.module';
import { ConfigModule } from '@nestjs/config';
import { ChainExecutorService } from './chain-executor/chain-executor.service';
import { ChainExecutorController } from './chain-executor/chain-executor.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { PriceModule } from './price/price.module';
import { PriceService } from './price/price.service';

@Module({
  controllers: [AppController, ChainExecutorController],
  providers: [AppService, ChainExecutorService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PriceModule,
    // JobsModule,
  ],
})
export class AppModule {}
