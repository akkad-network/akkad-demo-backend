import { Module } from '@nestjs/common';
import { OrderOrPositionService } from './order-or-position.service';
import { OrderOrPositionController } from './order-or-position.controller';

@Module({
    providers: [OrderOrPositionService],
    controllers: [OrderOrPositionController],
})
export class OrderOrPositionModule { }