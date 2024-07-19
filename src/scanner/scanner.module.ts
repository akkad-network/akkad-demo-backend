import { Module } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { ScannerController } from './scanner.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { OrderOrPositionService } from 'src/order-or-position/order-or-position.service';
@Module({
    imports: [ScheduleModule.forRoot()],
    controllers: [ScannerController],
    providers: [ScannerService, PrismaService, OrderOrPositionService],
})
export class ScannerModule { }