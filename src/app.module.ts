import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PriceModule } from './price/price.module';
import { JobsModule } from './jobs/jobs.module';
import { RedisModule } from './redis/redis.module';
import { ChainExecutorModule } from './chain-executor/chain-executor.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  controllers: [AppController],
  providers: [AppService, PrismaService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    PriceModule,
    JobsModule,
    ChainExecutorModule,
  ],
})
export class AppModule {}
