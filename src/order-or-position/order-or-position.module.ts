import { Module } from '@nestjs/common';
import { OrderOrPositionService } from './order-or-position.service';
import { OrderOrPositionController } from './order-or-position.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    providers: [OrderOrPositionService, PrismaService],
    controllers: [OrderOrPositionController],
})
export class OrderOrPositionModule { }