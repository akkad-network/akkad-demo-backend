import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service';
import { ScannerModule } from './scanner/scanner.module';
import { ReferralModule } from './referral/referral.module';
import { OrderOrPositionService } from './order-or-position/order-or-position.service';
import { OrderOrPositionController } from './order-or-position/order-or-position.controller';
import { OrderOrPositionModule } from './order-or-position/order-or-position.module';
@Module({
  controllers: [AppController, OrderOrPositionController],
  providers: [AppService, PrismaService, OrderOrPositionService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ScannerModule,
    ReferralModule,
    OrderOrPositionModule
  ],
})
export class AppModule { }
