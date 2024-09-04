import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ScannerModule } from './scanner/scanner.module';
import { ReferralModule } from './referral/referral.module';
import { OrderOrPositionModule } from './order-or-position/order-or-position.module';
import { PricefeederModule } from './pricefeeder/pricefeeder.module';
import { ExecutorModule } from './executor/executor.module';
import { PrismaModule } from './prisma/prisma.module';
import { SynchronizerModule } from './synchronizer/synchronizer.module';
import { LiquidatorModule } from './liquidator/liquidator.module';
import { BatchtestController } from './batchtest/batchtest.controller';
import { BatchtestService } from './batchtest/batchtest.service';
import { BatchtestModule } from './batchtest/batchtest.module';
@Module({
  controllers: [AppController, BatchtestController],
  providers: [AppService, BatchtestService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ScannerModule,
    ReferralModule,
    OrderOrPositionModule,
    PricefeederModule,
    ExecutorModule,
    PrismaModule,
    SynchronizerModule,
    LiquidatorModule,
    BatchtestModule
  ],
})
export class AppModule { }
