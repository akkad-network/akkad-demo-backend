import { Controller, Get, Query } from '@nestjs/common';
import { OrderOrPositionService } from './order-or-position.service';

@Controller('orderposition')
export class OrderOrPositionController {

    constructor(private readonly orderOrPositionService: OrderOrPositionService) { }

    @Get('position')
    async getAll(
        @Query('owner') owner: string,
        @Query('vault') vault: string,
        @Query('symbol') symbol: string,
    ) {
        return this.orderOrPositionService.findAllUserPositions(owner, vault, symbol);
    }

    @Get('decrease')
    async getDecreaseOrders(
        @Query('owner') owner: string,
        @Query('vault') vault: string,
        @Query('symbol') symbol: string,
    ) {
        return this.orderOrPositionService.findDecreaseOrders(owner, vault, symbol);
    }

    @Get('increase')
    async getIncreaseOrders(
        @Query('owner') owner: string,
        @Query('vault') vault: string,
        @Query('symbol') symbol: string,
    ) {
        return this.orderOrPositionService.findIncreaseOrders(owner, vault, symbol);
    }
}
