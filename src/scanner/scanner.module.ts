import { Module } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { ScannerController } from './scanner.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
@Module({
    imports: [ScheduleModule.forRoot()],
    controllers: [ScannerController],
    providers: [ScannerService, PrismaService],
})
export class ScannerModule { }