import { Controller, Get, Query } from '@nestjs/common';
import { OrderOrPositionService } from './order-or-position.service';
import { AggregatePositionRecord } from '@prisma/client';

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

    @Get('get8HoursFundingRateAver')
    async getLast8HoursFundingRateAver(
        @Query('symbol') symbol: string,
    ) {
        return this.orderOrPositionService.getLast8HoursFundingRateAver(symbol);
    }


    @Get('get8HoursReservingRateAver')
    async getLast8HoursReservingRateAver(
        @Query('vault') vault: string,
    ) {
        return this.orderOrPositionService.getLast8HoursReservingRateAver(vault);
    }

    @Get('syncHandles')
    async syncHandles() {
        return this.orderOrPositionService.syncHandles()
    }

}
