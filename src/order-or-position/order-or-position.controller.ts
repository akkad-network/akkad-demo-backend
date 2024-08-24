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

    @Get('getAllVaultConfig')
    async getAllVaultConfig() {
        return this.orderOrPositionService.fetchAllVaultConfig()
    }

    @Get('getAllSymbolConfig')
    async getAllSymbolConfig() {
        return this.orderOrPositionService.fetchAllSymbolConfig()
    }

    @Get('getAllLpToken')
    async getAllLpToken() {
        return this.orderOrPositionService.fetchAllLpTokenRecords()
    }

    @Get("get7DaysAPR")
    async get7DaysAPR() {
        return this.orderOrPositionService.get7DaysLpTokenApr()
    }

    @Get("get24HoursPriceChange")
    async get24HoursPriceChange(
        @Query('symbol') symbol: string,
    ) {
        return this.orderOrPositionService.fetch24HoursChange(symbol)
    }
}

//https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,dogecoin,solana,avalanche-2,aptos,pepe&vs_currencies=usd&include_24hr_change=true